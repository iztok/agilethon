"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { SocketEventType } from "@/types";

interface SocketEvent {
  type: SocketEventType;
  payload: unknown;
}

type EventHandler = (payload: unknown) => void;

export function useSocket(
  eventId: string | null,
  isProjector = false,
  handlers: Partial<Record<SocketEventType, EventHandler>> = {}
) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!eventId) return;

    const socket = io({ path: "/api/socketio", transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (isProjector) {
        socket.emit("join:projector", eventId);
      } else {
        socket.emit("join:event", eventId);
      }
    });

    socket.on("event", ({ type, payload }: SocketEvent) => {
      const handler = handlersRef.current[type];
      if (handler) handler(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [eventId, isProjector]);

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { emit };
}
