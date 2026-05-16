import GLib from "gi://GLib"
import Gio from "gi://Gio?version=2.0"

export type NowPlayingState =
    | { available: true; text: string }
    | { available: false; error: string }

export type NowPlayingSectionState =
    | {
          available: true
          players: string[]
          selectedPlayer: string | null
          selectedPlayerLabel: string
          trackText: string
          controlsEnabled: boolean
          disabledReason: string | null
      }
    | { available: false; error: string }

let selectedPlayerId: string | null = null

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

function formatTrack(status: string, artist: string, title: string): string {
    if (!title.trim()) return "Nothing playing"
    const artistPart = artist.trim() ? `${artist.trim()} - ` : ""
    const statusPrefix = status.trim().toLowerCase() === "paused" ? "Paused: " : ""
    return `${statusPrefix}${artistPart}${title.trim()}`
}

function listPlayers(): { ok: true; players: string[] } | { ok: false; error: string } {
    const [ok, output] = runPlayerctl(["-l"])
    if (!ok) {
        if (output.includes("No players found") || output.includes("No player could handle this command")) {
            return { ok: true, players: [] }
        }
        return { ok: false, error: output || "playerctl -l failed" }
    }
    const players = output
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    return { ok: true, players }
}

function readTrack(player: string): { ok: true; text: string } | { ok: false; error: string } {
    const [ok, output] = runPlayerctl(["-p", player, "metadata", "--format", "{{status}}|{{artist}}|{{title}}"])
    if (!ok) return { ok: false, error: output || "playerctl metadata failed" }
    const [status = "", artist = "", title = ""] = output.split("|")
    return { ok: true, text: formatTrack(status, artist, title) }
}

function normalizeSelectedPlayer(players: string[]): string | null {
    if (players.length === 0) {
        selectedPlayerId = null
        return null
    }
    if (selectedPlayerId && players.includes(selectedPlayerId)) return selectedPlayerId
    selectedPlayerId = players[0]
    return selectedPlayerId
}

function playerLabel(player: string | null): string {
    if (!player) return "None"
    const normalized = player.replace("org.mpris.MediaPlayer2.", "")
    return normalized || player
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
    return { available: true, text: formatTrack(status, artist, title) }
}

export function getNowPlayingSectionState(): NowPlayingSectionState {
    if (!GLib.find_program_in_path("playerctl")) {
        return { available: false, error: "playerctl not found in PATH" }
    }

    const listed = listPlayers()
    if (!listed.ok) return { available: false, error: listed.error }

    const selected = normalizeSelectedPlayer(listed.players)
    if (!selected) {
        return {
            available: true,
            players: [],
            selectedPlayer: null,
            selectedPlayerLabel: "None",
            trackText: "Nothing playing",
            controlsEnabled: false,
            disabledReason: "No players available",
        }
    }

    const track = readTrack(selected)
    if (!track.ok) {
        return {
            available: true,
            players: listed.players,
            selectedPlayer: selected,
            selectedPlayerLabel: playerLabel(selected),
            trackText: "Nothing playing",
            controlsEnabled: false,
            disabledReason: track.error,
        }
    }

    return {
        available: true,
        players: listed.players,
        selectedPlayer: selected,
        selectedPlayerLabel: playerLabel(selected),
        trackText: track.text,
        controlsEnabled: true,
        disabledReason: null,
    }
}

export function selectNextPlayer(): void {
    const listed = listPlayers()
    if (!listed.ok || listed.players.length === 0) {
        selectedPlayerId = null
        return
    }
    const current = normalizeSelectedPlayer(listed.players)
    const index = current ? listed.players.indexOf(current) : -1
    selectedPlayerId = listed.players[(index + 1) % listed.players.length]
}

export function selectPreviousPlayer(): void {
    const listed = listPlayers()
    if (!listed.ok || listed.players.length === 0) {
        selectedPlayerId = null
        return
    }
    const current = normalizeSelectedPlayer(listed.players)
    const index = current ? listed.players.indexOf(current) : 0
    selectedPlayerId = listed.players[(index - 1 + listed.players.length) % listed.players.length]
}

export function runNowPlayingTransport(action: "play-pause" | "next" | "previous"): { ok: boolean; error?: string } {
    const listed = listPlayers()
    if (!listed.ok) return { ok: false, error: listed.error }
    const selected = normalizeSelectedPlayer(listed.players)
    if (!selected) return { ok: false, error: "No players available" }

    const [ok, output] = runPlayerctl(["-p", selected, action])
    if (!ok) return { ok: false, error: output || `playerctl ${action} failed` }
    return { ok: true }
}
