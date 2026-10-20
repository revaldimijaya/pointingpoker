# Pointing Poker: bug fixes, readability refactor and responsive UI

Date: 2026-10-20
Repos: `pointingpoker` (React client, this repo) and `pointingpoker-server` (Socket.IO server, `D:\Projects\pointingpoker-server`). Both change together.

## Purpose

A Game Master sets a task, members vote story points privately, the Game Master reveals, and the room sees the result. This work makes that flow trustworthy (fix the wrong result and the dropped votes) and makes the code easy for a new reader to follow.

Success criteria:
- The displayed result is correct when some members have not voted.
- A server restart or reconnect no longer silently drops votes.
- A new reader can find any behaviour by file name: each file has one job, and names say what things are.
- `npm test` passes in both repos; dead code and unused dependencies are gone.
- The whole flow (join, vote, reveal, reset) is usable on a phone (375px) and looks deliberate on tablet and desktop, with no horizontal page overflow at 375, 768 and 1280px.

## Scope

In scope: the fixes and refactors below, in both repos, plus the responsive UI refresh in "UI design".

Out of scope (deliberately, may be later tiers):
- Server-owned room state (task, revealed flag, result stored on the server) and server-enforced Game Master authority. Roles stay client-declared; any client can still reveal or reset. The UI hides Game Master controls from other roles (see "UI design"), but that is presentation only; the server still accepts those events from any client.
- A task list or history with results per task. The app stays one task at a time.
- Real Jira integration. The Jira modal stays a tidied stub.

## Behaviour changes

1. **Result.** The result is the average of the votes of members who have voted. Non-voters are excluded. It is shown to one decimal and blank when nobody has voted. The label changes from "Total SP" to "Average SP". The Jira modal still rounds it as it does today. Only participants with role `member` count. The Game Master's client computes the average at reveal time (with `lib/estimate.js`) and sends `reveal` followed by `result`; every client shows what `result` carries. UI labels are otherwise unchanged (the buttons still read "Show All" and "Reset").
2. **Voting after reveal.** Vote buttons are disabled after Reveal until Reset, so the shown result cannot drift from the shown votes.
3. **Vote values.** "Not voted" is `null` (was the magic `0`). Votes are always numbers (were strings from the button `value`).
4. **Reset.** Clients clear the summary when they receive `reset`. The separate empty `calculate` message (which sent `''.task`, i.e. `undefined`) is removed.
5. **Reconnect.** The client re-sends `joinRoom` on every socket `connect`, so a reconnect after a server restart rejoins the room. Socket listeners are removed on cleanup.
6. **Identity.** The server takes the voter from `socket.id` and ignores any id in the payload. The client decides "you" by `participant.id === socket.id`, not by comparing name strings.
7. **Rooms.** Empty rooms are deleted. Joining twice from the same socket updates the entry instead of duplicating it. Events for an unknown room are ignored (already fixed, covered by tests).
8. **Share link.** Copy link uses `window.location.origin` instead of a hard-coded domain.
9. **Socket URL.** `REACT_APP_SOCKET_URL`, defaulting to `http://localhost:4000`. The dead Heroku URL is removed.

## Wire protocol (changed in both repos together)

There is no deployed server to stay compatible with (the Heroku app no longer exists), so names change outright.

Client to server:

| Event | Payload | Was |
|---|---|---|
| `joinRoom` | `{ room, name, role }` | also sent `value: 0` |
| `vote` | `{ room, value }` | `message` `{ id, room, pointingValue }` |
| `reveal` | `{ room }` | `showAll` `{ value, room }` |
| `reset` | `{ room }` | `{ value, room }` |
| `description` | `{ room, value }` | unchanged |
| `result` | `{ room, average, task }` | `calculate` `{ SP, task, room }` |

Server to client:

