/**
 * Server-side socket emitter.
 * The actual io instance lives in server.ts and is attached to global.
 */
import type { Server as IOServer } from "socket.io";

declare global {
  var _io: IOServer | undefined;
}

export function getIO(): IOServer | null {
  return global._io ?? null;
}

export function emitToEvent(eventId: string, type: string, payload: unknown) {
  const io = getIO();
  if (!io) return;
  io.to(`event:${eventId}`).emit("event", { type, payload });
  // Also emit to projector room
  io.to(`projector:${eventId}`).emit("event", { type, payload });
}

export function emitToAll(type: string, payload: unknown) {
  const io = getIO();
  if (!io) return;
  io.emit("event", { type, payload });
}
