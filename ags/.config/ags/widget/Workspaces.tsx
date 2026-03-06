import Hyprland from "gi://AstalHyprland"
import { bind } from "astal"

export function Workspaces() {
    const hypr = Hyprland.get_default()

    return (
        <box cssName="Workspaces">
            {bind(hypr, "workspaces").as(wss =>
                wss
                    .filter(ws => !(ws.id >= -99 && ws.id <= -2)) // Filter out special workspaces
                    .sort((a, b) => a.id - b.id) // Sort by workspace ID
                    .map(ws => (
                        <button
                            cssClasses={bind(hypr, "focusedWorkspace").as(fw =>
                                ws === fw ? ["focused"] : []
                            )}
                            onClicked={() => ws.focus()}
                            label={`${ws.id}`}
                        />
                    ))
            )}
        </box>
    )
}