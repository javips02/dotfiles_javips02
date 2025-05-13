import Battery from "gi://AstalBattery"
import { Gtk } from "astal/gtk4"
import { bind } from "astal"

export function Battery_icon() {
    const battery = Battery.get_default();
    
    // Create a button with the battery percentage as label
    const button = Gtk.Button.new_with_label(`${battery.percentage*100}%`)
    
    // Define the callback function
    const onButtonClicked = () => {
        console.log(`Battery percentage: ${battery.percentage*100}%`)
    }
    
    // Connect the clicked signal with the callback function
    button.connect("clicked", onButtonClicked)
    
    return button
}