import Notifd from "gi://AstalNotifd"

const notifd = Notifd.get_default()

notifd.connect("notified", (_, id) => {
    const n = notifd.get_notification(id)
    print(n.summary, n.body)
})

export function sendNotification(summary: string, body: string, timeout = 5000) {
    try {
        const notification = new Notifd.Notification();
        
        notification.summary = summary;
        notification.body = body;
        notification.app_name = "AGS";
        notification.app_icon = "system-notification-symbolic";
        notification.expire_timeout = timeout;
        
        // Emit the notification signal with a random ID and no replacement
        notifd.emit('notified', Math.floor(Math.random() * 10000), false);
    } catch (error) {
        console.error('Failed to send notification:', error);
    }
}
