import app from "./shellApp"
import style from "./style.scss"
import Bar from "./widget/Bar"

app.start({
    css: style,
    iconTheme: "Papirus",
    main() {
        app.get_monitors().forEach((monitor) => {
            const win = Bar(monitor, app)
            app.add_window(win)
            win.present()
        })
    },
})
