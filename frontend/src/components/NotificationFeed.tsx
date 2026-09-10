import React, { useState } from 'react';
import { AlertLogItem } from '../types';
import { Bell, Mail, MessageSquare, Smartphone, Send, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';

interface NotificationFeedProps {
  alerts: AlertLogItem[];
  onTestChannel: (channel: 'email' | 'sms' | 'webhook', message: string) => Promise<void>;
}

export const NotificationFeed: React.FC<NotificationFeedProps> = ({ alerts, onTestChannel }) => {
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  const handleTest = async (channel: 'email' | 'sms' | 'webhook') => {
    setTestingChannel(channel);
    setTestSuccess(null);
    try {
      const msg = `Automated verification alert via BuildSure AI ${channel.toUpperCase()} dispatch engine.`;
      await onTestChannel(channel, msg);
      setTestSuccess(`Successfully dispatched test alert to ${channel.toUpperCase()} channel!`);
      setTimeout(() => setTestSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setTestingChannel(null);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/80">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Notification & Escalation Audit Log</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                Multi-Channel
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live audit trail of automated Email, SMS (Twilio), and Slack/Teams webhook escalation events
            </p>
          </div>
        </div>

        {/* Quick Test Channel Action Buttons */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400 font-semibold hidden md:inline">Test Channel:</span>
          <button
            onClick={() => handleTest('email')}
            disabled={testingChannel !== null}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition disabled:opacity-50"
            title="Dispatch simulated SMTP Email alert"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>Email</span>
          </button>
          <button
            onClick={() => handleTest('sms')}
            disabled={testingChannel !== null}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition disabled:opacity-50"
            title="Dispatch simulated Twilio SMS page"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>SMS</span>
          </button>
          <button
            onClick={() => handleTest('webhook')}
            disabled={testingChannel !== null}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition disabled:opacity-50"
            title="Dispatch Slack/Teams Webhook payload"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Webhook</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {testSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{testSuccess}</span>
        </div>
      )}

      {/* Alert Feed List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No active escalation alerts for this project. Site conditions are currently nominal.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.alert_id}
              className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="font-bold text-slate-200">{alert.alert_type}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {alert.message || 'Notification triggered by automated safety rule engine.'}
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0 text-slate-400 font-mono text-[11px]">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{new Date(alert.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
