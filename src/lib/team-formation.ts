export interface Participant {
  id: string;
  vibeLevel: number;
}

export interface FoldPairResult {
  pairs: [Participant, Participant][];
  solo: Participant | null;
}

/**
 * Fold-pairing algorithm: sorts participants by vibeLevel descending,
 * then pairs highest with lowest, second-highest with second-lowest, etc.
 * If odd count, the middle participant becomes a solo.
 */
export function foldPair(participants: Participant[]): FoldPairResult {
  if (participants.length === 0) return { pairs: [], solo: null };

  const sorted = [...participants].sort((a, b) => b.vibeLevel - a.vibeLevel);
  const pairs: [Participant, Participant][] = [];
  let lo = 0;
  let hi = sorted.length - 1;

  while (lo < hi) {
    pairs.push([sorted[lo], sorted[hi]]);
    lo++;
    hi--;
  }

  return { pairs, solo: lo === hi ? sorted[lo] : null };
}


import { prisma } from "./prisma";

const GREEK_LETTERS = [
  "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta",
  "Eta", "Theta", "Iota", "Kappa", "Lambda", "Mu",
  "Nu", "Xi", "Omicron", "Pi", "Rho", "Sigma",
  "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function formTeams(eventId: string): Promise<void> {
  // 1. Get eligible participants: not opted out admins, has registered
  const participants = await prisma.user.findMany({
    where: {
      OR: [
        { isAdmin: false },
        { isAdmin: true, isOptedOut: false },
      ],
      isOptedOut: false,
    },
    orderBy: { vibeLevel: "desc" },
  });

  if (participants.length < 2) {
    throw new Error("Not enough participants to form teams (need at least 2)");
  }

  // 2. Fold pairing: highest with lowest
  const { pairs: rawPairs, solo: soloPlayer } = foldPair(participants);
  const pairs = rawPairs as User[][];

  // 3. Get available projects and stacks
  const projects = await prisma.project.findMany();
  const stacks = await prisma.techStack.findMany();

  if (projects.length === 0) throw new Error("No projects available");
  if (stacks.length === 0) throw new Error("No tech stacks available");

  const shuffledProjects = shuffle(projects);
  const shuffledStacks = shuffle(stacks);

  // 4. Create teams, members, and assignments
  let teamIndex = 0;

  for (const pair of pairs) {
    const teamName = `Team ${GREEK_LETTERS[teamIndex % GREEK_LETTERS.length]}`;
    const totalVibeLevel = pair.reduce((sum, u) => sum + u.vibeLevel, 0);
    const project = shuffledProjects[teamIndex % shuffledProjects.length];
    const stack = shuffledStacks[teamIndex % shuffledStacks.length];

    const team = await prisma.team.create({
      data: {
        eventId,
        name: teamName,
        totalVibeLevel,
        isSolo: false,
        members: {
          create: pair.map((u) => ({ userId: u.id })),
        },
      },
    });

    await prisma.teamAssignment.create({
      data: {
        teamId: team.id,
        projectId: project.id,
        techStackId: stack.id,
      },
    });

    teamIndex++;
  }

  // 5. Handle solo player
  if (soloPlayer) {
    const teamName = `Team ${GREEK_LETTERS[teamIndex % GREEK_LETTERS.length]} (Solo ⚠️)`;
    const project = shuffledProjects[teamIndex % shuffledProjects.length];
    const stack = shuffledStacks[teamIndex % shuffledStacks.length];

    const soloTeam = await prisma.team.create({
      data: {
        eventId,
        name: teamName,
        totalVibeLevel: soloPlayer.vibeLevel,
        isSolo: true,
        members: {
          create: [{ userId: soloPlayer.id }],
        },
      },
    });

    await prisma.teamAssignment.create({
      data: {
        teamId: soloTeam.id,
        projectId: project.id,
        techStackId: stack.id,
      },
    });
  }

  // 6. Log the event
  await prisma.eventLog.create({
    data: {
      eventId,
      message: `Teams formed: ${pairs.length} pairs${soloPlayer ? " + 1 solo" : ""}`,
      type: "system",
      metadata: { teamCount: pairs.length + (soloPlayer ? 1 : 0) },
    },
  });
}
