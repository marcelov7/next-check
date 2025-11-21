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

  // Try to find existing user by email or username to avoid unique constraint errors
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });

  let user;
  if (existing) {
    user = await prisma.user.update({
      where: { id: existing.id },
      data: { name, username, password: hashed, role: "superadmin" },
    });
    console.log(`Superadmin updated: ${user.email} (username: ${user.username})`);
  } else {
    user = await prisma.user.create({
      data: { name, email, username, password: hashed, role: "superadmin" },
    });
    console.log(`Superadmin created: ${user.email} (username: ${user.username})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
