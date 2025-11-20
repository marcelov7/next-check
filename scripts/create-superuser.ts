import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

dotenv.config();

async function main() {
  const email = process.env.SUPERADMIN_EMAIL ?? "admin@checklist.local";
  const username = process.env.SUPERADMIN_USERNAME ?? "admin";
  const password = process.env.SUPERADMIN_PASSWORD ?? "password";
  const name = process.env.SUPERADMIN_NAME ?? "Administrador";

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      username,
      password: hashed,
      role: "superadmin",
    },
    create: {
      name,
      email,
      username,
      password: hashed,
      role: "superadmin",
    },
  });

  console.log(`Superadmin ensured: ${user.email} (username: ${user.username})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
