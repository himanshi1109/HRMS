import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { notificationService } from '../../services/notificationService';
import Badge from '../../components/common/Badge';
import { Spinner } from '../../components/common/Loader';
import { formatDate } from '../../utils/formatters';
import { Check, CheckSquare, Bell, Settings, ShieldCheck, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'settings'
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    emailOnLeaveApproval: true,
    emailOnAttendanceRegularization: true,
    popupAlerts: true,
  });

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await notificationService.getPreferences();
        if (response?.success && response?.data) {
          setPreferences(response.data);
        }
      } catch (err) {
        console.error('Failed to load notification preferences:', err);
      }
    };
    loadPreferences();
  }, []);

  const handlePreferenceToggle = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    try {
      const response = await notificationService.updatePreferences(updated);
      if (response?.success) {
        toast.success('Notification preferences updated');
      }
    } catch (err) {
      console.error('Failed to update notification preferences:', err);
    }
  };

  return (
    <div className="space-y-6 select-none max-w-4xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stardust-text">Workspace Notifications</h2>
          <p className="text-sm text-grey-text mt-1">Manage system alerts and preference settings</p>
        </div>

        {activeTab === 'list' && unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-indigo-brand text-stardust-text hover:bg-indigo-brand transition-colors cursor-pointer"
          >
            <CheckSquare size={14} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-indigo-border flex gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('list')}
          className={`pb-3 border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === 'list'
              ? 'border-indigo-brand text-indigo-brand font-bold'
              : 'border-transparent text-grey-text hover:text-stardust-text'
          }`}
        >
          Inbox Alerts ({unreadCount})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'border-indigo-brand text-indigo-brand font-bold'
              : 'border-transparent text-grey-text hover:text-stardust-text'
          }`}
        >
          Alert Settings
        </button>
      </div>

      {/* Panels */}
      {activeTab === 'list' ? (
        <div className="bg-charcoal-sidebar border border-indigo-border rounded-xl p-5 shadow-lg space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-grey-text text-sm">
              Your inbox is clean. No notifications found.
            </div>
          ) : (
            <div className="divide-y divide-indigo-border/40 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`pt-4 first:pt-0 flex items-start justify-between gap-4 ${
                    !notif.isRead ? 'bg-indigo-brand/5 -mx-3 px-3 py-2.5 rounded-lg border-l-4 border-l-indigo-brand' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-lg ${!notif.isRead ? 'bg-indigo-brand/10 text-indigo-brand' : 'bg-charcoal-navbar border border-indigo-border text-grey-text'}`}>
                      <Bell size={18} />
                    </div>
                    <div>
                      <h4 className={`text-sm text-stardust-text ${!notif.isRead ? 'font-bold' : 'font-normal'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-grey-text mt-1">{notif.message}</p>
                      <span className="text-[10px] text-grey-text/60 mt-1.5 block">
                        {formatDate(notif.createdAt, 'dd MMM yyyy, hh:mm a')}
                      </span>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="p-1 rounded bg-indigo-brand hover:bg-indigo-hover text-stardust-text cursor-pointer transition-colors"
                      title="Mark as Read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Settings panel */
        <div className="bg-charcoal-sidebar border border-indigo-border rounded-xl p-6 shadow-lg space-y-6">
          <h3 className="text-sm font-semibold text-stardust-text uppercase tracking-wider mb-2 flex items-center gap-2">
            <Settings size={16} className="text-indigo-brand" />
            <span>Alert Prefs</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-charcoal-navbar/40 border border-indigo-border/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-brand/10 text-indigo-brand rounded-lg">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stardust-text">Email Approvals Alerts</h4>
                  <span className="text-xs text-grey-text">Receive emails when leaves are approved/rejected</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailOnLeaveApproval}
                onChange={() => handlePreferenceToggle('emailOnLeaveApproval')}
                className="w-4 h-4 rounded border-indigo-border text-indigo-brand bg-charcoal-navbar focus:ring-0 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-charcoal-navbar/40 border border-indigo-border/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-brand/10 text-indigo-brand rounded-lg">
                  <Calendar size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stardust-text">Email Regularization Alerts</h4>
                  <span className="text-xs text-grey-text">Receive emails when attendance adjustments are decided</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailOnAttendanceRegularization}
                onChange={() => handlePreferenceToggle('emailOnAttendanceRegularization')}
                className="w-4 h-4 rounded border-indigo-border text-indigo-brand bg-charcoal-navbar focus:ring-0 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-charcoal-navbar/40 border border-indigo-border/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-brand/10 text-indigo-brand rounded-lg">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stardust-text">Popup Browser Alerts</h4>
                  <span className="text-xs text-grey-text">Show instant web banners inside the app</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.popupAlerts}
                onChange={() => handlePreferenceToggle('popupAlerts')}
                className="w-4 h-4 rounded border-indigo-border text-indigo-brand bg-charcoal-navbar focus:ring-0 focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
