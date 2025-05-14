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
        // Toggle mute state
        speaker.set_mute(!speaker.get_mute());
    });

    return button;
}

export function Mic() {
    const mic = Wp.get_default()?.audio.defaultMicrophone!
    
    // Create widgets
    const button = Gtk.Button.new();
    const box = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6);
    const image = Gtk.Image.new_from_icon_name("audio-input-microphone-symbolic"); // fallback icon name
    const label = Gtk.Label.new("Loading...");

    box.append(image);
    box.append(label);
    button.set_child(box);

    // Update UI based on mic state
    const updateButtonLabel = () => {
        const isMuted = mic.get_mute();
        
        // Set icon based on mute state only
        if (isMuted) {
            image.set_from_icon_name("microphone-disabled-symbolic");
        } else {
            image.set_from_icon_name("audio-input-microphone-symbolic");
        }
        
        // No text in the label
        label.set_label("");
    }

    // Initial label update
    updateButtonLabel();

    // Watch for updates
    mic.connect("notify::volume", updateButtonLabel);
    mic.connect("notify::is-muted", updateButtonLabel);
    mic.connect("notify::mute", updateButtonLabel); // if needed

    // Click handler
    button.connect("clicked", () => {
        // Toggle mute state
        mic.set_mute(!mic.get_mute());
    });

    return button;
}