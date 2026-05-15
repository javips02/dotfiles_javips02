import GLib from "gi://GLib?version=2.0"
import Gio from "gi://Gio?version=2.0"

type BluetoothAllowedAction =
    | "show"
    | "power-on"
    | "power-off"
    | "scan-on"
    | "scan-off"
    | "devices"
    | "paired-devices"
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

const subscribers = new Set<() => void>()

const operationState: BluetoothOperationState = {
    busy: false,
    currentAction: null,
    lastError: null,
}

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
    if (action === "paired-devices") return ["paired-devices"]
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
