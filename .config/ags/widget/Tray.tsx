import Tray from "gi://AstalTray"
import { Gtk } from "astal/gtk4"

export function Tray_icon() {
    const tray = Tray.get_default();
    const box = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6);
    const menuButtons: Gtk.MenuButton[] = [];

    const updateTrayItems = () => {
        // Clear existing items
        menuButtons.forEach(btn => box.remove(btn));
        menuButtons.length = 0;
        
        tray.get_items().forEach(item => {
            const menuButton = new Gtk.MenuButton({
                visible: true,
            });
            
            // Set up icon
            const icon = Gtk.Image.new();
            icon.set_from_gicon(item.gicon);
            menuButton.set_child(icon);
            
            // Bind properties to stay updated
            item.connect('notify::gicon', () => {
                icon.set_from_gicon(item.gicon);
            });
            
            item.connect('notify::tooltip-markup', () => {
                menuButton.set_tooltip_markup(item.tooltip_markup);
            });
            
            // Setup menu and actions
            if (item.menu_model) {
                menuButton.set_menu_model(item.menu_model);
                if (item.action_group) {
                    menuButton.insert_action_group("dbusmenu", item.action_group);
                }
            }
            
            // Connect activation
            menuButton.connect('activate', () => {
                item.emit('activate');
            });
            
            box.append(menuButton);
            menuButtons.push(menuButton);
        });
    };

    // Watch for tray changes
    tray.connect("item-added", updateTrayItems);
    tray.connect("item-removed", updateTrayItems);
    
    // Initial setup
    updateTrayItems();

    return box;
}