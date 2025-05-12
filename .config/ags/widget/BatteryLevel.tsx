import Battery from "gi://AstalBattery"

export function BatteryLevel() {
    console.log("Initializing BatteryLevel component...")

    const bat = Battery.get_default()

    if (!bat) {
        console.error("Battery object is NULL")
        return <box className="Battery" visible={true}>
            <box className="BatteryIcon" css="width: 24px; height: 12px; border: 2px solid gray; border-radius: 2px;">
                <box css="width: 4px; height: 6px; background: gray; margin-left: 2px;" />
            </box>
            <label label="Battery not available" />
        </box>
    }

    console.log("Battery object initialized:", bat)

    // Use instance methods to retrieve battery information
    const isPresent = bat.get_is_present?.() ?? false
    const percentage = bat.get_percentage?.() ?? -1

    console.log("Battery isPresent:", isPresent)
    console.log("Battery percentage:", percentage)

    if (!isPresent) {
        console.warn("Battery is not present")
        return <box className="Battery" visible={true}>
            <box className="BatteryIcon" css="width: 24px; height: 12px; border: 2px solid gray; border-radius: 2px;">
                <box css="width: 4px; height: 6px; background: gray; margin-left: 2px;" />
            </box>
            <label label="Battery not present" />
        </box>
    }

    // Calculate the width of the inner bar based on the percentage
    const barWidth = Math.max(0, Math.min(percentage * 100, 100)) // Clamp between 0 and 100

    console.log("Rendering BatteryLevel component with percentage:", percentage)

    return (
        <box className="Battery" visible={true}>
            <box className="BatteryIcon" css="width: 24px; height: 12px; border: 2px solid gray; border-radius: 2px; position: relative;">
                <box css={`width: ${barWidth}%; height: 100%; background: ${percentage > 0.2 ? 'green' : 'red'};`} />
                <box css="width: 4px; height: 6px; background: gray; position: absolute; right: -6px; top: 3px;" />
            </box>
            <label label={percentage >= 0 ? `${Math.floor(percentage * 100)} %` : "N/A"} />
        </box>
    )
}
