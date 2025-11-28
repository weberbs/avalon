
# Avalon: The Resistance (Online)

This is a real-time online implementation of the social deduction game **The Resistance: Avalon**, built with [Next.js](https://nextjs.org), [TypeScript](https://www.typescriptlang.org/), [Socket.IO](https://socket.io/), and [Tailwind CSS](https://tailwindcss.com/).

## Features

- Create or join Avalon games with a unique game code
- Real-time gameplay and state sync via Socket.IO
- All core Avalon roles and phases: lobby, role reveal, team building, voting, questing, assassination, and game end
- Responsive, modern UI with Tailwind CSS
- Player roles and information are kept private and secure

## Getting Started

1. **Install dependencies:**

	```bash
	npm install
	# or
	yarn install
	```

2. **Start the development server:**

	```bash
	npm run dev
	# or
	yarn dev
	```

3. **Start the Socket.IO server:**

	(If running separately, see `src/server/tServer.ts` for details.)

4. **Open your browser:**

	Go to [http://localhost:3000](http://localhost:3000)

## Project Structure

- `src/app/` — Next.js app directory (pages, layout, routing)
- `src/types/game.ts` — TypeScript types for all game logic and socket events
- `src/lib/` — Game logic, socket hooks, and context
- `src/components/` — UI components (PlayerCard, QuestBoard, RoleRevealModal, etc.)
- `src/server/` — Socket.IO server implementation

## Development Notes

- The game logic is implemented in `src/lib/ganeLogic.ts` and is fully type-safe.
- All socket events are strongly typed for both client and server.
- UI is designed for desktop and mobile.

## Roadmap / TODO

- Add support for custom roles and advanced variants
- Add in-game chat
- Add animations and sound effects
- Improve mobile experience

## License

MIT
