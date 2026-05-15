import GLib from "gi://GLib"
import Gio from "gi://Gio?version=2.0"

export type NowPlayingState =
    | { available: true; text: string }
    | { available: false; error: string }

function runPlayerctl(args: string[]): [boolean, string] {
    const command = Gio.Subprocess.new(
        ["playerctl", ...args],
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE | Gio.SubprocessFlags.SEARCH_PATH,
    )
    const [, stdout, stderr] = command.communicate_utf8(null, null)
    const output = (stdout || stderr || "").trim()
    if (!command.get_successful()) return [false, output]
    return [true, output]
}

export function getNowPlayingState(): NowPlayingState {
    if (!GLib.find_program_in_path("playerctl")) {
        return { available: false, error: "playerctl not found in PATH" }
    }

    const [ok, output] = runPlayerctl(["metadata", "--format", "{{status}}|{{artist}}|{{title}}"])
    if (!ok) {
        if (output.includes("No players found") || output.includes("No player could handle this command")) {
            return { available: true, text: "Nothing playing" }
        }
        return { available: false, error: output || "playerctl metadata failed" }
    }

    const [status = "", artist = "", title = ""] = output.split("|")
    if (!title.trim()) return { available: true, text: "Nothing playing" }
    const artistPart = artist.trim() ? `${artist.trim()} - ` : ""
    const statusPrefix = status.trim().toLowerCase() === "paused" ? "Paused: " : ""
    return { available: true, text: `${statusPrefix}${artistPart}${title.trim()}` }
}
