import GLib from "gi://GLib?version=2.0"
import Gio from "gi://Gio?version=2.0"

type BluetoothAllowedAction =
    | "show"
    | "power-on"
    | "power-off"
    | "scan-on"
    | "scan-off"
    | "devices"
    | "info"
    | "connect"
    | "disconnect"
    | "pair"
    | "trust"

type BluetoothActionResult = { ok: true; output: string } | { ok: false; error: string; busy?: boolean }

export type BluetoothOperationState = {
    busy: boolean
    currentAction: string | null
    lastError: string | null
}

export type BluetoothSummaryState =
    | { available: true; text: string }
    | { available: false; error: string }

export type BluetoothDevice = {
    address: string
    name: string
}

export type BluetoothDeviceGroupsState =
    | {
          available: true
          connected: BluetoothDevice[]
          paired: BluetoothDevice[]
          discovered: BluetoothDevice[]
      }
    | { available: false; error: string }

export type BluetoothScanSessionState = {
    active: boolean
    endsAtUnixMs: number | null
}

export type BluetoothDeviceActionResult =
    | { ok: true; output: string; escalated?: boolean }
    | { ok: false; error: string; escalated?: boolean; busy?: boolean }

const subscribers = new Set<() => void>()

const operationState: BluetoothOperationState = {
    busy: false,
    currentAction: null,
    lastError: null,
}

const scanSessionState: BluetoothScanSessionState = {
    active: false,
    endsAtUnixMs: null,
}
let scanSessionTimeoutId: number | null = null

function notifyChanged() {
    subscribers.forEach((callback) => callback())
}

function setLastError(error: string | null) {
    operationState.lastError = error
    notifyChanged()
}

function withActionLock(action: string, run: () => BluetoothActionResult): BluetoothActionResult {
    if (operationState.busy) {
        return { ok: false, error: `Bluetooth action already running: ${operationState.currentAction || "unknown"}`, busy: true }
    }

    operationState.busy = true
    operationState.currentAction = action
    notifyChanged()

    try {
        const result = run()
        if (!result.ok) setLastError(result.error)
        else setLastError(null)
        return result
    } finally {
        operationState.busy = false
        operationState.currentAction = null
        notifyChanged()
    }
}

function runBluetoothctl(args: string[]): BluetoothActionResult {
    if (!GLib.find_program_in_path("bluetoothctl")) {
        return { ok: false, error: "bluetoothctl not found in PATH" }
    }

    const command = Gio.Subprocess.new(
        ["bluetoothctl", ...args],
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE | Gio.SubprocessFlags.SEARCH_PATH,
    )
    const [, stdout, stderr] = command.communicate_utf8(null, null)
    const output = (stdout || stderr || "").trim()
    if (!command.get_successful()) return { ok: false, error: output || "bluetoothctl command failed" }
    return { ok: true, output }
}

function actionToArgs(action: BluetoothAllowedAction, device?: string): string[] | null {
    if (action === "show") return ["show"]
    if (action === "power-on") return ["power", "on"]
    if (action === "power-off") return ["power", "off"]
    if (action === "scan-on") return ["scan", "on"]
    if (action === "scan-off") return ["scan", "off"]
    if (action === "devices") return ["devices"]
    if (!device) return null
    if (action === "info") return ["info", device]
    if (action === "connect") return ["connect", device]
    if (action === "disconnect") return ["disconnect", device]
    if (action === "pair") return ["pair", device]
    if (action === "trust") return ["trust", device]
    return null
}

export function runBluetoothAction(action: BluetoothAllowedAction, device?: string): BluetoothActionResult {
    const args = actionToArgs(action, device)
    if (!args) {
        return { ok: false, error: `Action ${action} requires a valid device address` }
    }
    return withActionLock(action, () => runBluetoothctl(args))
}

function parseDeviceList(output: string): BluetoothDevice[] {
    return output
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("Device "))
        .map((line) => {
            const [, address = "", ...nameParts] = line.split(/\s+/)
            return { address, name: nameParts.join(" ") || address }
        })
        .filter((device) => !!device.address)
}

function listBluetoothDevices(filter?: "Paired" | "Connected" | "Trusted" | "Bonded"): BluetoothActionResult {
    const args = filter ? ["devices", filter] : ["devices"]
    return withActionLock(`devices${filter ? `-${filter}` : ""}`, () => runBluetoothctl(args))
}

export function getBluetoothDeviceGroupsState(): BluetoothDeviceGroupsState {
    const allResult = listBluetoothDevices()
    if (!allResult.ok) return { available: false, error: allResult.error }
    const connectedResult = listBluetoothDevices("Connected")
    if (!connectedResult.ok) return { available: false, error: connectedResult.error }
    const pairedResult = listBluetoothDevices("Paired")
    if (!pairedResult.ok) return { available: false, error: pairedResult.error }

    const all = parseDeviceList(allResult.output)
    const connected = parseDeviceList(connectedResult.output)
    const paired = parseDeviceList(pairedResult.output)
    const connectedSet = new Set(connected.map((device) => device.address))
    const pairedSet = new Set(paired.map((device) => device.address))

    const pairedOnly = paired.filter((device) => !connectedSet.has(device.address))
    const discovered = all.filter((device) => !pairedSet.has(device.address))

    return { available: true, connected, paired: pairedOnly, discovered }
}