| Event | Payload | Notes |
|---|---|---|
| `participants` | `[{ id, name, role, vote }]` | `value` renamed `vote`; `vote` is `null` until voted |
| `reveal` | none | broadcast to the whole room |
| `reset` | none | clients clear votes, reveal flag and summary |
| `description` | `{ value }` | to everyone except the sender, as today |
| `result` | `{ average, task }` | to the whole room; `average` is a number or `null` |

The unused `ticket` event is removed from both sides. Event names live in a constants file in each repo, with a comment that the two files must match (there is no shared package).

## Client structure (`pointingpoker`)

```
src/
  index.js            routes only
  config.js           SOCKET_URL
  constants.js        ROLES, STORY_POINTS, EVENTS
  lib/estimate.js     averageVote(participants): pure, unit-tested
  components/ParticlesBackground.js   (was pages/components/particle.js)
  pages/JoinPage/     JoinPage.js, JoinPage.css          (was landingpage)
  pages/RoomPage/     RoomPage.js, RoomPage.css           (was homepage)
                      useRoomSocket.js   socket lifecycle, events, room state
                      RoomHeader.js      room name, copy link, online dot, people button
                      TaskPanel.js       task editor or text, result, Jira button
                      ParticipantList.js (one component, used for the three role groups)
                      VoteCard.js, VotePad.js, MasterControls.js
  pages/TicketForm/   TicketForm.js (was ticket; still a stub)
  assets/logo.svg     local logo for the join page (replaces the hotlinked image)
```

- `RoomPage` wires the hook to the components and holds no socket code. It owns the responsive switch (side panel vs drawer).
- `useRoomSocket({ room, name, role })` creates the socket inside an effect (not at module load) and returns `{ me, connected, participants, description, revealed, result, vote, reveal, reset, publishDescription }`. `connected` follows the socket's `connect` and `disconnect` events.
- Removed: `App.js`, `App.test.js`, `App.css`, `logo.svg`, unused imports (about 25 lint warnings), 16 `console.log` calls, commented-out blocks, `summaryDescription`, the fake modal loading state.
- Dependencies: remove `bootstrap`, `react-bootstrap`, `uid`, `cors`, `express`, `socket.io` (server packages do not belong in the client). Declare `uuid` and `@ant-design/icons`, which are imported today but only resolve transitively.
- Add a short README (what it is, how to run, `REACT_APP_SOCKET_URL`).

## UI design

Today's room page is desktop-only: a fixed 200px sidebar, fixed 200px cards, and a `position: fixed` vote pad that wraps into one 468px column at phone width (21 and 34 fall off-screen and the pad covers the content). The join page already fits at 375px.

One layout with two modes, switched at 768px (antd `md` breakpoint, via `Grid.useBreakpoint`):

```
 below 768px (phone)         768px and up (tablet, desktop)
 header (room, copy, dot, N)  main column | people panel (240px, right)
 task panel                   header
 card grid (2 across)         task panel
 bottom dock                  card grid (auto-fill)
                              bottom dock (centered, max-width)
```

- **Header (`RoomHeader`).** Room name, a copy-link button that shows an antd `message` "Link copied", and an online/offline dot driven by `connected`. On phones it also shows a people button with the participant count that opens an antd `Drawer` containing `ParticipantList`; from 768px the same list is a fixed side panel instead.
- **People list.** Groups (Game Master, Members, Observers) render only when they have people. The large "No data" illustrations go.
- **Task panel (`TaskPanel`).**
  - Game Master: a textarea plus an explicit **Set task** button (Enter still works) that sends `description`, and a labelled **Create Jira ticket** button (replaces the floating icon).
  - Members and observers: the task as read-only text, or "Waiting for the Game Master to set a task..." when empty. They can no longer edit or broadcast the task.
  - After reveal, all roles see **Average SP** large next to the task text.
- **Card grid.** CSS grid, `repeat(auto-fill, minmax(140px, 1fr))` with a 16px gap, which gives 2 columns at 375px. Cards drop the fixed 200px width. Card states stay: own vote shown, others show `?` until they vote, a check once voted, the number after reveal.
- **Bottom dock.** Fixed to the bottom with safe-area padding; centered with `max-width` from 768px. Content depends on role:
  - Member: vote pad, 4 columns by 2 rows, buttons at least 44px tall, selected vote filled and marked `aria-pressed`, all disabled after reveal until reset.
  - Game Master: **Show All** and **Reset**.
  - Observer: "You're observing".
  - The page reserves bottom padding equal to the dock height so the last card is never covered.
