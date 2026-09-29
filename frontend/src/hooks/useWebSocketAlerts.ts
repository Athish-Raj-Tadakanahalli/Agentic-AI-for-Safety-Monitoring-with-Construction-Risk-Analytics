import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertLogItem } from '../types';

interface UseWebSocketAlertsOptions {
  projectId: number;
  onNewAlert?: (alert: AlertLogItem) => void;
  enableSound?: boolean;
}

export const useWebSocketAlerts = ({
  projectId,
  onNewAlert,
  enableSound = true,
}: UseWebSocketAlertsOptions) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestAlert, setLatestAlert] = useState<AlertLogItem | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Web Audio API Synthesizer (Generates zero-asset crisp safety alert chime)
  const playAlertSound = useCallback((severity?: string) => {
    if (!enableSound) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const isCritical = severity?.toLowerCase() === 'critical';
      const now = ctx.currentTime;

      // Tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = isCritical ? 'sawtooth' : 'sine';
      osc1.frequency.setValueAtTime(isCritical ? 880 : 587.33, now); // A5 or D5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Tone 2 (Double chime)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = isCritical ? 'square' : 'sine';
      osc2.frequency.setValueAtTime(isCritical ? 1046.50 : 880, now + 0.15); // C6 or A5
      gain2.gain.setValueAtTime(0.2, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.warn('AudioContext playback prevented by browser policy:', e);
    }
  }, [enableSound]);

  useEffect(() => {
    if (!projectId) return;

    const getWsUrl = () => {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const wsScheme = baseUrl.startsWith('https') ? 'wss' : 'ws';
      const cleanHost = baseUrl.replace(/^https?:\/\//, '');
      return `${wsScheme}://${cleanHost}/ws/alerts/${projectId}`;
    };

    const connectWebSocket = () => {
      const wsUrl = getWsUrl();
      console.log(`Connecting WebSockets to: ${wsUrl}`);
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        console.log(`WebSocket connected to Project #${projectId}`);
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'ALERT' && payload.alert) {
            const newAlert: AlertLogItem = payload.alert;
            setLatestAlert(newAlert);
            playAlertSound(newAlert.severity);
            if (onNewAlert) {
              onNewAlert(newAlert);
            }
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        console.log(`WebSocket disconnected. Retrying in 3s...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      socket.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
        socket.close();
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [projectId, onNewAlert, playAlertSound]);

  return {
    isConnected,
    latestAlert,
    playAlertSound,
  };
};
