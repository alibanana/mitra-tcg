import "dotenv/config"
import { PrismaClient, Role } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"
import { createInterface } from "readline"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve))
}

async function main() {
  console.log("Create Admin User\n")

  const email = await question("Email: ")
  const name = await question("Name: ")
  const password = await question("Password: ")

  if (!email || !name || !password) {
    console.error("All fields are required")
    process.exit(1)
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters")
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role: Role.ADMIN,
    },
    create: {
      email,
      name,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  })

  console.log(`\nAdmin user created: ${user.email}`)
  rl.close()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