- **Join page.** Local `assets/logo.svg` instead of the hotlinked image, smaller on phones; the placeholder "Extra information" tooltip is removed; one-line hints under the role select (Member votes, Game Master runs the round, Observer watches); `min-height: 100dvh`. The particle background is not rendered below 768px or when the user prefers reduced motion.
- **Styling approach.** Plain CSS (grid, flex, media queries) in each page's CSS file replaces inline styles and antd `Layout`/`Col` used as spacing wrappers. One antd `ConfigProvider` theme token pass sets a single accent color and a consistent corner radius. No dark mode.
- **Accessibility basics.** Touch targets of 44px or more, `aria-pressed` on the selected vote, text labels on icon-only buttons (`aria-label`), and the online dot has a text alternative.

## Server structure (`pointingpoker-server`)

```
server.js     startup only: express app, http server, socket.io, listen
rooms.js      room store, plain data, no socket.io
handlers.js   registers socket event handlers; thin wiring over rooms.js
events.js     event name constants
```

`rooms.js` exposes a store with:
- `join(roomId, { id, name, role })` returns the room's participants
- `leave(socketId)` returns the room id the socket left, or `null`
- `vote(roomId, socketId, value)` returns participants, or `null` for an unknown room or participant
- `resetVotes(roomId)` returns participants, or `null` for an unknown room
- `participants(roomId)` returns the participants (empty for an unknown room)

`handlers.js` uses `io.to(room).emit` where the code today pairs `socket.emit` with `socket.to(room).emit`. `description` keeps `socket.to(room)` because the sender already has the text. Commented-out code and noisy payload logging are removed. `vercel.json` is deleted (serverless cannot hold long-lived WebSockets; the Procfile is the real deploy). `package.json` gets a real name and an `engines` field. Add a short README.

## Testing

Server (test-first, `node --test`):
- `rooms.test.js`: unit tests for the store (join, duplicate join, leave, vote, reset, empty-room cleanup, unknown room).
- `server.test.js`: the existing process-level tests, updated to the new event names; plus a reconnect test and a test that a vote uses the socket id, not a payload id.

Client (`npm test`):
- `lib/estimate.test.js`: average excludes non-voters, blank when none, one decimal.
- Component tests for `VoteCard` (own card shows value; others show `?` / check / value by state), `VotePad` (disabled after reveal) and `TaskPanel` (Game Master sees an editor; other roles see read-only text). antd needs a `window.matchMedia` stub in `setupTests.js`.

Manual checks at the end:
- Two browser tabs (Game Master and Member) through vote, reveal, reset, and a server restart with a vote afterwards.
- Responsive pass in the browser at 375x812, 768x1024 and 1280x800, for each role: no horizontal overflow (`scrollWidth <= innerWidth`), the vote pad's 8 buttons and the dock never covering the last card, the people drawer opening on phones, and a screenshot reviewed at each size.

## Order of work

1. Server: `rooms.js` with tests, then `handlers.js`, `events.js`, startup, new protocol, cleanup.
2. Client structure: `estimate.js` with tests, constants and config, `useRoomSocket`, components, page renames, dead code and dependency cleanup. Behaviour is unchanged from the user's point of view except the fixes above.
3. Client UI: layout, header, task panel, dock, people drawer, join page, theme (builds on the components from step 2, so it is done after, not before).
4. READMEs, then the manual two-tab check and the responsive pass.

## Risks

- Both repos must be updated together; the old and new protocol do not interoperate. Acceptable because nothing is deployed.
- Component tests with antd can need extra jsdom stubs; if a test is not worth its stubs, the logic it covers stays in the pure `estimate.js` instead.
