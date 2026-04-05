import { NextRequest, NextResponse } from "next/server";
import { getGameState, getOrCreateEvent } from "@/lib/game";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  try {
    let id = eventId;
    if (!id) {
      const event = await getOrCreateEvent();
      id = event.id;
    }
    const state = await getGameState(id);
    return NextResponse.json(state);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to get state" }, { status: 500 });
  }
}
