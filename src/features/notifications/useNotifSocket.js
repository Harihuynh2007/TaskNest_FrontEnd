// src/features/notifications/useNotifSocket.js
import { useEffect, useRef, useCallback, useState } from "react";
import { TokenManager } from "../../api/tokenManager";
import api from "../../api/apiClient"; // ✅ default export axios instance

export default function useNotifSocket({ onMessage, enabled = true } = {}) {
  const wsRef = useRef(null);
  const retryCountRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const pingTimerRef = useRef(null);
  const isManualCloseRef = useRef(false);
  const isMountedRef = useRef(true);
  const [isConnected, setIsConnected] = useState(false);

  const stopPing = useCallback(() => {
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
  }, []);

  const startPing = useCallback(() => {
    stopPing();
    pingTimerRef.current = setInterval(() => {
      try {
        wsRef.current?.send(JSON.stringify({ type: "ping" }));
      } catch {}
    }, 25000);
  }, [stopPing]);

  const inferHttpBase = useCallback(() => {
    // Ưu tiên baseURL từ axios, fallback env, fallback window.origin
    const fromAxios = api?.defaults?.baseURL; // ví dụ: http://127.0.0.1:8000/api
    const fromEnv = process.env.REACT_APP_API_BASE_URL; // nếu bạn có set
    const fromWindow =
      typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:8000";

    return (fromAxios || fromEnv || fromWindow).replace(/\/+$/, "");
  }, []);

  const getWsUrl = useCallback(() => {
    const token = TokenManager.getAccessToken();
    if (!token) return null;

    let httpBase = inferHttpBase();

    // Nếu baseURL có /api ở cuối -> bỏ đi để ra origin (backend ws nằm ở /ws/...)
    httpBase = httpBase.replace(/\/api$/i, "");

    // http->ws, https->wss
    const wsOrigin = httpBase.replace(/^http/i, "ws");

    return `${wsOrigin}/ws/notifications/?token=${encodeURIComponent(token)}`;
  }, [inferHttpBase]);

  const closeSocket = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    stopPing();
    setIsConnected(false);

    if (wsRef.current) {
      try {
        wsRef.current.close(1000, "cleanup");
      } catch {}
      wsRef.current = null;
    }
  }, [stopPing]);

  const openSocket = useCallback(() => {
    if (!enabled || isManualCloseRef.current || !isMountedRef.current) return;

    const wsUrl = getWsUrl();
    if (!wsUrl) {
      reconnectTimerRef.current = setTimeout(openSocket, 3000);
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        retryCountRef.current = 0;
        setIsConnected(true);
        startPing();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (typeof onMessage === "function") onMessage(data);
        } catch {}
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        stopPing();

        if (isManualCloseRef.current || !isMountedRef.current) return;

        // stop reconnect nếu unauthorized/forbidden
        if (event.code === 4401 || event.code === 4403) return;
        if (event.code === 1000) return;

        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
        retryCountRef.current += 1;
        reconnectTimerRef.current = setTimeout(openSocket, delay);
      };
    } catch {
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
      retryCountRef.current += 1;
      reconnectTimerRef.current = setTimeout(openSocket, delay);
    }
  }, [enabled, getWsUrl, onMessage, startPing, stopPing]);

  useEffect(() => {
    isMountedRef.current = true;
    isManualCloseRef.current = false;

    if (enabled) openSocket();

    return () => {
      isMountedRef.current = false;
      isManualCloseRef.current = true;
      closeSocket();
    };
  }, [enabled, openSocket, closeSocket]);

  const sendJSON = useCallback((obj) => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(obj));
        return true;
      }
    } catch {}
    return false;
  }, []);

  return { isConnected, sendJSON };
}
