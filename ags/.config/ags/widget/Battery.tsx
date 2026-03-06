import Battery from "gi://AstalBattery"
import { Gtk } from "astal/gtk4"
import GLib from "gi://GLib"

export function Battery_icon() {
    const battery = Battery.get_default();
    
    // Create widgets with icon and label
    const button = Gtk.Button.new();
    const box = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6);
    const image = Gtk.Image.new_from_icon_name("battery-symbolic");
    const label = Gtk.Label.new("Loading...");

    box.append(image);
    box.append(label);
    button.set_child(box);

    // Update battery status display
    const updateBatteryStatus = () => {
        const percentage = Math.round(battery.percentage * 100);
        label.set_label(`${percentage}%`);
        image.set_from_icon_name(battery.icon_name || "battery-symbolic");
        return true; // Return true to keep the timer running
    };

    // Initial update
    updateBatteryStatus();

    // Set up timer to update every minute (60000 milliseconds)
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 60000, updateBatteryStatus);

    // Click handler for manual refresh
    button.connect("clicked", updateBatteryStatus);

    return button;
}