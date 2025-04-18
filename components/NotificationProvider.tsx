import React, { createContext, ReactNode, useContext, useState } from 'react';

type Notification = { id: number; text: string };
type NotificationContextType = {
  notify: (text: string) => void;
  notifications: Notification[];
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = (text: string) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, text }]);

    // Auto-remove notification after 3 seconds
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
