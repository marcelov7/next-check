import { PrismaClient } from "@prisma/client";
let prismaInstance: PrismaClient;

if (process.env.DATABASE_URL?.startsWith('file:')) {
  // Attempt to use sqlite client if generated in ./prisma/node_modules
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient: SqliteClient } = require('../prisma/node_modules/@prisma/client-sqlite');
    prismaInstance = new SqliteClient({ log: ["query", "info", "warn", "error"] });
  } catch (e) {
    prismaInstance = new PrismaClient({ log: ["query", "info", "warn", "error"] });
  }
} else {
  prismaInstance = new PrismaClient({ log: ["query", "info", "warn", "error"] });
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? prismaInstance;
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
