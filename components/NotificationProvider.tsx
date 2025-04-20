import React, { createContext, ReactNode, useContext, useState } from 'react';

type Notification = { id: string; text: string };
type NotificationContextType = {
  notify: (text: string, label?: string) => void;
  notifications: Notification[];
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = (text: string, label?: string) => {
    const id = label || text;
    setNotifications((prev) => {
      if (prev.some((n) => n.id === id)) return prev;
      return [...prev, { id, text }];
    });

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ notify, notifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
}
