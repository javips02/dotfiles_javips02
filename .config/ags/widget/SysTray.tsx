import Tray from "gi://AstalTray"
import { bind } from "astal"

export function SysTray() {
    const tray = Tray.get_default()

    return <box className="SysTray">
        {bind(tray, "items").as(() => {
            const items = tray.get_items() || []
            console.log("Tray items:", items) // Debug log for tray items

            return items
                .filter(item => {
                    if (!item || Object.keys(item).length === 0) {
                        console.warn("Skipping empty or undefined tray item:", item)
                        return false
                    }
                    return true
                })
                .map(item => {
                    try {
                        const tooltipMarkup = item.get_tooltip_markup?.() || ""
                        const actionGroup = item.get_action_group?.()
                        const menuModel = item.get_menu_model?.()
                        const gicon = item.get_gicon?.()

                        // Log invalid properties
                        if (!menuModel || typeof menuModel !== "object") {
                            console.warn("Invalid menuModel, skipping item:", menuModel)
                            return null
                        }
                        if (!actionGroup || typeof actionGroup !== "object") {
                            console.warn("Invalid actionGroup, skipping item:", actionGroup)
                            return null
                        }

                        // Use the activate method to ensure the item is functional
                        item.activate?.()

                        return (
                            <menubutton
                                tooltipMarkup={tooltipMarkup}
                                actionGroup={["dbusmenu", actionGroup]}
                                menuModel={menuModel}>
                                {gicon && <icon gicon={gicon} />}
                            </menubutton>
                        )
                    } catch (error) {
                        console.error("Error processing tray item:", error, item)
                        return null
                    }
                })
                .filter(Boolean) // Remove null items
        })}
    </box>
}
