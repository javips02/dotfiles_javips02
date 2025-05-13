function PowerMenu(): JSX.Element {
    return (
        <menubutton>
            <label label="󰤆" />
            <popover>
                <box orientation="vertical" spacing={10} margin={10}>
                    <button onClicked="hyprlock">
                        <label label=" 󰌾 Lock" />
                    </button>
                    <button onClicked="/usr/bin/systemctl poweroff">
                        <label label="  Shutdown" />
                    </button>
                    <button onClicked="/usr/bin/systemctl reboot">
                        <label label="  Reboot" />
                    </button>
                    {/* This command checks if 'hyprpaper' is running. If it is, it kills the process and restarts it in the background.
                        If not, it simply starts 'hyprpaper' in the background. */}
                    <button onClicked="sh -c 'if pgrep -x hyprpaper > /dev/null; then killall hyprpaper && hyprpaper & disown; else hyprpaper & disown; fi'">
                        <label label="  Reload Wallpaper" />
                    </button>
                </box>
            </popover>
        </menubutton>
    );
}

export { PowerMenu };