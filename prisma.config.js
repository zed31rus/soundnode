import path from "node:path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: path.join("api", "prisma", "schema.prisma"),
  migrations: { 
    path: path.join("api", "prisma", "migrations"),
  }
});