export function getBluetoothScanSessionState(): BluetoothScanSessionState {
    return { ...scanSessionState }
}

export function stopBluetoothScanSession(): BluetoothActionResult {
    const result = runBluetoothAction("scan-off")
    if (!result.ok) return result

    scanSessionState.active = false
    scanSessionState.endsAtUnixMs = null
    if (scanSessionTimeoutId !== null) {
        GLib.Source.remove(scanSessionTimeoutId)
        scanSessionTimeoutId = null
    }
    notifyChanged()
    return { ok: true, output: "Scan session stopped" }
}

export function startBluetoothScanSession(durationSeconds = 15): BluetoothActionResult {
    if (scanSessionState.active) return { ok: true, output: "Scan session already active" }

    const result = runBluetoothAction("scan-on")
    if (!result.ok) return result

    scanSessionState.active = true
    scanSessionState.endsAtUnixMs = Date.now() + durationSeconds * 1000

    if (scanSessionTimeoutId !== null) GLib.Source.remove(scanSessionTimeoutId)
    scanSessionTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, durationSeconds * 1000, () => {
        stopBluetoothScanSession()
        return false
    })

    notifyChanged()
    return { ok: true, output: `Scan session started (${durationSeconds}s)` }
}

function requiresEscalatedPairing(error: string): boolean {
    const lower = error.toLowerCase()
    return (
        lower.includes("passkey") ||
        lower.includes("pin") ||
        lower.includes("authentication") ||
        lower.includes("confirm")
    )
}

function stopScanSessionForAction(): BluetoothActionResult {
    if (!scanSessionState.active) return { ok: true, output: "Scan already idle" }
    return stopBluetoothScanSession()
}

export function connectBluetoothDevice(address: string): BluetoothDeviceActionResult {
    const stopScan = stopScanSessionForAction()
    if (!stopScan.ok) return stopScan
    return runBluetoothAction("connect", address)
}

export function disconnectBluetoothDevice(address: string): BluetoothDeviceActionResult {
    const stopScan = stopScanSessionForAction()
    if (!stopScan.ok) return stopScan
    return runBluetoothAction("disconnect", address)
}

export function pairBluetoothDevice(address: string): BluetoothDeviceActionResult {
    const stopScan = stopScanSessionForAction()
    if (!stopScan.ok) return stopScan

    const pairResult = runBluetoothAction("pair", address)
    if (!pairResult.ok) {
        if (requiresEscalatedPairing(pairResult.error)) {
            const launched = launchBluemanManager()
            if (!launched.ok) {
                return { ok: false, error: `Pairing requires confirmation; failed to launch blueman-manager: ${launched.error}` }
            }
            return { ok: true, output: "Pairing requires PIN/passkey confirmation. Escalated to blueman-manager.", escalated: true }
        }
        return pairResult
    }

    const trustResult = runBluetoothAction("trust", address)
    if (!trustResult.ok) return trustResult
    return { ok: true, output: "Paired and trusted device" }
}

export function getBluetoothSummaryState(): BluetoothSummaryState {
    const showResult = runBluetoothAction("show")
    if (!showResult.ok) {
        if (showResult.error.includes("No default controller available")) {
            return { available: true, text: "No Bluetooth adapter detected" }
        }
        return { available: false, error: showResult.error }
    }

    const poweredLine = showResult.output
        .split("\n")
        .find((line) => line.trim().startsWith("Powered:"))
        ?.trim()
    if (!poweredLine) return { available: true, text: "Controller detected" }
    if (poweredLine.endsWith("yes")) return { available: true, text: "Powered on" }
    return { available: true, text: "Powered off" }
}

export function canLaunchBluemanManager(): boolean {
    return !!GLib.find_program_in_path("blueman-manager")
}

export function launchBluemanManager(): BluetoothActionResult {
    if (!canLaunchBluemanManager()) return { ok: false, error: "blueman-manager not found in PATH" }
    Gio.Subprocess.new(["blueman-manager"], Gio.SubprocessFlags.SEARCH_PATH)
    return { ok: true, output: "Launched blueman-manager" }
}

export function getBluetoothOperationState(): BluetoothOperationState {
    return { ...operationState }
}

export function clearBluetoothLastError() {
    setLastError(null)
}

export function subscribeBluetoothOperationChanged(callback: () => void): () => void {
    subscribers.add(callback)
    return () => subscribers.delete(callback)
}
