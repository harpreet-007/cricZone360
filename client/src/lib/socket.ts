import { io } from 'socket.io-client';

declare global {
  interface Window {
    __CRICZONE_CONFIG__?: {
      API_URL?: string;
      SOCKET_URL?: string;
    };
  }
}

const isLocalHost = (hostname: string) =>
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

const getSocketUrl = () => {
  const configured = process.env.NEXT_PUBLIC_SOCKET_URL;

  if (typeof window === 'undefined') {
    return configured || 'http://localhost:5001';
  }

  if (window.__CRICZONE_CONFIG__?.SOCKET_URL) return window.__CRICZONE_CONFIG__.SOCKET_URL;
  if (configured) return configured;
  if (isLocalHost(window.location.hostname)) return 'http://localhost:5001';
  return '';
};

const socketUrl = getSocketUrl();

export const socket = io(socketUrl || 'http://localhost:5001', {
  autoConnect: Boolean(socketUrl),
  reconnection: true,
});

export default socket;
