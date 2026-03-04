import { useEffect, useRef, useState, useCallback } from 'react';
import type { EarningsSnapshot } from '../types';
import { generateSnapshot } from '../services/mockData';

interface WSHookResult {
  isConnected: boolean;
  latestSnapshot: EarningsSnapshot | null;
  reconnect: () => void;
}

/**
 * Simulates a WebSocket connection that streams live earnings data.
 * In production: replace the setInterval simulation with a real WebSocket endpoint.
 * Uses exponential back-off reconnection and visibility-based throttling:
 * 1.5 s tick when the tab is visible, throttled to 4 s when hidden to
 * preserve battery / CPU. The interval is recreated on each visibility change.
 */
export function useWebSocket(): WSHookResult {
  const [isConnected, setIsConnected] = useState(false);
  const [latestSnapshot, setLatestSnapshot] = useState<EarningsSnapshot | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttempts = useRef(0);
  const snapshotRef = useRef<EarningsSnapshot | null>(null);
  const isVisibleRef = useRef(true);

  /** Emit a single WS tick: generate next snapshot and update state. */
  const emitTick = useCallback(() => {
    const next = generateSnapshot(snapshotRef.current ?? undefined);
    snapshotRef.current = next;
    setLatestSnapshot(next);
  }, []);

  /** (Re)start the polling interval at the given delay. */
  const scheduleInterval = useCallback((delay: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(emitTick, delay);
  }, [emitTick]);

  // When the tab is hidden/shown, restart the interval at the correct frequency.
  useEffect(() => {
    const onVisChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
      if (intervalRef.current !== null) {
        scheduleInterval(isVisibleRef.current ? 1500 : 4000);
      }
    };
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, [scheduleInterval]);

  const startStream = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Simulate connection handshake delay with exponential back-off
    const connectDelay = 400 + reconnectAttempts.current * 200;
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
      scheduleInterval(isVisibleRef.current ? 1500 : 4000);
    }, connectDelay);
    return () => clearTimeout(connectTimer);
  }, [scheduleInterval]);

  useEffect(() => {
    const cleanup = startStream();
    return () => {
      cleanup();
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsConnected(false);
    };
  }, [startStream]);

  const reconnect = useCallback(() => {
    reconnectAttempts.current += 1;
    setIsConnected(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startStream();
  }, [startStream]);

  return { isConnected, latestSnapshot, reconnect };
}
