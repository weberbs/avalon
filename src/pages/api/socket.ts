
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (!(res.socket as any).server.io) {
		const io = new IOServer((res.socket as any).server, {
			path: '/api/socket_io',
			addTrailingSlash: false,
			cors: {
				origin: '*',
				methods: ['GET', 'POST'],
			},
		});
		(res.socket as any).server.io = io;
	}
	res.status(200).json({ message: 'Socket.IO server running' });
}