import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as IOServer } from "socket.io";
import { prisma } from "./src/lib/prisma";
import { calculateRemainingSeconds } from "./src/lib/game";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new IOServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    path: "/api/socketio",
  });

  // Make io globally accessible for API routes
  (global as any)._io = io;

  io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    socket.on("join:event", (eventId: string) => {
      socket.join(`event:${eventId}`);
      console.log(`[socket] ${socket.id} joined event:${eventId}`);
    });

    socket.on("join:projector", (eventId: string) => {
      socket.join(`projector:${eventId}`);
      console.log(`[socket] ${socket.id} joined projector:${eventId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });

  // Timer sync every 30 seconds
  setInterval(async () => {
    try {
      const activeEvents = await prisma.event.findMany({
        where: { phase: { in: ["active", "paused"] } },
      });

      for (const event of activeEvents) {
        const remaining = calculateRemainingSeconds(event);
        io.to(`event:${event.id}`).emit("event", {
          type: "timer:sync",
          payload: { remainingSeconds: remaining },
        });
        io.to(`projector:${event.id}`).emit("event", {
          type: "timer:sync",
          payload: { remainingSeconds: remaining },
        });

        // Auto-finish if timer expires
        if (event.phase === "active" && remaining <= 0) {
          await prisma.event.update({
            where: { id: event.id },
            data: { phase: "finished", finishedAt: new Date() },
          });
          await prisma.eventLog.create({
            data: {
              eventId: event.id,
              message: "Time's up! Event finished.",
              type: "system",
            },
          });
          io.to(`event:${event.id}`).emit("event", { type: "game:finished", payload: {} });
          io.to(`projector:${event.id}`).emit("event", { type: "game:finished", payload: {} });
        }
      }
    } catch (e) {
      console.error("[timer-sync] error:", e);
    }
  }, 30000);

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
