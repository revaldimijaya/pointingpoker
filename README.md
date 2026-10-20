# Pointing Poker

Planning poker for estimating story points as a team.

1. The **Game Master** sets the task.
2. **Members** pick a story point (1, 2, 3, 5, 8, 13, 21, 34) in private.
3. The Game Master presses **Show All**: everyone's votes are revealed along with the average.
4. **Reset** clears the votes for the next task.

**Observers** can watch without voting. Share the room link (copy button in the header) to invite people.
The layout works on phones, tablets and desktops.

## Run it

This client needs the [pointingpoker-server](https://github.com/revaldimijaya/pointingpoker-server) running.

```bash
# server (in the pointingpoker-server repo)
npm install
npm start          # http://localhost:4000

# client (this repo)
npm install
npm start          # http://localhost:3000
```

The client connects to `http://localhost:4000` by default. To use another server, set
`REACT_APP_SOCKET_URL` (for example in a git-ignored `.env.local`) before starting or building.

```bash
npm test           # unit and component tests
npm run build      # production build
```

## Layout

- `src/pages/JoinPage`: choose a name, role and session.
- `src/pages/RoomPage`: the room (`useRoomSocket` holds all socket handling; the rest are small components).
- `src/pages/TicketForm`: placeholder for a future Jira integration.
- `src/lib`: pure helpers (`averageVote`, `displayName`).
- `src/constants.js`: roles, story points and socket event names (keep in sync with the server's `events.js`).
