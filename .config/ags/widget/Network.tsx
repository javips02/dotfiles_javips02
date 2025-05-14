import Network from "gi://AstalNetwork"
import { Gtk } from "astal/gtk4"

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
        // Check for wired connection first
        if (network.wired && network.wired.internet === 0) {
            // Wired connection is active
            image.set_from_icon_name(network.wired.iconName || "network-wired-symbolic");
            label.set_label(""); // No text for wired
            return;
        }
        
        // Check for WiFi connection
        if (network.wifi && network.wifi.ssid) {
            image.set_from_icon_name("network-wireless-symbolic");
            label.set_label(network.wifi.ssid);
            return;
        }
        
        // No connection
        image.set_from_icon_name("network-offline-symbolic");
        label.set_label("No Network");
    };
    
    // Initial update
    updateNetworkStatus();
    
    // Connect to network state changes
    network.connect("notify::primary", updateNetworkStatus);
    network.connect("notify::state", updateNetworkStatus);
    
    // Click handler - Show notification with network info
    button.connect("clicked", () => {
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
        
        // // Show notification
        // execAsync([
        //     "notify-send", 
        //     "Network Status", 
        //     message
        // ]).catch(console.error);
    });
    
    return button;
}