import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Set DATABASE_URL directly
process.env.DATABASE_URL = 'postgresql://thorium@localhost:5432/ucustazminat?schema=public'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@ucustazminat.com'
  const password = 'admin123' // Change this in production!

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)

  // Check if admin exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    // Update to admin role
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    console.log('User updated to ADMIN:', updated.email)
  } else {
    // Create new admin user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Admin',
        role: 'ADMIN',
        emailVerified: new Date(),
      }
    })
    console.log('Admin user created:', user.email)
  }

  console.log('\n=================================')
  console.log('Admin Login Credentials:')
  console.log('Email:', email)
  console.log('Password:', password)
  console.log('=================================\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
