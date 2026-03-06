import { Gtk } from "astal/gtk4"

export function LogoButton() {
    // Create the button with label
    const button = Gtk.Button.new_with_label("󰣇  Arch")
    
    // Define the callback function
    const onButtonClicked = () => {
        console.log('"Arch" button was clicked')
        // You can also run shell commands here if needed
    }
    
    // Connect the clicked signal with the callback function
    button.connect("clicked", onButtonClicked)
    
    return button
}