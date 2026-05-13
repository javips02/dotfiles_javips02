import GLib from "gi://GLib?version=2.0"
import Astal from "gi://Astal?version=4.0"
import { createRoot } from "gnim"
import { programArgs } from "system"
import Gtk from "gi://Gtk?version=4.0"

type StartConfig = Partial<{
    instanceName: string
    css: string
    icons: string
    gtkTheme: string
    iconTheme: string
    cursorTheme: string
    main(...argv: string[]): void
}>

type App = Astal.Application & Gtk.Application & {
    start(config: StartConfig): void
}

const app = new Astal.Application() as App

let mainHandler: ((...argv: string[]) => void) | undefined
let activated = false
let startupCss: string | undefined

app.start = function (config: StartConfig) {
    const {
        main,
        css,
        icons,
        gtkTheme,
        iconTheme,
        cursorTheme,
        instanceName = "ags",
    } = config
    mainHandler = main
    app.set_instance_name(instanceName)

    const settings = Gtk.Settings.get_default()
    if (settings) {
        if (gtkTheme) settings.gtkThemeName = gtkTheme
        if (iconTheme) settings.gtkIconThemeName = iconTheme
        if (cursorTheme) settings.gtkCursorThemeName = cursorTheme
    }

    startupCss = css

    if (icons && GLib.file_test(icons, GLib.FileTest.EXISTS)) {
        app.add_icons(icons)
    }

    app.connect("activate", () => {
        if (activated) return
        activated = true
        app.hold()
        createRoot((dispose) => {
            const shutdownId = app.connect("shutdown", () => {
                app.disconnect(shutdownId)
                dispose()
            })
            if (startupCss) {
                app.apply_css(startupCss, false)
            }
            mainHandler?.(...programArgs)
        })
    })

    app.run(programArgs)
}

export default app
