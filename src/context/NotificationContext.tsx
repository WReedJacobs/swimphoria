import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type NotifType = 'pb' | 'info' | 'success' | 'warning'

export interface InAppNotif {
  id: string
  type: NotifType
  message: string
  createdAt: Date
  read: boolean
}

interface NotifContextValue {
  notifications: InAppNotif[]
  unreadCount: number
  addNotif: (type: NotifType, message: string) => void
  markAllRead: () => void
}

const NotifContext = createContext<NotifContextValue | null>(null)

// Module-level delegate so it can be called outside the React tree
type AddNotifFn = (type: NotifType, message: string) => void
let _addNotif: AddNotifFn = () => {}
export const notif = {
  pb: (message: string) => _addNotif('pb', message),
  info: (message: string) => _addNotif('info', message),
  success: (message: string) => _addNotif('success', message),
  warning: (message: string) => _addNotif('warning', message),
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<InAppNotif[]>([])
  const counter = useRef(0)

  const addNotif = useCallback<AddNotifFn>((type, message) => {
    setNotifications((prev) =>
      [
        {
          id: String(++counter.current),
          type,
          message,
          createdAt: new Date(),
          read: false,
        },
        ...prev,
      ].slice(0, 30),
    )
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  useEffect(() => {
    _addNotif = addNotif
    return () => {
      _addNotif = () => {}
    }
  }, [addNotif])

  return (
    <NotifContext.Provider
      value={{
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        addNotif,
        markAllRead,
      }}
    >
      {children}
    </NotifContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotifContext)
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider')
  return ctx
}
