// src/api/wsClient.js
const inferWsOrigin = () => {
  if (process.env.REACT_APP_WS_ORIGIN) return process.env.REACT_APP_WS_ORIGIN.replace(/\/+$/, '');
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, host } = window.location;
    const wsProto = protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProto}//${host}`;
  }
  return 'ws://127.0.0.1:8000';
};

export const WS_ORIGIN = inferWsOrigin();

// ---------- Reconnecting WS wrapper ----------
class ReconnectingWS {
  constructor(urlBuilder, { onMessage, onOpen, onClose, onError, shouldReconnect } = {}) {
    this.urlBuilder = urlBuilder;
    this.ws = null;
    this.isClosing = false;
    this.backoff = 500;
    this.maxBackoff = 8000;
    this.queue = [];
    this.listeners = { message: onMessage, open: onOpen, close: onClose, error: onError };

    // default: không reconnect khi unauthorized/forbidden
    this.shouldReconnect = shouldReconnect || ((ev) => ev?.code !== 4401 && ev?.code !== 4403);

    this._connect();
  }

  _connect() {
    try {
      this.ws = new WebSocket(this.urlBuilder());

      this.ws.onopen = (ev) => {
        this.backoff = 500;
        if (this.listeners.open) this.listeners.open(ev);
        while (this.queue.length) this._safeSend(this.queue.shift());
      };

      this.ws.onmessage = (ev) => {
        if (!this.listeners.message) return;
        try {
          const data = JSON.parse(ev.data);
          this.listeners.message(data);
        } catch {
          this.listeners.message(ev.data);
        }
      };

      this.ws.onerror = (ev) => {
        if (this.listeners.error) this.listeners.error(ev);
      };

      this.ws.onclose = (ev) => {
        if (this.listeners.close) this.listeners.close(ev);

        if (!this.isClosing) {
          if (!this.shouldReconnect(ev)) return; // ✅ stop reconnect on 4401/4403

          const wait = this.backoff;
          this.backoff = Math.min(this.backoff * 2, this.maxBackoff);
          setTimeout(() => this._connect(), wait);
        }
      };
    } catch {
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

export function connectBoardSocket(boardId, token, onMessage, opts = {}) {
  state.boardId = boardId;
  state.token = token;

  if (state.boardSocket) state.boardSocket.close();

  const buildUrl = () => `${WS_ORIGIN}/ws/boards/${boardId}/?token=${encodeURIComponent(token || '')}`;

  state.boardSocket = new ReconnectingWS(buildUrl, {
    onMessage,
    onOpen: opts.onOpen,
    onClose: opts.onClose,
    onError: opts.onError,
  });

  return state.boardSocket;
}

export function connectNotificationSocket(token, onMessage, opts = {}) {
  if (state.notifySocket) state.notifySocket.close();

  const buildUrl = () => `${WS_ORIGIN}/ws/notifications/?token=${encodeURIComponent(token || '')}`;

  state.notifySocket = new ReconnectingWS(buildUrl, {
    onMessage,
    onOpen: opts.onOpen,
    onClose: opts.onClose,
    onError: opts.onError,
  });

  return state.notifySocket;
}

export function closeNotificationSocket() {
  if (state.notifySocket) state.notifySocket.close();
  state.notifySocket = null;
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