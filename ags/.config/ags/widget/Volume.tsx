import Wp from "gi://AstalWp"
import { Gtk } from "astal/gtk4"

export function Volume_icon() {
    const speaker = Wp.get_default()?.audio.defaultSpeaker!
    
    // Create widgets
    const button = Gtk.Button.new();
    const box = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6);
    // Use speaker's volume icon immediately instead of fallback
    const image = Gtk.Image.new_from_icon_name(speaker.get_volume_icon());
    const label = Gtk.Label.new("Loading...");

    box.append(image);
    box.append(label);
    button.set_child(box);

    // Update UI based on speaker state
    const updateButtonLabel = () => {
        const isMuted = speaker.get_mute();
        image.set_from_icon_name(speaker.get_volume_icon());
        
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

    // Add scroll controller for volume adjustment
    const scrollController = new Gtk.EventControllerScroll();
    scrollController.set_flags(Gtk.EventControllerScrollFlags.BOTH_AXES);
    
    scrollController.connect('scroll', (_, __, dy) => {
        const step = 0.03; // 3% volume change per scroll
        const newVolume = speaker.volume - (dy * step);
        // Clamp volume between 0 and 1
        speaker.volume = Math.max(0, Math.min(1, newVolume));
    });
    
    button.add_controller(scrollController);

    return button;
}

export function Mic() {
    const mic = Wp.get_default()?.audio.defaultMicrophone!
    
    // Create widgets
    const button = Gtk.Button.new();
    const box = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6);
    const image = Gtk.Image.new_from_icon_name(mic.get_volume_icon()); // fallback icon name
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
            image.set_from_icon_name(mic.get_volume_icon());
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