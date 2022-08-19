

export enum NotificationType {
    Info = 'info',
    Success = 'success',
    Warning = 'warning',
    Error = 'error'
}

export class Notification {
    id: number = 0;
    message: string = '';
    type: NotificationType = NotificationType.Info;
}

export class Notifications {
    private static subscribers: ((notification: Notification) => void)[] = [];
    private static idCounter: number = 0;
    static notifications: Notification[] = [];

    static add(message: string, type: NotificationType = NotificationType.Info): number {
        const notification = new Notification();
        notification.message = message;
        notification.type = type;
        notification.id = Notifications.idCounter++;
        Notifications.notifications = [...Notifications.notifications, notification];
        Notifications.subscribers.forEach(s => s(notification));
        return notification.id;
    }


    static clear() {
        Notifications.notifications = [];
    }

    static remove(id: number) {
        Notifications.subscribers.forEach(s => s(new Notification()));
        Notifications.notifications = Notifications.notifications.filter(n => n.id !== id);
    }

    static subscribe(callback: (notification: Notification) => void): () => void {
        Notifications.subscribers.push(callback);
        return () => {
            Notifications.subscribers = Notifications.subscribers.filter(s => s !== callback);
        }
    }
}