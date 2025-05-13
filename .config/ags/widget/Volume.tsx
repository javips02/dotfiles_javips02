import Wp from "gi://AstalWp"
import { Gtk } from "astal/gtk4"

export function Volume_icon() {
    const speaker = Wp.get_default()?.audio.defaultSpeaker!
    
    // Create a button with the volume percentage as label
    const volumePercentage = Math.round(speaker.volume * 100);
    // Ensure the label is explicitly a string
    const labelText = volumePercentage + "%";
    const button = Gtk.Button.new_with_label(labelText);
    
    // Update the button label when volume changes
    speaker.connect("notify::volume", () => {
        const newVolumePercentage = Math.round(speaker.volume * 100);
        button.set_label(newVolumePercentage + "%");
        //console.log(`Volume updated: ${newVolumePercentage}%`);
    });
    
    // Define the callback function
    const onButtonClicked = () => {
        console.log(`Volume level: ${Math.round(speaker.volume * 100)}%`);
        console.log(`Speaker description: ${speaker.description}`);
    };
    
    // Connect the clicked signal with the callback function
    button.connect("clicked", onButtonClicked);
    
    return button;
}