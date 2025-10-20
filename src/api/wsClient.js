const inferWsOrigin = () => {
  if (process.env.REACT_APP_WS_ORIGIN) return process.env.REACT_APP_WS_ORIGIN.replace(/\/+$/, '');
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, host } = window.location;
    const wsProto = protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProto}//${host}`;
  }
  return 'ws://127.0.0.1:8000';
};

const WS_ORIGIN = inferWsOrigin();

// ---------- Reconnecting WS wrapper ----------
class ReconnectingWS {
  constructor(urlBuilder, { onMessage, onOpen, onClose, onError } = {}) {
    this.urlBuilder = urlBuilder;      // () => string
    this.ws = null;
    this.isClosing = false;
    this.backoff = 500;                // ms, tăng dần
    this.maxBackoff = 8000;            // ms
    this.queue = [];                   // hàng đợi khi WS chưa open
    this.listeners = { message: onMessage, open: onOpen, close: onClose, error: onError };
    this._connect();
  }

  _connect() {
    try {
      this.ws = new WebSocket(this.urlBuilder());
      this.ws.onopen = (ev) => {
        this.backoff = 500;
        if (this.listeners.open) this.listeners.open(ev);
        // flush queue
        while (this.queue.length) {
          this._safeSend(this.queue.shift());
        }
      };
      this.ws.onmessage = (ev) => {
        if (this.listeners.message) {
          try {
            const data = JSON.parse(ev.data);
            this.listeners.message(data);
          } catch {
            this.listeners.message(ev.data);
          }
        }
      };
      this.ws.onerror = (ev) => {
        if (this.listeners.error) this.listeners.error(ev);
      };
      this.ws.onclose = (ev) => {
        if (this.listeners.close) this.listeners.close(ev);
        if (!this.isClosing) {
          // reconnect
          const wait = this.backoff;
          this.backoff = Math.min(this.backoff * 2, this.maxBackoff);
          setTimeout(() => this._connect(), wait);
        }
      };
    } catch (e) {
      // schedule reconnect
      const wait = this.backoff;
      this.backoff = Math.min(this.backoff * 2, this.maxBackoff);
      setTimeout(() => this._connect(), wait);
    }
  }

  _safeSend(payload) {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
      } else {
        this.queue.push(payload);
      }
    } catch {
      this.queue.push(payload);
    }
  }

  sendJSON(obj) {
    this._safeSend(obj);
  }

  close() {
    this.isClosing = true;
    try { this.ws && this.ws.close(); } catch {}
  }

  get ready() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// ---------- Public API ----------
const state = {
  boardSocket: null,
  boardId: null,
  token: null,
  notifySocket: null,
};

/**
 * Kết nối socket Board: /ws/boards/:boardId/?token=...
 * @param {number|string} boardId
 * @param {string} token - JWT (không cần 'Bearer ')
 * @param {(msg:any)=>void} onMessage
 */
export function connectBoardSocket(boardId, token, onMessage) {
  state.boardId = boardId;
  state.token = token;

  if (state.boardSocket) state.boardSocket.close();

  const buildUrl = () => `${WS_ORIGIN}/ws/boards/${boardId}/?token=${encodeURIComponent(token || '')}`;

  state.boardSocket = new ReconnectingWS(buildUrl, {
    onMessage,
    onOpen: () => { /* console.log('[WS] board open', boardId); */ },
    onClose: () => { /* console.log('[WS] board closed'); */ },
    onError: () => { /* console.log('[WS] board error'); */ },
  });

  return state.boardSocket;
}

/**
 * Kết nối socket Notifications: /ws/notifications/?token=...
 * @param {string} token
 * @param {(msg:any)=>void} onMessage
 */
export function connectNotificationSocket(token, onMessage) {
  if (state.notifySocket) state.notifySocket.close();

  const buildUrl = () => `${WS_ORIGIN}/ws/notifications/?token=${encodeURIComponent(token || '')}`;

  state.notifySocket = new ReconnectingWS(buildUrl, {
    onMessage,
    onOpen: () => { /* console.log('[WS] notify open'); */ },
    onClose: () => { /* console.log('[WS] notify closed'); */ },
  });

  return state.notifySocket;
}

export function closeBoardSocket() {
  if (state.boardSocket) state.boardSocket.close();
  state.boardSocket = null;
}

export function closeAllSockets() {
  if (state.boardSocket) state.boardSocket.close();
  if (state.notifySocket) state.notifySocket.close();
  state.boardSocket = null;
  state.notifySocket = null;
}

/**
 * Tiện ích phát sự kiện từ FE → BE (nếu BE có handle receive)
 * Giữ API tương thích với code cũ: ws.emit(eventName, payload)
 * Ví dụ: ws.emit('card_update', { id, list, pos })
 */
export const ws = {
  emit(event, payload) {
    if (!state.boardSocket) return;
    state.boardSocket.sendJSON({ type: event, payload });
  },
  get ready() {
    return !!state.boardSocket?.ready;
  },
  origin: WS_ORIGIN,
};