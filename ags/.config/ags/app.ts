import { App, Gtk, Gdk } from "astal/gtk4";
import style from "./style.scss"
import Bar from "./widget/Bar"

App.start({
    css: style,
    iconTheme: "Papirus",  // Set icon theme directly in config
    main() {
        App.get_monitors().map(Bar);
    },
})
