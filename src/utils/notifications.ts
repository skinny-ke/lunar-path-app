export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });
  }
};

export const schedulePeriodicNotifications = (
  nextPeriodDate: Date | null,
  daysBeforeNotification: number = 3
) => {
  if (!nextPeriodDate) return;

  const now = new Date();
  const notificationDate = new Date(nextPeriodDate);
  notificationDate.setDate(notificationDate.getDate() - daysBeforeNotification);
  notificationDate.setHours(9, 0, 0, 0); // 9 AM notification

  const timeDiff = notificationDate.getTime() - now.getTime();

  if (timeDiff > 0) {
    // Schedule notification
    setTimeout(() => {
      sendNotification("Period Reminder", {
        body: `Your period is expected in ${daysBeforeNotification} days. Don't forget to track your symptoms!`,
        tag: "period-reminder",
      });
    }, timeDiff);
  }
};
