import { useEffect, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type BoardSocketHandler = (message: IMessage) => void;

export function useBoardSocket(boardId: number | undefined, onMessage: BoardSocketHandler) {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!boardId) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000
    });

    client.onConnect = () => {
      client.subscribe(`/topic/board/${boardId}`, onMessage);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
      }
    };
  }, [boardId, onMessage]);
}

