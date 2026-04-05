import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed tech stacks
  const stacks = [
    { frontend: "React", backend: "Node.js", label: "React + Node.js" },
    { frontend: "Angular", backend: "PHP", label: "Angular + PHP" },
    { frontend: "Vue", backend: "Go", label: "Vue + Go" },
    { frontend: "Svelte", backend: "Python", label: "Svelte + Python" },
    { frontend: "Next.js", backend: "Rust", label: "Next.js + Rust" },
    { frontend: "Solid", backend: "Elixir", label: "Solid + Elixir" },
  ];

  for (const stack of stacks) {
    await prisma.techStack.upsert({
      where: { id: stack.label },
      update: {},
      create: { ...stack },
    });
  }
  console.log(`✅ Seeded ${stacks.length} tech stacks`);

  // Seed projects
  const projects = [
    {
      name: "NeuroTask",
      tagline: "Your tasks know you better than you know yourself.",
      spec: "An AI-powered task manager that predicts procrastination patterns and auto-reschedules tasks based on your historical behavior. The app must include a 'shame meter' that publicly displays how many times you've pushed a task back. Bonus: a 'Regret Index' calculated from overdue tasks.",
      difficulty: "medium" as const,
    },
    {
      name: "CryptoKitchen",
      tagline: "Where pull requests meet pulled pork.",
      spec: "A recipe-sharing platform where users can 'fork' recipes with full git-style lineage tracking. Each fork creates a branch, and merge conflicts happen when two chefs modify the same ingredient. An AI food critic rates submissions and dishes out brutally honest reviews.",
      difficulty: "hard" as const,
    },
    {
      name: "MeetingDetox",
      tagline: "Because that meeting could have been an email.",
      spec: "A meeting management tool with real-time sentiment analysis that detects when a meeting becomes unproductive. When the 'Waste Score' exceeds a threshold, the app suggests ending the meeting and drafts the email that should have been sent instead. Must include a 'Calendar Intervention' feature.",
      difficulty: "medium" as const,
    },
    {
      name: "BugBnB",
      tagline: "One dev's bug is another dev's feature.",
      spec: "A marketplace where developers can list and trade bugs with difficulty ratings, reproduction steps, and fix bounties. Features a leaderboard for most creative bugs and a 'Bug of the Week' auction. Users can rate bug quality on creativity, obscurity, and entertainment value.",
      difficulty: "easy" as const,
    },
    {
      name: "RetroType",
      tagline: "Write docs like it's 1999.",
      spec: "A real-time collaborative editor styled like a 90s terminal — complete with typing sounds, cursor trails, and a 'Hacker Mode' that makes all text look like a Matrix stream. Features auto-formatting that breaks modern conventions and a 'BSOD' when too many people edit simultaneously.",
      difficulty: "medium" as const,
    },
    {
      name: "DeployPray",
      tagline: "Deploy with inner peace.",
      spec: "A CI/CD dashboard that requires mandatory mindfulness exercises before each deployment. The pipeline won't start until you complete a 60-second breathing exercise and answer a philosophical question about code quality. Failed deployments trigger a grief cycle UI.",
      difficulty: "easy" as const,
    },
    {
      name: "StackOverfed",
      tagline: "You are what you code.",
      spec: "A developer lunch ordering app that analyzes your tech stack and current project mood to suggest meals. Using React? You get something modular and composable. Debugging prod issues? Comfort food only. Must include a 'Technical Debt Detox' menu section.",
      difficulty: "easy" as const,
    },
    {
      name: "GitFit",
      tagline: "Commit to fitness.",
      spec: "A fitness tracking app synced with GitHub activity. Each commit triggers a workout suggestion proportional to lines changed. Merge conflicts require burpees. A force push means running laps. Features a 'Code Review Stretch' routine and team leaderboards based on commit streaks.",
      difficulty: "hard" as const,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: project.name },
      update: {},
      create: { ...project },
    });
  }
  console.log(`✅ Seeded ${projects.length} projects`);

  // Seed obstacles
  const obstacles = [
    {
      name: "THE PIVOT",
      icon: "🔄",
      description:
        "Your client just changed their mind. The team's core feature must now do the opposite of what was specified. If you were building a task manager that fights procrastination, it must now encourage it. Update your implementation accordingly.",
      severity: "high" as const,
      durationMinutes: 0,
    },
    {
      name: "STACK OVERFLOW",
      icon: "💥",
      description:
        "Tech stack meltdown! Two teams swap their entire tech stacks. The team using React + Node now has Vue + Go and vice versa. Adapt your existing code or start fresh. You have 10 minutes to regroup.",
      severity: "high" as const,
      durationMinutes: 0,
    },
    {
      name: "CLIENT FROM HELL",
      icon: "👹",
      description:
        "New contradictory requirement incoming! Choose your poison: the entire UI must use Comic Sans, every API response must include a random inspirational quote, OR the app must have a loading screen that lasts exactly 7 seconds with an unskippable animation.",
      severity: "medium" as const,
      durationMinutes: 0,
    },
    {
      name: "DEPENDENCY HELL",
      icon: "🕸️",
      description:
        "Mandatory integration! You must integrate one of the following public APIs into your project in a meaningful way: Chuck Norris Jokes API, Cat Facts API, Kanye West Quotes API, Pokemon API, or NASA Picture of the Day. It must be visible in the UI.",
      severity: "low" as const,
      durationMinutes: 0,
    },
    {
      name: "PROJECT SWAP",
      icon: "🔀",
      description:
        "Complete project exchange — the nuclear option. Two teams swap their entire projects. Each team continues building where the other left off. Codebases, specs, everything. Good luck.",
      severity: "critical" as const,
      durationMinutes: 0,
    },
    {
      name: "SPEED ROUND",
      icon: "⚡",
      description:
        "10-minute micro-challenge! All teams pause their main project. A small standalone challenge is announced — build the best 404 page, or create a one-page portfolio using only CSS. Winner selected by audience vote earns immunity from the next obstacle.",
      severity: "medium" as const,
      durationMinutes: 10,
    },
    {
      name: "CODE FREEZE",
      icon: "🧊",
      description:
        "Involuntary promotion! One team member (chosen by admin) becomes Product Manager for 15 minutes. They may not touch code — only write tickets, documentation, and provide verbal direction to their partner.",
      severity: "medium" as const,
      durationMinutes: 15,
    },
    {
      name: "MYSTERY BOX",
      icon: "📦",
      description:
        "Unknown challenge — revealed live! Possible options: your app must include a hidden Easter egg, add a dark/light mode toggle that also changes the app's personality, OR implement an undo feature that shows a dramatic instant replay animation.",
      severity: "low" as const,
      durationMinutes: 0,
    },
    {
      name: "DESIGN DISASTER",
      icon: "🎨",
      description:
        "Monochrome mandate! Your entire color palette must now use only shades of one specific color — chosen by the audience or randomly assigned by the Game Master. Every UI element must follow this constraint.",
      severity: "low" as const,
      durationMinutes: 0,
    },
    {
      name: "AI OVERLORD",
      icon: "🤖",
      description:
        "Haiku commits only! For the next 30 minutes, all git commit messages must be in haiku format (5-7-5 syllable structure). Teams self-enforce on the honor system. Violation is social shame.",
      severity: "low" as const,
      durationMinutes: 30,
    },
    {
      name: "RESPONSIVE PANIC",
      icon: "📱",
      description:
        "Smartwatch viewport! Your app must render and function correctly at 200×200px. The final demo will be shown on a tiny display. Everything must fit, work, and be usable within those constraints.",
      severity: "high" as const,
      durationMinutes: 0,
    },
    {
      name: "SILENT MODE",
      icon: "🔇",
      description:
        "Communication blackout! No verbal communication for 20 minutes. Teams may only communicate through code comments, commit messages, and the in-app chat if available. No whispering either.",
      severity: "medium" as const,
      durationMinutes: 20,
    },
  ];

  for (const obstacle of obstacles) {
    await prisma.obstacle.create({ data: obstacle }).catch(() => {});
  }
  console.log(`✅ Seeded ${obstacles.length} obstacles`);

  // Create a default event if none exists
  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    await prisma.event.create({
      data: {
        phase: "registration",
        timerDurationSeconds: 14400,
      },
    });
    console.log("✅ Created default event in registration phase");
  }

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
