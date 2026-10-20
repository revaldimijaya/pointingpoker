import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../config';
import { EVENTS } from '../../constants';
import { averageVote } from '../../lib/estimate';

const defaultCreateSocket = () => io(SOCKET_URL);

// Owns the socket for one room: joins on every (re)connect, keeps the room state
// in sync with the server's events, and exposes the actions a participant can take.
export function useRoomSocket({ room, name, role }, createSocket = defaultCreateSocket) {
  const socketRef = useRef(null);
  const [socketId, setSocketId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [description, setDescription] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    const handlers = {
      connect: () => {
        setSocketId(socket.id);
        setConnected(true);
        socket.emit(EVENTS.JOIN_ROOM, { room, name, role });
      },
      disconnect: () => setConnected(false),
      [EVENTS.PARTICIPANTS]: setParticipants,
      [EVENTS.REVEAL]: () => setRevealed(true),
      [EVENTS.RESET]: () => {
        setRevealed(false);
        setResult(null);
      },
      [EVENTS.DESCRIPTION]: ({ value }) => setDescription(value),
      [EVENTS.RESULT]: ({ average, task }) => setResult({ average, task }),
    };
    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
      socket.close();
      socketRef.current = null;
    };
  }, [room, name, role, createSocket]);

  const me = participants.find((participant) => participant.id === socketId);

  const vote = (value) => {
    socketRef.current.emit(EVENTS.VOTE, { room, value });
  };

  // The Game Master's client computes the average and shares it with the room.
  const reveal = () => {
    socketRef.current.emit(EVENTS.REVEAL, { room });
    socketRef.current.emit(EVENTS.RESULT, { room, average: averageVote(participants), task: description });
  };

  const reset = () => {
    socketRef.current.emit(EVENTS.RESET, { room });
  };

  const publishDescription = (text) => {
    setDescription(text);
    socketRef.current.emit(EVENTS.DESCRIPTION, { room, value: text });
  };

  return { me, connected, participants, description, revealed, result, vote, reveal, reset, publishDescription };
}
