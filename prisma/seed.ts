import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey',
  'Riley', 'Avery', 'Quinn', 'Peyton', 'Skyler',
  'Dakota', 'Reese', 'Hayden', 'Emerson', 'Finley',
  'Rowan', 'Sage', 'Phoenix', 'River', 'Blake',
  'Charlie', 'Jamie', 'Robin', 'Cameron', 'Drew'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris'
]

const cities = ['Moscow', 'Saint Petersburg', 'Kazan', 'Novosibirsk', 'Yekaterinburg']

const bios = [
  'Love coding and coffee. Looking for a quiet roommate.',
  'Software developer, enjoy gaming and movies.',
  'Student, need a peaceful place to study.',
  'Designer, work from home mostly. Very clean.',
  'Entrepreneur, often travel for work.',
  'Musician, sometimes practice at home.',
  'Writer, need quiet evenings.',
  'Developer, night owl, very respectful.',
  'Artist, creative and tidy.',
  'Engineer, regular schedule, love cooking.',
  'Marketing specialist, social but respectful.',
  'Data scientist, work remotely, quiet person.',
  'Product manager, often have calls from home.',
  'Freelancer, flexible schedule, easy going.',
  'Consultant, travel frequently.',
  'Teacher, early bird, love morning routines.',
  'Researcher, need quiet for deep work.',
  'Architect, creative schedule, very organized.',
  'Photographer, work on projects, often out.',
  'Chef, love cooking experiments.',
  'Fitness trainer, early mornings, healthy lifestyle.',
  'Nurse, shift work, quiet during sleep hours.',
  'Lawyer, work from office mostly, neat.',
  'Accountant, organized and clean.',
  'Developer, startup founder, busy but respectful.'
]

const sleepSchedules = ['EARLY_BIRD', 'NORMAL', 'NIGHT_OWL'] as const
const smokings = ['NEVER', 'OCCASIONALLY', 'REGULARLY'] as const
const alcohols = ['NEVER', 'OCCASIONALLY', 'REGULARLY'] as const
const cleanlinesses = ['VERY_CLEAN', 'CLEAN', 'MESSY', 'VERY_MESSY'] as const
const noiseLevels = ['QUIET', 'MODERATE', 'LOUD'] as const
const guestsOptions = ['RARELY', 'OCCASIONALLY', 'FREQUENTLY'] as const
const partiesOptions = ['NEVER', 'RARELY', 'OCCASIONALLY', 'FREQUENTLY'] as const
const petsOptions = ['NONE', 'HAVE_CAT', 'HAVE_DOG', 'HAVE_OTHER', 'ALLERGIC'] as const
const workFromHomeOptions = ['NEVER', 'OCCASIONALLY', 'FREQUENTLY', 'ALWAYS'] as const
const cookingOptions = ['NEVER', 'OCCASIONALLY', 'FREQUENTLY', 'ALWAYS'] as const
const sharedSpacesOptions = ['PRIVATE', 'BALANCED', 'SHARED'] as const
const wakeTimes = ['VERY_EARLY', 'EARLY', 'NORMAL', 'LATE'] as const

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.message.deleteMany()
  await prisma.chat.deleteMany()
  await prisma.match.deleteMany()
  await prisma.survey.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  const users = []

  for (let i = 0; i < 25; i++) {
    const firstName = firstNames[i]
    const lastName = lastNames[i]
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
    const password = await bcrypt.hash('password123', 10)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: password,
        name: `${firstName} ${lastName}`,
        avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
        profile: {
          create: {
            city: pickRandom(cities),
            budgetMin: 20000 + Math.floor(Math.random() * 30000),
            budgetMax: 50000 + Math.floor(Math.random() * 50000),
            moveInDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
            bio: bios[i],
            gender: pickRandom(['Male', 'Female', 'Non-binary']),
            age: 20 + Math.floor(Math.random() * 20),
          },
        },
        survey: {
          create: {
            sleepSchedule: pickRandom(sleepSchedules),
            smoking: pickRandom(smokings),
            alcohol: pickRandom(alcohols),
            cleanliness: pickRandom(cleanlinesses),
            noiseLevel: pickRandom(noiseLevels),
            guests: pickRandom(guestsOptions),
            parties: pickRandom(partiesOptions),
            pets: pickRandom(petsOptions),
            workFromHome: pickRandom(workFromHomeOptions),
            cooking: pickRandom(cookingOptions),
            sharedSpaces: pickRandom(sharedSpacesOptions),
            wakeTime: pickRandom(wakeTimes),
          },
        },
      },
      include: {
        profile: true,
        survey: true,
      },
    })

    users.push(user)
    console.log(`Created user: ${user.name}`)
  }

  console.log(`\nSeeded ${users.length} users successfully!`)
  console.log('\nAll users have password: password123')
}

main()
  .catch((e) => {
    console.error('Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
