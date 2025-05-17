import Network from "gi://AstalNetwork"
import { Gtk } from "astal/gtk4"
import { exec, execAsync } from "astal/process"

export function Network_icon() {
    const network = Network.get_default();
    
    // Create widgets for a button with icon and label
    const button = Gtk.Button.new();
    const box = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6);
    const image = Gtk.Image.new_from_icon_name("network-offline-symbolic");
    const label = Gtk.Label.new("Loading...");
    
    box.append(image);
    box.append(label);
    button.set_child(box);
    
    // Update the network status display
    const updateNetworkStatus = () => {
        // Check for wired connection first - only if it has active speed
        if (network.wired && network.wired.speed > 0) {
            // Wired connection is active and connected
            image.set_from_icon_name(network.wired.iconName || "network-wired-symbolic");
            label.set_label(""); // No text for wired
            return;
        }
        
        // Check for WiFi connection if wired is not active
        if (network.wifi && network.wifi.ssid) {
            image.set_from_icon_name(network.wifi.iconName || "network-wireless-symbolic");
            label.set_label(network.wifi.ssid);
            return;
        }
        
        // No connection
        image.set_from_icon_name("network-offline-symbolic");
        label.set_label("No Network");
    };
    
    // Initial update
    updateNetworkStatus();
    
    // Connect to all relevant network state changes
    network.connect("notify::primary", updateNetworkStatus);
    network.connect("notify::state", updateNetworkStatus);
    network.connect("notify::wifi", updateNetworkStatus);
    network.connect("notify::wired", updateNetworkStatus);
    
    if (network.wifi) {
        network.wifi.connect("notify::ssid", updateNetworkStatus);
        network.wifi.connect("notify::strength", updateNetworkStatus);
    }
    
    if (network.wired) {
        network.wired.connect("notify::internet", updateNetworkStatus);
        network.wired.connect("notify::speed", updateNetworkStatus);
    }

    // Click handler - Show notification with network info
    button.connect("clicked", async () => {
        // Debug info commented out for future use
        // Build a message with relevant network info
        let message = "Network Information\n------------------\n";
        // Add wired info if available
        if (network.wired) {
            message += `Wired: Connected\n`;
            message += `Speed: ${network.wired.speed} Mbps\n`;
        }
        // Add WiFi info if available
        if (network.wifi && network.wifi.ssid) {
            message += `WiFi: ${network.wifi.ssid}\n`;
            message += `Signal: ${network.wifi.strength}%\n`;
        }
        console.log("Network Status", message);
        
        try {
            await execAsync(["ghostty", "-e", "nmtui"]);
        } catch (error) {
            console.error('Failed to launch network manager:', error);
        }
        try {
            await updateNetworkStatus();
        } catch (error) {
            console.error('Failed to update network status:', error);
        }
    });

    return button;
}