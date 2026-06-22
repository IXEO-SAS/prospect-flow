import React, { useEffect } from 'react';
import { useProspectStore } from '../store';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export default function Notifications() {
  const notifications = useProspectStore(s => s.notifications);
  const removeNotification = useProspectStore(s => s.removeNotification);

  useEffect(() => {
    // Auto-remove notifications après durée spécifiée
    notifications.forEach(notif => {
      if (notif.duration) {
        const timer = setTimeout(() => {
          removeNotification(notif.id);
        }, notif.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, removeNotification]);

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 pointer-events-none">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-fadeInUp ${
            notif.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : notif.type === 'error'
              ? 'bg-red-100 text-red-700 border border-red-300'
              : 'bg-blue-100 text-blue-700 border border-blue-300'
          }`}
        >
          {notif.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
          {notif.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="font-semibold text-sm">{notif.message}</span>
          <button
            onClick={() => removeNotification(notif.id)}
            className="ml-2 hover:opacity-70 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
