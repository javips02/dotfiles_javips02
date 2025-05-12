import Wp from "gi://AstalWp"

function Volume(): JSX.Element {
    const audio = Wp.get_default()?.audio
    const speaker = audio?.defaultSpeaker

    if (!speaker) {
        console.error("Default speaker not found")
        return (
            <box>
                <label label="Audio not available" />
            </box>
        )
    }

    return (
        <box>
            <label label={`Volume: ${Math.floor(speaker.volume * 100)}%`} />
        </box>
    )
}

export default Volume
