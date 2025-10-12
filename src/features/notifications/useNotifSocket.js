// src/features/notifications/useNotifSocket.js
import { useEffect, useRef, useCallback } from "react";
import { TokenManager } from "../../api/tokenManager";
import { API_BASE_URL } from "../../api/apiClient";

/**
 * Hook kết nối WebSocket notifications với auto-reconnect
 * @param {Object} opts
 * @param {(msg: any) => void} opts.onMessage - Callback khi nhận message
 * @param {boolean} opts.enabled - Enable/disable socket (default: true)
 */
export default function useNotifSocket({ onMessage, enabled = true } = {}) {
  const wsRef = useRef(null);
  const retryCountRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const isManualCloseRef = useRef(false);
  const isMountedRef = useRef(true);

  /**
   * Lấy WebSocket URL với token mới
   */
  const getWsUrl = useCallback(() => {
    const token = TokenManager.getAccessToken();
    if (!token) return null;

    // ✅ Convert http://... -> ws://..., https://... -> wss://...
    const wsBase = API_BASE_URL.replace(/^http/, "ws");
    return `${wsBase}/ws/notifications/?token=${encodeURIComponent(token)}`;
  }, []);

  /**
   * Mở WebSocket connection
   */
  const openSocket = useCallback(() => {
    // Don't open if disabled or unmounted
    if (!enabled || isManualCloseRef.current || !isMountedRef.current) {
      return;
    }

    const wsUrl = getWsUrl();
    if (!wsUrl) {
      // Chưa đăng nhập, thử lại sau 3s
      reconnectTimerRef.current = setTimeout(() => {
        openSocket();
      }, 3000);
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ WebSocket connected');
        }
        retryCountRef.current = 0; // Reset backoff
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('📨 WS Message:', data);
          }

          if (typeof onMessage === 'function') {
            onMessage(data);
          }
        } catch (e) {
          console.warn('⚠️ Invalid WebSocket message:', event.data);
        }
      };

      ws.onclose = (event) => {
        if (isManualCloseRef.current || !isMountedRef.current) {
          return;
        }

        // ✅ Phân biệt close codes
        const isNormalClose = event.code === 1000;
        const isUnauthorized = event.code === 4401;
        
        if (isNormalClose) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔌 WebSocket closed normally');
          }
          return;
        }

        if (isUnauthorized) {
          console.warn('⚠️ WebSocket unauthorized, waiting for token refresh...');
          // Đợi event 'token:refreshed' để reconnect
          return;
        }

        // ✅ Reconnect với exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
        retryCountRef.current += 1;

        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 WS closed (code: ${event.code}), reconnect in ${delay}ms`);
        }

        reconnectTimerRef.current = setTimeout(() => {
          openSocket();
        }, delay);
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        // onclose sẽ handle reconnect
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      
      // Retry với backoff
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
      retryCountRef.current += 1;
      
      reconnectTimerRef.current = setTimeout(() => {
        openSocket();
      }, delay);
    }
  }, [enabled, getWsUrl, onMessage]);

  /**
   * Đóng WebSocket connection
   */
  const closeSocket = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close(1000, 'Component cleanup');
      } catch (e) {
        console.warn('⚠️ Error closing WebSocket:', e);
      }
      wsRef.current = null;
    }
  }, []);

  /**
   * ✅ Lắng nghe token refresh để reconnect
   */
  useEffect(() => {
    const handleTokenRefresh = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Token refreshed, reconnecting WebSocket...');
      }

      closeSocket();
      
      // Reconnect sau 500ms để đảm bảo token đã được set
      setTimeout(() => {
        if (isMountedRef.current) {
          openSocket();
        }
      }, 500);
    };

    window.addEventListener('token:refreshed', handleTokenRefresh);

    return () => {
      window.removeEventListener('token:refreshed', handleTokenRefresh);
    };
  }, [closeSocket, openSocket]);

  /**
   * ✅ Lắng nghe unauthorized để disconnect
   */
  useEffect(() => {
    const handleUnauthorized = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚪 Unauthorized, closing WebSocket...');
      }
      isManualCloseRef.current = true;
      closeSocket();
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    window.addEventListener('token:cleared', handleUnauthorized);

    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
      window.removeEventListener('token:cleared', handleUnauthorized);
    };
  }, [closeSocket]);

  /**
   * Main effect: Open socket khi enabled
   */
  useEffect(() => {
    isMountedRef.current = true;
    isManualCloseRef.current = false;

    if (enabled) {
      openSocket();
    }

    return () => {
      isMountedRef.current = false;
      isManualCloseRef.current = true;
      closeSocket();
    };
  }, [enabled, openSocket, closeSocket]);

  // ✅ Return socket status (optional, for debugging)
  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    readyState: wsRef.current?.readyState,
  };
}