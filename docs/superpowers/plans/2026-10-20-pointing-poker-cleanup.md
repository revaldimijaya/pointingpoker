# Pointing Poker Cleanup and Responsive UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the wrong result and the dropped votes, make both repos easy to read, and make the room usable on phones.

**Architecture:** The server gets a pure room store behind thin socket handlers on a renamed protocol. The client gets one socket hook and small components; layout is plain CSS with a 768px switch between a phone layout (people drawer plus bottom dock) and a desktop layout (people side panel).

**Tech Stack:** Node 20, Express, Socket.IO 4, `node --test` (server); React 18 (CRA, Jest, React Testing Library), antd 5, socket.io-client 4 (client).

**Spec:** `docs/superpowers/specs/2026-10-20-pointing-poker-cleanup-design.md` (in the client repo). Read it first.

`[server]` = `D:\Projects\pointingpoker-server`, `[client]` = `D:\Projects\pointingpoker`. Work on branch `cleanup-and-responsive-ui` in each. The live app is unusable between Task 3 (new protocol on the server) and Task 10 (client switched over).

## Global Constraints

- **Protocol (names exact, both repos).** Client to server: `joinRoom {room,name,role}`, `vote {room,value}`, `reveal {room}`, `reset {room}`, `description {room,value}`, `result {room,average,task}`. Server to client: `participants [{id,name,role,vote}]` (`vote` is `null` until voted), `reveal`, `reset`, `description {value}` (everyone except the sender), `result {average,task}` (whole room). No `ticket` event.
- Roles stay `master`, `member`, `observer`; UI labels "Game Master", "Member", "Observer"; buttons read "Show All" and "Reset"; the result label is "Average SP".
- Average = members who have voted only, one decimal, `null` when none.
- Socket URL = `REACT_APP_SOCKET_URL`, default `http://localhost:4000`. Copy link = `window.location.origin + '/' + room`.
- Breakpoint 768px. Card grid `repeat(auto-fill, minmax(140px, 1fr))` with 16px gap. Touch targets at least 44px. No dark mode.
- No `console.log` and no commented-out code in any file this plan creates or edits.
- Server tests: `npm test` (`node --test`). Client tests: `npm test -- --watchAll=false`.
- Windows. In a fresh PowerShell run `$env:Path = "C:\Program Files\nodejs;" + $env:Path` before `node`/`npm`.
- `package.json` `engines`: `{"node": ">=18"}` (the plan's choice; Node 20 is installed).
- Commit messages end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A socket event with a missing or `null` payload (`joinRoom`, `vote`, `reveal`, `reset`, `description`, `result`) must not crash the server. Pinned in Task 3.
2. A vote that is not a finite number (string, `null`, `Infinity`) is ignored by the store. Pinned in Task 2.
3. Nobody has voted, or only the Game Master or observers are present: the average is `null` and the UI shows no number (no `NaN`, no `0`). Pinned in Tasks 5 and 9.
4. Two people with the same display name: both are listed, and "me" is the one whose id equals the socket id. Pinned in Tasks 7 and 8.
5. A 15-character name, a 300-character task with no spaces, and 12 members on a 375px screen: no horizontal overflow and the dock never covers the last card. Pinned in Tasks 11 and 13.

---

### Task 1: Branches and baselines

**Files:** none edited; git only, both repos.

- [ ] **Step 1: [server]** `git checkout -b cleanup-and-responsive-ui`; `npm test` shows 3 passing; commit the existing uncommitted crash fix: `git add server.js server.test.js package.json package-lock.json && git commit -m "fix: ignore votes and resets for unknown rooms"`.
- [ ] **Step 2: [client]** `git checkout -b cleanup-and-responsive-ui`; commit the spec and plan: `git add docs && git commit -m "docs: add cleanup spec and plan"`; commit the existing socket-URL edit: `git add src/pages/homepage/homepage.js && git commit -m "feat: read socket URL from REACT_APP_SOCKET_URL"`. `.env.local` stays untracked (gitignored).

---

### Task 2: Server room store

**Files:** Create `[server] events.js`, `[server] rooms.js`, `[server] rooms.test.js`.

**Interfaces:**
- Produces `events.js`: `module.exports = { EVENTS }` with `EVENTS = { JOIN_ROOM:'joinRoom', VOTE:'vote', REVEAL:'reveal', RESET:'reset', DESCRIPTION:'description', RESULT:'result', PARTICIPANTS:'participants' }` and a comment that the client's `src/constants.js` must match.
- Produces `rooms.js`: `createRoomStore()` returning
  `join(roomId, {id, name, role}) -> Participant[]`,
  `leave(socketId) -> string|null` (room id the socket left),
  `vote(roomId, socketId, value) -> Participant[]|null`,
  `resetVotes(roomId) -> Participant[]|null`,
  `participants(roomId) -> Participant[]`.
  `Participant = {id, name, role, vote: number|null}`. Returned arrays and objects are copies.

- [ ] **Step 1: Write `rooms.test.js`** (`node:test`, `assert`, a fresh `createRoomStore()` per test):

```js
const A = { id: 'a', name: 'Alice#1', role: 'member' };
const B = { id: 'b', name: 'Bob#2', role: 'member' };
test('join returns the participant with vote null', () =>
  assert.deepStrictEqual(store.join('r1', A), [{ ...A, vote: null }]));
test('joining twice with the same id updates instead of duplicating and keeps the vote', () => {
  store.join('r1', A); store.vote('r1', 'a', 5);
  assert.deepStrictEqual(store.join('r1', { ...A, name: 'Alice#9' }), [{ ...A, name: 'Alice#9', vote: 5 }]);
});
test('vote sets only that participant', () => {
  store.join('r1', A); store.join('r1', B);
  assert.deepStrictEqual(store.vote('r1', 'a', 8).map(p => p.vote), [8, null]);
});
test('vote returns null for an unknown room', () => assert.strictEqual(store.vote('nope', 'a', 3), null));
test('vote returns null when the socket is not in that room', () => {
  store.join('r1', A); assert.strictEqual(store.vote('r1', 'zzz', 3), null);
});
test('vote ignores values that are not finite numbers', () => {   // Review Focus 2
  store.join('r1', A);
  for (const bad of ['abc', null, undefined, Infinity, NaN]) assert.strictEqual(store.vote('r1', 'a', bad), null);
  assert.strictEqual(store.participants('r1')[0].vote, null);
});
test('resetVotes sets every vote to null', () => {
  store.join('r1', A); store.join('r1', B); store.vote('r1', 'a', 5); store.vote('r1', 'b', 8);
  assert.deepStrictEqual(store.resetVotes('r1').map(p => p.vote), [null, null]);
});
test('resetVotes returns null for an unknown room', () => assert.strictEqual(store.resetVotes('nope'), null));
test('leave removes the participant and returns the room id', () => {
  store.join('r1', A); store.join('r1', B);
  assert.strictEqual(store.leave('a'), 'r1');
  assert.deepStrictEqual(store.participants('r1').map(p => p.id), ['b']);
});
test('leave deletes a room that becomes empty', () => {
  store.join('r1', A); store.leave('a');
  assert.deepStrictEqual(store.participants('r1'), []);
  assert.strictEqual(store.vote('r1', 'a', 3), null);
});
test('leave returns null for a socket in no room', () => assert.strictEqual(store.leave('ghost'), null));
test('participants returns [] for an unknown room', () => assert.deepStrictEqual(store.participants('nope'), []));
test('returned participants are copies', () => {
  store.join('r1', A); store.participants('r1')[0].vote = 99;
  assert.strictEqual(store.participants('r1')[0].vote, null);
});
```

- [ ] **Step 2: Run `node --test rooms.test.js`.** Expected: fails with `Cannot find module './rooms'`.
- [ ] **Step 3: Create `events.js` and implement `createRoomStore` in `rooms.js`.** Use `Map<roomId, Map<socketId, Participant>>`; delete a room in `leave` when it empties; `vote` returns `null` unless `Number.isFinite(value)` (typeof number).
- [ ] **Step 4: Run `node --test rooms.test.js`.** Expected: 13 tests pass.
- [ ] **Step 5: Commit** `git add events.js rooms.js rooms.test.js && git commit -m "feat: add room store and event names"`.

---

### Task 3: Server handlers and startup on the new protocol

**Files:** Create `[server] handlers.js`; rewrite `[server] server.js` (startup only: express app with `cors()` and the existing `GET /` text page, http server, socket.io with `cors: { origin: '*' }`, `registerHandlers(io, createRoomStore())`, `listen(PORT)` with `PORT` from env, default 4000); modify `[server] server.test.js`.

**Interfaces:**
- Consumes `EVENTS`, `createRoomStore()` (Task 2).
- Produces `registerHandlers(io, store)` in `handlers.js`; per connection it handles:
  - `joinRoom`: `socket.join(room)`, `store.join(room, {id: socket.id, name, role})`, emit `participants` to the room.
  - `vote`: `store.vote(room, socket.id, value)`; ignore when `null`; else emit `participants` to the room. The voter is always `socket.id`.
  - `reveal`: emit `reveal` to the room.
  - `reset`: `store.resetVotes(room)`; ignore when `null`; emit `participants`, then `reset`, to the room.
  - `description`: `socket.to(room).emit('description', {value})`.
  - `result`: `io.to(room).emit('result', {average, task})`.
  - `disconnect`: `store.leave(socket.id)`; when a room id comes back, emit `participants` (from `store.participants`) to that room.
  - Every event is ignored unless its payload is an object with a string `room`.

- [ ] **Step 1: Update and extend `server.test.js`** (keep its spawn-a-real-server `beforeEach`/`afterEach`). Migrate the three existing tests to `vote {room, value}` and `reset {room}`, then add (names and assertions):

```js
test('events with a missing or null payload do not crash the server', async () => {   // Review Focus 1
  const c = await connect();
  for (const ev of ['joinRoom','vote','reveal','reset','description','result']) { c.emit(ev); c.emit(ev, null); }
  await assertServerStillRunning();
});
test('a vote uses the socket id, not an id in the payload', ...)
  // alice emits vote {room, value: 5, id: bob.id}; the next participants list has alice.vote 5 and bob.vote null
test('reveal reaches everyone in the room, including the sender', ...)       // both receive 'reveal'
test('reset clears every vote and notifies the room', ...)                    // both receive participants with all vote null, then 'reset'
test('result is delivered to the whole room with average and task', ...)      // both receive { average: 5, task: 'PTP-1' }
test('description reaches the others but not the sender', ...)               // bob receives { value: 'PTP-1' }; alice receives nothing within 300ms
test('a disconnected participant is removed from the room', ...)             // bob.close(); alice receives a list of length 1
test('a participant who disconnects and rejoins on a new connection is listed once', ...) // same name, new socket: final list length 1
```
- [ ] **Step 2: Run `npm test`.** Expected: the new and migrated tests FAIL against the old `server.js` (old event names); note which.
- [ ] **Step 3: Implement `handlers.js` and rewrite `server.js`** as specified above. No commented-out code, no `console.log` except the single startup line `Server is running on *: <PORT>` (the tests wait for that text).
- [ ] **Step 4: Run `npm test`.** Expected: all tests pass (13 store tests plus the server tests), clean output.
- [ ] **Step 5: Commit** `git add -A && git commit -m "refactor: split server into handlers and room store; rename protocol events"`.

---

### Task 4: Server housekeeping

**Files:** Delete `[server] vercel.json`; modify `[server] package.json`; create `[server] README.md`.

- [ ] **Step 1:** `git rm vercel.json`.
- [ ] **Step 2:** In `package.json` set `"name": "pointingpoker-server"`, add `"engines": {"node": ">=18"}` and `"start": "node server.js"` to `scripts`. Then `npm install --package-lock-only --lockfile-version=1 --no-audit --no-fund` so the lockfile name matches.
- [ ] **Step 3:** `README.md`: what it is (Socket.IO server for Pointing Poker), `npm install`, `npm start` (`PORT`, default 4000), `npm test`, protocol lives in `events.js` and must match the client's `src/constants.js`, deploys via the `Procfile`. Keep under 30 lines.
- [ ] **Step 4:** `npm test` passes; `npm start` then `curl http://localhost:4000/` returns the "Socket IO Start" page (stop it afterwards; port 4000 may be in use by the dev server, so in PowerShell set `$env:PORT = "4010"` first).
- [ ] **Step 5: Commit** `git add -A && git commit -m "chore: server housekeeping (remove vercel.json, package metadata, README)"`.

---

### Task 5: Client constants, config and pure helpers

**Files:** Create `[client] src/constants.js`, `src/config.js`, `src/lib/estimate.js`, `src/lib/estimate.test.js`, `src/lib/names.js`, `src/lib/names.test.js`.

**Interfaces:**
- Produces `constants.js`: `ROLES = {MASTER:'master', MEMBER:'member', OBSERVER:'observer'}`, `ROLE_LABELS` (`master`: "Game Master", `member`: "Member", `observer`: "Observer"), `STORY_POINTS = [1,2,3,5,8,13,21,34]`, `EVENTS` (same keys and values as the server's, with a "keep in sync with the server's events.js" comment).
- Produces `config.js`: `SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000'`.
- Produces `lib/estimate.js`: `averageVote(participants: Participant[]): number | null`. Only `role === ROLES.MEMBER` with a non-null `vote` count; one decimal.
- Produces `lib/names.js`: `displayName(name: string): string`; strips only the last `#suffix`.

- [ ] **Step 1: Write the tests.**

```js
// estimate.test.js, with m = (vote, role = ROLES.MEMBER) => ({ id: 'x', name: 'x#1', role, vote })
expect(averageVote([m(5), m(5), m(null)])).toBe(5);              // non-voters excluded
expect(averageVote([m(3), m(5), m(13, ROLES.MASTER)])).toBe(4);  // master ignored
expect(averageVote([m(1), m(2), m(2)])).toBe(1.7);               // one decimal
expect(averageVote([m(null), m(null, ROLES.MASTER)])).toBeNull();// Review Focus 3
expect(averageVote([])).toBeNull();
// names.test.js
expect(displayName('Alice#1a2b3c4d')).toBe('Alice');
expect(displayName('C#dev#1a2b3c4d')).toBe('C#dev');   // a # typed by the user is kept
expect(displayName('Alice')).toBe('Alice');
```
- [ ] **Step 2: Run** `npm test -- --watchAll=false src/lib`. Expected: FAIL, modules not found.
- [ ] **Step 3: Create the five source files** per the interfaces.
- [ ] **Step 4: Run the same command.** Expected: 8 tests pass. (The old `App.test.js` still fails until Task 6; run scoped.)
- [ ] **Step 5: Commit** `git add src && git commit -m "feat: add constants, config, averageVote and displayName"`.

---

### Task 6: Remove boilerplate and fix dependencies

**Files:** Delete `[client] src/App.js`, `src/App.test.js`, `src/App.css`, `src/logo.svg`; modify `src/index.js`, `src/setupTests.js`, `package.json`, `package-lock.json`.

- [ ] **Step 1:** `git rm` the four files. In `src/index.js` drop the `App`, `withRouter`, `Link` and `hashHistory` imports.
- [ ] **Step 2:** Add a `window.matchMedia` stub (returns `matches: false`, `addListener`/`removeListener`/`addEventListener`/`removeEventListener` no-ops) to `src/setupTests.js` after the existing jest-dom import. antd needs it under jsdom.
- [ ] **Step 3:** `npm uninstall bootstrap react-bootstrap uid cors express socket.io`, then `npm install uuid @ant-design/icons` (use the versions already in the lockfile: check with `npm ls uuid @ant-design/icons` first and install those exact ranges).
- [ ] **Step 4: Verify.** `grep -rn "bootstrap\|from 'uid'\|from 'cors'" src` finds nothing; `npm test -- --watchAll=false` exits 0 with the 8 lib tests; the dev server at :3000 still compiles (old pages still import fine).
- [ ] **Step 5: Commit** `git add -A && git commit -m "chore: remove boilerplate and unused dependencies, declare uuid and antd icons"`.

---

### Task 7: `useRoomSocket` hook

**Files:** Create `[client] src/pages/RoomPage/useRoomSocket.js`, `src/pages/RoomPage/useRoomSocket.test.js`.

**Interfaces:**
- Consumes `EVENTS`, `SOCKET_URL`, `averageVote`.
- Produces `useRoomSocket({ room, name, role }, createSocket = defaultCreateSocket)`. `createSocket()` returns a socket with `id`, `on`, `off`, `emit`, `close`. The default is `io(SOCKET_URL)`. The socket is created in an effect and closed on unmount, with every listener removed. Returns
  `{ me, connected, participants, description, revealed, result, vote(value: number), reveal(), reset(), publishDescription(text: string) }`
  where `me` is the participant whose `id` equals the socket id (or `undefined`), `result` is `{average, task} | null`, `description` is the last published or received task text.

- [ ] **Step 1: Write the tests** with `renderHook`/`act` and an in-test `FakeSocket` (records emits; `trigger(event, payload)` calls listeners; `id` settable):

```js
test('joins the room on every connect, including reconnects')       // trigger('connect') x2 -> two joinRoom {room,name,role} emits
test('connected follows connect and disconnect')
test('stores participants and finds me by socket id')               // id 's1'; list of s1,s2 -> me.name is s1's
test('two people with the same display name: me is the one with the socket id')   // Review Focus 4: 'Alice#1' (s1), 'Alice#2' (s2); id 's2' -> me.id 's2'
test('vote emits vote with room and the numeric value')             // vote(5) -> emit('vote', {room, value: 5})
test('reveal emits reveal, then result with the average and published task')
  // members voted 3 and 5, publishDescription('PTP-1') -> ('reveal',{room}) then ('result',{room, average: 4, task: 'PTP-1'})
test('revealed is true after a reveal event; reset sets it false and clears the result')
test('a result event stores average and task')
test('a description event updates description; publishDescription emits and updates locally')
test('unmount closes the socket and removes every listener')
```
- [ ] **Step 2: Run** `npm test -- --watchAll=false src/pages/RoomPage/useRoomSocket`. Expected: FAIL, module not found.
- [ ] **Step 3: Implement the hook.** Keep the socket id in state, set on each `connect`; emit `joinRoom` inside the `connect` listener only.
- [ ] **Step 4: Run it again.** Expected: all pass.
- [ ] **Step 5: Commit** `git add src && git commit -m "feat: add useRoomSocket hook"`.

---

### Task 8: `VoteCard`, `VotePad`, `ParticipantList`

**Files:** Create in `[client] src/pages/RoomPage/`: `VoteCard.js`, `VotePad.js`, `ParticipantList.js` and one `.test.js` each.

**Interfaces:**
- Consumes `displayName`, `ROLES`, `ROLE_LABELS`.
- Produces `VoteCard({ participant, isMe, revealed })`: antd `Card` titled with the display name plus " (you)" when `isMe`; body shows the own vote or `?`; for others `?` before voting, an icon with `aria-label="voted"` once voted, the number after reveal.
- Produces `VotePad({ storyPoints, selected, disabled, onVote })`: one button per story point, `aria-pressed={selected === n}`, `onVote(n)`.
- Produces `ParticipantList({ participants, meId })`: groups "Game Master", "Members", "Observers", each rendered only when it has people; names via `displayName`.

- [ ] **Step 1: Write the tests** (RTL):

```js
// VoteCard
'shows the display name with (you) for the current user'
'shows the own vote, or ? when the current user has not voted'
'shows ? for another participant who has not voted'
'shows an element named "voted" for another participant who voted, before reveal'
'shows the number for another participant after reveal'
// VotePad
'renders one button per story point'                       // 8 buttons for STORY_POINTS
'calls onVote with the number when a button is pressed'    // press "8" -> onVote(8)
'marks only the selected vote aria-pressed'
'disables every button when disabled'
// ParticipantList
'renders only the groups that have people'                 // no "Observers" heading with no observers
'lists display names without the id suffix'
'lists two participants with the same display name'        // Review Focus 4: both rows present
```
- [ ] **Step 2: Run** `npm test -- --watchAll=false src/pages/RoomPage`. Expected: the new tests FAIL (modules not found).
- [ ] **Step 3: Implement the three components.** Plain markup and class names only; layout comes in Task 11.
- [ ] **Step 4: Run it again.** Expected: all pass.
- [ ] **Step 5: Commit** `git add src && git commit -m "feat: add VoteCard, VotePad and ParticipantList"`.

---

### Task 9: `TaskPanel`, `MasterControls`, `RoomHeader`

**Files:** Create in `[client] src/pages/RoomPage/`: `TaskPanel.js`, `MasterControls.js`, `RoomHeader.js`, `TaskPanel.test.js`, `RoomHeader.test.js`.

**Interfaces:**
- Produces `TaskPanel({ role, description, result, onPublish, onCreateTicket })`:
  - Game Master: antd `Input.TextArea` seeded from `description`, a **Set task** button (and Enter without Shift) calling `onPublish(text)`, and a **Create Jira ticket** button calling `onCreateTicket()`.
  - Other roles: the task as text, or "Waiting for the Game Master to set a task..." when empty.
  - When `result` is non-null: a row labelled "Average SP" whose value element has `data-testid="average-sp"`; its text is `result.average` (blank when `null`).
- Produces `MasterControls({ onReveal, onReset })`: buttons "Show All" and "Reset".
- Produces `RoomHeader({ room, connected, participantCount, onOpenPeople })`: room name; a copy button (`aria-label="Copy invite link"`) that calls `navigator.clipboard.writeText(window.location.origin + '/' + room)` and shows an antd `message.success('Link copied')`; a status dot with visible-to-screen-readers text "Online"/"Offline"; a people button showing the count only when `onOpenPeople` is passed.

- [ ] **Step 1: Write the tests:**

```js
// TaskPanel
'Game Master sees a textarea and Set task, which calls onPublish with the typed text'
'pressing Enter in the textarea also publishes'
'Game Master Create Jira ticket button calls onCreateTicket'
'members see the task as text and no textbox'
'members see the waiting message when the description is empty'
'shows Average SP and the number once a result arrives'        // average 4.5 -> "4.5"
'shows no number when the average is null'                     // Review Focus 3: getByTestId('average-sp').textContent === '' and no "NaN"
'hides the Average SP row until a result arrives'
// RoomHeader (stub navigator.clipboard.writeText with a jest.fn)
'shows the room name and Online or Offline'
'copy writes origin + /room to the clipboard and shows Link copied'
'shows the people button with the count only when onOpenPeople is given'
```
- [ ] **Step 2: Run** `npm test -- --watchAll=false src/pages/RoomPage`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement the three components.**
- [ ] **Step 4: Run it again.** Expected: all pass.
- [ ] **Step 5: Commit** `git add src && git commit -m "feat: add TaskPanel, MasterControls and RoomHeader"`.

---

### Task 10: `RoomPage`, `JoinPage`, routes (structure complete)

**Files:** Create `[client] src/pages/RoomPage/RoomPage.js`, `RoomPage.css` (empty placeholder, filled in Task 11), `src/pages/JoinPage/JoinPage.js`, `JoinPage.css` (moved from `landingpage.css`), `src/pages/TicketForm/TicketForm.js`, `src/components/ParticlesBackground.js`. Modify `src/index.js`. Delete `src/pages/homepage/`, `src/pages/landingpage/`, `src/pages/ticket/`, `src/pages/components/`.

**Interfaces:**
- Consumes everything from Tasks 5, 7, 8, 9.
- Produces `RoomPage` (default export): reads `{ name, room, role }` from `useLocation().state` and renders `<Navigate to="/" replace />` if any is missing; calls `useRoomSocket`; shows `RoomHeader`, `TaskPanel`, a `VoteCard` per member (`isMe = participant.id === me?.id`), `ParticipantList` (`meId={me?.id}`), and a dock area: members get `VotePad` (`selected={me?.vote ?? null}`, `disabled={revealed}`), the Game Master gets `MasterControls` (`onReveal={reveal}`, `onReset={reset}`), observers get the text "You're observing". A Jira `Modal` (`footer={null}`, `destroyOnClose`) holds `TicketForm`.
- Produces `TicketForm({ description, totalSP })`: the existing stub form without `console.log`, unused imports or `param.param`; Total SP defaults to `Math.round(totalSP)` when it is a number.
- Produces `JoinPage`: same behaviour as the old landing page (3 to 15 character username, role select, session prefilled from the `:roomuuid` URL param or one `uuidv4()` computed once with `useMemo`, name suffix `#` + first 8 chars of a uuid, navigate to `/session` with `{ name, room, role }`). Role options come from `ROLE_LABELS`. Keep the existing `window.onpopstate` reload handler unchanged (out of scope).
- Produces `ParticlesBackground`: the old particle component without `console.log`, unused imports or commented code.
- Routes in `index.js`: `/:roomuuid?` is `JoinPage`, `/session` is `RoomPage`.

- [ ] **Step 1:** Create/move the files above; delete the old directories.
- [ ] **Step 2:** `CI=true npm run build` succeeds with no warnings (CI mode turns lint warnings into errors; in PowerShell: `$env:CI = "true"; npm run build`). `grep -rn "console.log" src` finds nothing.
- [ ] **Step 3:** `npm test -- --watchAll=false` passes.
- [ ] **Step 4: Manual smoke.** Restart the server on :4000 with the new code (stop the old process, `node server.js`). In two browser tabs join one room as Game Master and Member; vote, Show All, Reset. Expected: all work as before; after Show All the member's vote buttons are disabled until Reset; Total shows "Average SP".
- [ ] **Step 5: Commit** `git add -A && git commit -m "refactor: split room and join pages into focused components"`.

---

### Task 11: Responsive room layout

**Files:** Modify `[client] src/pages/RoomPage/RoomPage.js`, `src/pages/RoomPage/RoomPage.css`.

**Interfaces:** consumes the components from Tasks 8 to 10; produces no new exports.

- [ ] **Step 1: Layout.** In `RoomPage.js` use antd `Grid.useBreakpoint()`; `isPhone = !screens.md`. From 768px render the people list as a 240px right-hand panel; on phones pass `onOpenPeople` to `RoomHeader` and render the list in an antd `Drawer`. Cards sit in a CSS grid `repeat(auto-fill, minmax(140px, 1fr))`, 16px gap, with no fixed card width.
- [ ] **Step 2: Dock.** Fixed to the bottom with `padding-bottom: env(safe-area-inset-bottom)`, centered with a `max-width` from 768px. The vote pad is a 4-column by 2-row grid with buttons at least 44px tall, selected vote filled. The page reserves bottom padding at least as tall as the dock. Remove all inline styles and `Layout`/`Col` spacing wrappers; set `overflow-wrap: anywhere` on names and task text; `min-height: 100dvh`.
- [ ] **Step 3: Verify in the browser** (dev server :3000, server :4000) at 375x812, 768x1024 and 1280x800, as Game Master and as Member. At each size run `document.documentElement.scrollWidth <= window.innerWidth` (expect `true`) and take a screenshot to review. Check: all 8 vote buttons visible and tappable at 375; the people button opens the drawer on phones and the side panel shows from 768; with the page scrolled to the bottom the last card's bottom edge is above the dock's top edge.
- [ ] **Step 4: Stress inputs (Review Focus 5).** Join a member named `WWWWWWWWWWWWWWW`; as Game Master publish a task of 300 `a` characters; from the client repo add 12 more members with `node -e` using `./node_modules/socket.io-client` (`io('http://localhost:4000')`, emit `joinRoom` for each). Re-run the overflow check and the last-card check at 375px. Expected: no overflow, last card not covered.
- [ ] **Step 5: Commit** `git add -A && git commit -m "feat: responsive room layout with people drawer and bottom dock"`.

---

### Task 12: Join page refresh and theme

**Files:** Create `[client] src/assets/logo.svg`; modify `src/pages/JoinPage/JoinPage.js`, `JoinPage.css`, `src/index.js`.

- [ ] **Step 1:** `logo.svg`: a simple stack-of-cards mark, any simple SVG, no external fetch. `JoinPage` uses it (smaller on phones) in place of the thenounproject image.
- [ ] **Step 2:** Remove the placeholder "Extra information" tooltip. Under the role select add one-line hints: Member votes; Game Master runs the round; Observer watches. Use `min-height: 100dvh`. Do not render `ParticlesBackground` below 768px (`Grid.useBreakpoint`) or when `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
- [ ] **Step 3:** In `index.js` wrap the router in antd `ConfigProvider` with `theme={{ token: { colorPrimary: '#4f46e5', borderRadius: 8 } }}`.
- [ ] **Step 4: Verify** at 375x812 and 1280x800: no horizontal overflow, the join form works end to end, particles canvas (`#tsparticles`) is absent at 375 and present at 1280.
- [ ] **Step 5: Commit** `git add -A && git commit -m "feat: join page refresh, local logo and theme"`.

---

### Task 13: README and final verification

**Files:** Rewrite `[client] README.md` (replace the Create React App boilerplate).

- [ ] **Step 1:** README (under 40 lines): what the app is and the round flow (Game Master sets the task, members vote, Show All reveals, Reset starts over), roles, how to run client and server, `REACT_APP_SOCKET_URL`, `npm test`.
- [ ] **Step 2: Automated checks.** [server] `npm test` all pass. [client] `npm test -- --watchAll=false` all pass and `CI=true npm run build` succeeds with no warnings. `grep -rn "console.log" src` in the client and `grep -n "console.log" server.js handlers.js rooms.js` in the server find only the server's startup line.
- [ ] **Step 3: Restart scenario.** With a Game Master and a Member in a room, stop and restart the server. Expected: within a few seconds both reappear in the people lists (the client re-joined on reconnect), and a vote from the Member shows on the Game Master's card.
- [ ] **Step 4: Full flow once more at 375px** as each role (join, set task, vote, Show All, Average SP shown, Reset), with the Task 11 stress inputs (15-character name, 300-character task, 12 members) in the room, and repeat the 768px and 1280px overflow checks.
- [ ] **Step 5:** `git status` clean in both repos. Report what remains out of scope: server-owned room state (late joiners miss the task and reveal state), server-enforced Game Master authority, a task list.
- [ ] **Step 6: Commit** `git add README.md && git commit -m "docs: replace boilerplate README"`.
