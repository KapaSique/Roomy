import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const firstNames = [
  'Александр', 'Михаил', 'Дмитрий', 'Алексей', 'Иван',
  'Андрей', 'Сергей', 'Артем', 'Павел', 'Максим',
  'Елена', 'Ольга', 'Наталья', 'Анна', 'Мария',
  'Татьяна', 'Светлана', 'Ирина', 'Екатерина', 'Юлия',
  'Анастасия', 'Виктория', 'Дарья', 'Полина', 'Ксения'
]

const lastNames = [
  'Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев',
  'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Фёдоров',
  'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семёнов',
  'Егоров', 'Павлов', 'Козлов', 'Степанов', 'Николаев',
  'Орлов', 'Андреев', 'Макаров', 'Никитин', 'Захаров'
]

const cities = ['Москва', 'Санкт-Петербург', 'Якутск', 'Казань', 'Новосибирск']

const bios = [
  'Люблю код и кофе. Ищу спокойного соседа.',
  'Разработчик, увлекаюсь играми и фильмами.',
  'Студент, нужно спокойное место для учёбы.',
  'Дизайнер, работаю из дома. Очень чистоплотный.',
  'Предприниматель, часто в командировках.',
  'Музыкант, иногда репетирую дома.',
  'Писатель, нужны тихие вечера.',
  'Разработчик, сова, очень уважительный.',
  'Художник, творческий и аккуратный.',
  'Инженер, регулярный график, люблю готовить.',
  'Маркетолог, общительный, но уважительный.',
  'Дата-сайентист, работаю удалённо, тихий.',
  'Продакт-менеджер, часто созвоны из дома.',
  'Фрилансер, гибкий график, лёгкий в общении.',
  'Консультант, часто в разъездах.',
  'Учитель, жаворонок, люблю утренние ритуалы.',
  'Исследователь, нужна тишина для работы.',
  'Архитектор, творческий график, очень организованный.',
  'Фотограф, работаю над проектами, часто отсутствую.',
  'Шеф-повар, люблю кулинарные эксперименты.',
  'Фитнес-тренер, ранние подъёмы, здоровый образ жизни.',
  'Медбрат/медсестра, сменная работа, тишина во время сна.',
  'Юрист, работаю в офисе, аккуратный.',
  'Бухгалтер, организованный и чистоплотный.',
  'Разработчик, основатель стартапа, занят, но уважителен.'
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
            gender: pickRandom(['Male', 'Female']),
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
