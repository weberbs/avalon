// Next.js API route that creates or reuses the Socket.IO server instance
// Import initSocket from ../../server/socketServer and attach to req.socket.server if not already done
// Return 200 with message "Socket.IO server running"
import socketIOClient from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '../types/game';


const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const socket = socketIOClient(URL, {
	autoConnect: false,
});

// Helper hooks for React (optional, can be used in components)
export function connectSocket() {
	if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
	if (socket.connected) socket.disconnect();
}

export function onGameUpdated(cb: (payload: Parameters<ServerToClientEvents['game-updated']>[0]) => void) {
	socket.on('game-updated', cb);
	return () => socket.off('game-updated', cb);
}

export function onPlayerJoined(cb: (payload: Parameters<ServerToClientEvents['player-joined']>[0]) => void) {
	socket.on('player-joined', cb);
	return () => socket.off('player-joined', cb);
}

export function onPlayerLeft(cb: (payload: Parameters<ServerToClientEvents['player-left']>[0]) => void) {
	socket.on('player-left', cb);
	return () => socket.off('player-left', cb);
}

export function onError(cb: (payload: Parameters<ServerToClientEvents['error']>[0]) => void) {
	socket.on('error', cb);
	return () => socket.off('error', cb);
}