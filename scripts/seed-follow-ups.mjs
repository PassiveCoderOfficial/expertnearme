// Seeds the built-in follow-up sequence templates. Idempotent.
// Run: node scripts/seed-follow-ups.mjs
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const envFile = readFileSync(new URL('../.env', import.meta.url), 'utf8');
for (const line of envFile.split('\n')) {
  const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const prisma = new PrismaClient();

const SEQUENCES = [
  {
    name: 'New enquiry follow-up',
    description:
      'Four polite nudges over three weeks for enquiries that never got a reply. Stops the moment they respond.',
    trigger: 'NEW_LEAD',
    dormantAfterDays: null,
    steps: [
      {
        stepOrder: 0,
        delayHours: 24,
        subject: 'Following up on your enquiry',
        body: `Hi {{name}},\n\nI wanted to make sure you saw my earlier reply about your enquiry.\n\nAre you still looking to get this sorted? Happy to answer any questions or give you a rough price.\n\nJust reply to this message and I'll get back to you.`,
      },
      {
        stepOrder: 1,
        delayHours: 72,
        subject: 'Still need a hand?',
        body: `Hi {{name}},\n\nChecking in once more — are you still looking for help with this?\n\nIf the timing isn't right, no problem at all. Just let me know and I'll leave you to it.`,
      },
      {
        stepOrder: 2,
        delayHours: 168,
        subject: 'Anything I can help with?',
        body: `Hi {{name}},\n\nI haven't heard back, so I'll assume you're sorted for now.\n\nIf anything changes, or you'd like a quote later on, just reply here. I'll keep your details on file.`,
      },
      {
        stepOrder: 3,
        delayHours: 504,
        subject: 'Closing this off',
        body: `Hi {{name}},\n\nLast message from me on this one — I'll close the enquiry off.\n\nIf you need anything in future, you know where to find me.\n\nAll the best.`,
      },
    ],
  },
  {
    name: 'Past customer reactivation',
    description:
      'Reaches customers who have not been in touch for six months. The cheapest revenue available — people who already know and trust the business.',
    trigger: 'REACTIVATION',
    dormantAfterDays: 180,
    steps: [
      {
        stepOrder: 0,
        delayHours: 0,
        subject: "It's been a while",
        body: `Hi {{name}},\n\nIt's been a while since we worked together — I hope everything's still holding up well.\n\nIf anything needs looking at, or you've got something new coming up, just reply here. Happy to sort it for you.`,
      },
      {
        stepOrder: 1,
        delayHours: 336,
        subject: 'Still here if you need me',
        body: `Hi {{name}},\n\nJust a quick note to say I'm still around if you need anything.\n\nReply any time — no obligation.`,
      },
    ],
  },
  {
    name: 'Review request',
    description:
      'Asks for a review right after a completed job, while the customer is still pleased. Reviews drive local ranking, which drives more enquiries.',
    trigger: 'POST_BOOKING',
    dormantAfterDays: null,
    steps: [
      {
        stepOrder: 0,
        delayHours: 48,
        subject: 'How did we do?',
        body: `Hi {{name}},\n\nThanks again for your business — it was good working with you.\n\nIf you've got a spare minute, a short review would genuinely help. It's the main way people find me.\n\nAnd if anything wasn't right, reply here first and I'll put it straight.`,
      },
      {
        stepOrder: 1,
        delayHours: 168,
        subject: 'A quick favour',
        body: `Hi {{name}},\n\nNo worries if you've been busy — just a gentle reminder about leaving a review if you were happy with the work.\n\nThanks either way.`,
      },
    ],
  },
];

let created = 0;
let existing = 0;

for (const seq of SEQUENCES) {
  const found = await prisma.followUpSequence.findFirst({
    where: { expertId: null, isSystem: true, name: seq.name },
  });
  if (found) {
    existing++;
    console.log(`exists: ${seq.name}`);
    continue;
  }
  await prisma.followUpSequence.create({
    data: {
      expertId: null,
      name: seq.name,
      description: seq.description,
      trigger: seq.trigger,
      isSystem: true,
      active: true,
      dormantAfterDays: seq.dormantAfterDays,
      steps: {
        create: seq.steps.map((s) => ({
          stepOrder: s.stepOrder,
          delayHours: s.delayHours,
          channel: 'AUTO',
          subject: s.subject,
          body: s.body,
          active: true,
        })),
      },
    },
  });
  created++;
  console.log(`created: ${seq.name}`);
}

console.log(`\ndone — ${created} created, ${existing} already present`);
await prisma.$disconnect();
