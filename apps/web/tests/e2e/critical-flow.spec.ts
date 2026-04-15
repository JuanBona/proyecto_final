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
  await prisma.user.upsert({
    where: { email: "approver@test.com" },
    update: {},
    create: { email: "approver@test.com", passwordHash, role: "approver" },
  });
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("redirects /trips/new to /login when no session", async ({ page }) => {
  await page.goto("/trips/new");
  await expect(page).toHaveURL(/\/login/);
});

test("traveler requests trip and approver sees pending approval", async ({ page }) => {
  const uniqueDestination = `Madrid-${Date.now()}`;

  await page.goto("/login");
  await page.getByLabel("Email").fill("traveler@test.com");
  await page.getByLabel("Contraseña").fill("password123");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page).toHaveURL(/\/trips\/new/);
  await page.getByLabel("Destino").fill(uniqueDestination);
  await page.getByLabel("Fecha de inicio").fill("2026-05-10");
  await page.getByLabel("Fecha de fin").fill("2026-05-15");
  await page.getByLabel("Motivo").fill("Reunión con cliente");
  await page.getByLabel("Presupuesto").fill("1300");
  await page.getByLabel("Centro de costo").fill("CC-777");
  await page.getByRole("button", { name: "Enviar solicitud" }).click();

  await expect(page).toHaveURL(/status=success/, { timeout: 15000 });
  await expect(page.getByText("Solicitud enviada para aprobación")).toBeVisible({ timeout: 15000 });

  await page.request.post("/api/auth/logout");

  await page.goto("/login");
  await page.getByLabel("Email").fill("approver@test.com");
  await page.getByLabel("Contraseña").fill("password123");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page).toHaveURL(/\/approvals/);
  await expect(page.getByRole("heading", { name: "Pendientes de aprobación" })).toBeVisible();
  await expect(page.getByRole("heading", { name: uniqueDestination })).toBeVisible();
});
