import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const dbPathCandidates = [
  path.resolve(process.cwd(), "apps/api/prisma/dev.db"),
  path.resolve(process.cwd(), "../api/prisma/dev.db"),
];
const dbPath = dbPathCandidates.find((candidate) => fs.existsSync(candidate));
const prisma = new PrismaClient({
  datasources: {
    db: { url: `file:${dbPath ?? dbPathCandidates[0]}` },
  },
});

test.beforeAll(async () => {
  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "traveler@test.com" },
    update: {},
    create: { email: "traveler@test.com", passwordHash, role: "traveler" },
  });
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("landing exposes editorial personality markers", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("[data-ui='hero-accent']")).toBeVisible();
  await expect(page.locator("[data-ui='feature-surface']")).toHaveCount(3);
  await expect(page.locator("[data-ui='cta-depth-layer']")).toBeVisible();
});

test("internal screens use polished app shell surfaces", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("[data-ui='auth-shell']")).toBeVisible();

  await page.getByLabel("Email").fill("traveler@test.com");
  await page.getByLabel("Contraseña").fill("password123");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page).toHaveURL(/\/trips\/new/);
  await expect(page.locator("[data-ui='app-shell-header']")).toBeVisible();
  await expect(page.locator("[data-ui='app-shell-header']")).toHaveClass(/backdrop-blur/);
});
