import Wp from "gi://AstalWp"
import { Gtk } from "astal/gtk4"

export function Volume_icon() {
    const speaker = Wp.get_default()?.audio.defaultSpeaker!
    
    // Create widgets
    const button = Gtk.Button.new();
    const box = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6);
    const image = Gtk.Image.new_from_icon_name("audio-card-symbolic"); // fallback icon name
    const label = Gtk.Label.new("Loading...");

    box.append(image);
    box.append(label);
    button.set_child(box);

    // Update UI based on speaker state
    const updateButtonLabel = () => {
        const isMuted = speaker.get_mute();
        
        // Set icon based on mute state only
        if (isMuted) {
            image.set_from_icon_name("audio-volume-muted-symbolic");
        } else {
            image.set_from_icon_name("audio-card-symbolic");
        }
        
        // Update label text
        if (isMuted) {
            label.set_label("Muted");
        } else {
            const volumePercentage = Math.round(speaker.volume * 100);
            label.set_label(`${volumePercentage}%`);
        }
    }

    // Initial label update
    updateButtonLabel();

    // Watch for updates
    speaker.connect("notify::volume", updateButtonLabel);
    speaker.connect("notify::is-muted", updateButtonLabel);
    speaker.connect("notify::mute", updateButtonLabel); // if needed

    // Click handler
    button.connect("clicked", () => {
        console.log(`Volume level: ${Math.round(speaker.volume * 100)}%`);
        console.log(`Speaker description: ${speaker.description}`);
    });

    return button;
}
