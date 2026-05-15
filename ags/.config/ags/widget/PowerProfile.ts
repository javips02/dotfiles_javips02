import GLib from "gi://GLib"
import Gio from "gi://Gio?version=2.0"

export type PowerProfile = "balanced" | "performance" | "power-saver"

export type PowerProfileState =
    | { available: true; profile: PowerProfile }
    | { available: false; error: string }

const subscribers = new Set<() => void>()

function runPowerProfilesctl(args: string[]): [boolean, string] {
    if (!GLib.find_program_in_path("powerprofilesctl")) {
        return [false, "powerprofilesctl not found in PATH"]
    }

    const command = Gio.Subprocess.new(
        ["powerprofilesctl", ...args],
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE | Gio.SubprocessFlags.SEARCH_PATH,
    )
    const [, stdout, stderr] = command.communicate_utf8(null, null)
    if (!command.get_successful()) {
        return [false, (stderr || stdout || "powerprofilesctl failed").trim()]
    }
    return [true, (stdout || "").trim()]
}

function parseProfile(raw: string): PowerProfile | null {
    if (raw === "balanced" || raw === "performance" || raw === "power-saver") return raw
    return null
}

export function powerProfileToLabel(profile: PowerProfile): string {
    if (profile === "balanced") return "Balanced"
    if (profile === "performance") return "Performance"
    return "Power Saver"
}

export function getPowerProfileState(): PowerProfileState {
    const [ok, output] = runPowerProfilesctl(["get"])
    if (!ok) return { available: false, error: output }
    const profile = parseProfile(output)
    if (!profile) return { available: false, error: `Unexpected profile: ${output}` }
    return { available: true, profile }
}

export function setPowerProfile(profile: PowerProfile): { ok: boolean; error?: string } {
    const [ok, output] = runPowerProfilesctl(["set", profile])
    if (!ok) return { ok: false, error: output }
    notifyPowerProfileChanged()
    return { ok: true }
}

export function subscribePowerProfileChanged(callback: () => void): () => void {
    subscribers.add(callback)
    return () => {
        subscribers.delete(callback)
    }
}

export function notifyPowerProfileChanged() {
    subscribers.forEach((callback) => callback())
}
