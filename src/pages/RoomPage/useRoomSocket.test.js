import { renderHook, act } from '@testing-library/react';
import { useRoomSocket } from './useRoomSocket';
import { EVENTS, ROLES } from '../../constants';

class FakeSocket {
  constructor(id = 's1') {
    this.id = id;
    this.listeners = {};
    this.emitted = [];
    this.closed = false;
  }
  on(event, listener) {
    (this.listeners[event] = this.listeners[event] || []).push(listener);
  }
  off(event, listener) {
    this.listeners[event] = (this.listeners[event] || []).filter((l) => l !== listener);
  }
  emit(event, payload) {
    this.emitted.push([event, payload]);
  }
  close() {
    this.closed = true;
  }
  trigger(event, payload) {
    (this.listeners[event] || []).forEach((listener) => listener(payload));
  }
  listenerCount() {
    return Object.values(this.listeners).reduce((total, list) => total + list.length, 0);
  }
}

const member = (id, name, vote = null, role = ROLES.MEMBER) => ({ id, name, role, vote });

function setup({ id = 's1', role = ROLES.MEMBER } = {}) {
  const socket = new FakeSocket(id);
  const createSocket = () => socket;
  const hook = renderHook(() => useRoomSocket({ room: 'r1', name: 'Alice#1', role }, createSocket));
  return { socket, ...hook };
}

const emittedNamed = (socket, event) => socket.emitted.filter(([name]) => name === event);

test('joins the room on every connect, including reconnects', () => {
  const { socket } = setup();
  act(() => socket.trigger('connect'));
  act(() => socket.trigger('connect'));
  expect(emittedNamed(socket, EVENTS.JOIN_ROOM)).toEqual([
    [EVENTS.JOIN_ROOM, { room: 'r1', name: 'Alice#1', role: 'member' }],
    [EVENTS.JOIN_ROOM, { room: 'r1', name: 'Alice#1', role: 'member' }],
  ]);
});

test('connected follows connect and disconnect', () => {
  const { socket, result } = setup();
  expect(result.current.connected).toBe(false);
  act(() => socket.trigger('connect'));
  expect(result.current.connected).toBe(true);
  act(() => socket.trigger('disconnect'));
  expect(result.current.connected).toBe(false);
});

test('stores participants and finds me by socket id', () => {
  const { socket, result } = setup({ id: 's1' });
  act(() => socket.trigger('connect'));
  act(() => socket.trigger(EVENTS.PARTICIPANTS, [member('s1', 'Alice#1'), member('s2', 'Bob#2')]));
  expect(result.current.participants).toHaveLength(2);
  expect(result.current.me.name).toBe('Alice#1');
});

test('two people with the same display name: me is the one with the socket id', () => {
  const { socket, result } = setup({ id: 's2' });
  act(() => socket.trigger('connect'));
  act(() => socket.trigger(EVENTS.PARTICIPANTS, [member('s1', 'Alice#1'), member('s2', 'Alice#2')]));
  expect(result.current.me.id).toBe('s2');
});

test('vote emits vote with the room and the numeric value', () => {
  const { socket, result } = setup();
  act(() => result.current.vote(5));
  expect(emittedNamed(socket, EVENTS.VOTE)).toEqual([[EVENTS.VOTE, { room: 'r1', value: 5 }]]);
});

test('reveal emits reveal, then result with the average and the published task', () => {
  const { socket, result } = setup({ role: ROLES.MASTER });
  act(() => socket.trigger('connect'));
  act(() =>
    socket.trigger(EVENTS.PARTICIPANTS, [
      member('s1', 'Gm#1', null, ROLES.MASTER),
      member('s2', 'Bob#2', 3),
      member('s3', 'Cat#3', 5),
    ]),
  );
  act(() => result.current.publishDescription('PTP-1'));
  act(() => result.current.reveal());
  expect(socket.emitted.slice(-2)).toEqual([
    [EVENTS.REVEAL, { room: 'r1' }],
    [EVENTS.RESULT, { room: 'r1', average: 4, task: 'PTP-1' }],
  ]);
});

test('a reveal event sets revealed; a reset event clears it and the result', () => {
  const { socket, result } = setup();
  act(() => socket.trigger(EVENTS.REVEAL));
  act(() => socket.trigger(EVENTS.RESULT, { average: 4, task: 'PTP-1' }));
  expect(result.current.revealed).toBe(true);
  expect(result.current.result).toEqual({ average: 4, task: 'PTP-1' });
  act(() => socket.trigger(EVENTS.RESET));
  expect(result.current.revealed).toBe(false);
  expect(result.current.result).toBeNull();
});

test('a result event stores average and task', () => {
  const { socket, result } = setup();
  act(() => socket.trigger(EVENTS.RESULT, { average: null, task: 'PTP-2' }));
  expect(result.current.result).toEqual({ average: null, task: 'PTP-2' });
});

test('a description event updates description; publishDescription emits it and updates locally', () => {
  const { socket, result } = setup({ role: ROLES.MASTER });
  act(() => socket.trigger(EVENTS.DESCRIPTION, { value: 'from someone else' }));
  expect(result.current.description).toBe('from someone else');
  act(() => result.current.publishDescription('PTP-3'));
  expect(result.current.description).toBe('PTP-3');
  expect(emittedNamed(socket, EVENTS.DESCRIPTION)).toEqual([[EVENTS.DESCRIPTION, { room: 'r1', value: 'PTP-3' }]]);
});

test('unmount closes the socket and removes every listener', () => {
  const { socket, unmount } = setup();
  expect(socket.listenerCount()).toBeGreaterThan(0);
  unmount();
  expect(socket.closed).toBe(true);
  expect(socket.listenerCount()).toBe(0);
});
