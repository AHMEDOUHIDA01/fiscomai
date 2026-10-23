import { expect, test, type Page } from "@playwright/test";

async function onboard(page: Page, langLabel: string, profileLabel: RegExp) {
  await page.goto("/");
  await page.getByRole("button", { name: langLabel }).click();
  await page.locator(".onboarding .btn").last().click();
  await page.getByRole("button", { name: profileLabel }).click();
  await page.locator(".onboarding .btn").last().click();
  await page.locator(".onboarding .btn").last().click();
  await expect(page.locator(".topbar")).toBeVisible();
}

/** Termine la leçon en passant chaque exercice (profil enfant : pas de cœurs). */
async function finishLessonBySkipping(page: Page) {
  for (let i = 0; i < 40; i++) {
    if (await page.locator(".lesson-end").isVisible()) return;
    const pairs = page.locator(".pairs");
    if (await pairs.isVisible()) {
      // Paires : on essaie chaque mot de droite pour le premier mot de gauche.
      const left = pairs.locator(".pairs__col").first().locator("button:not([disabled])");
      const right = pairs.locator(".pairs__col").last().locator("button:not([disabled])");
      while ((await left.count()) > 0) {
        const before = await left.count();
        for (let j = 0; j < (await right.count()); j++) {
          await left.first().click();
          await right.nth(j).click();
          await page.waitForTimeout(550);
          if ((await left.count()) < before) break;
        }
      }
      await expect(page.locator(".feedback")).toBeVisible();
    } else {
      await page.locator(".lesson__footer .btn--ghost").click();
    }
    await page.locator(".feedback .btn").click();
  }
  throw new Error("La leçon ne s'est pas terminée");
}

test("parcours complet en français : inscription, leçon, XP et série", async ({ page }) => {
  await onboard(page, "Français", /Enfant/);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByText("Salam !")).toBeVisible();
  await page.screenshot({ path: "test-results/home-fr.png", fullPage: false });

  await page.locator(".node__btn.is-current").click();
  await page.getByRole("button", { name: /Commencer/ }).last().click();
  await expect(page.locator(".lesson__instruction")).toBeVisible();
  await page.screenshot({ path: "test-results/lesson-fr.png" });
  await finishLessonBySkipping(page);

  await expect(page.locator(".lesson-end h1")).toBeVisible();
  await page.screenshot({ path: "test-results/end-fr.png" });
  await page.locator(".lesson-end .btn").click();
  await expect(page.locator(".stat--fire")).toContainText("1");
  await expect(page.locator(".goal-card__value")).toContainText("10");

  // La progression survit au rechargement (IndexedDB).
  await page.waitForTimeout(400);
  await page.reload();
  await expect(page.locator(".stat--fire")).toContainText("1");
});

test("interface en arabe de droite à gauche, écrans annexes et perte de cœur", async ({ page }) => {
  await onboard(page, "العربية", /بالغ/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.screenshot({ path: "test-results/home-ar.png" });

  for (const name of ["league", "quests", "shop", "profile", "settings"]) {
    await page.goto(`/#/${name}`);
    await expect(page.locator(".page__main")).toBeVisible();
    await page.screenshot({ path: `test-results/${name}-ar.png` });
  }

  // Passer un exercice dans une leçon coûte un cœur au profil adulte.
  await page.goto("/#/");
  await page.locator(".node__btn.is-current").click();
  await page.locator(".node__pop .btn").click();
  await expect(page.locator(".lesson__top .stat--hearts")).toContainText("5");
  await page.locator(".lesson__footer .btn--ghost").click();
  await expect(page.locator(".lesson__footer.is-wrong")).toBeVisible();
  await expect(page.locator(".lesson__top .stat--hearts")).toContainText("4");
  await page.screenshot({ path: "test-results/wrong-ar.png" });
});

test("rappels : autorisation des notifications et réglage de l'heure", async ({ page, context }) => {
  await context.grantPermissions(["notifications"]);
  await onboard(page, "Français", /Adulte/);
  await page.goto("/#/settings");
  // L'activation attend l'autorisation et le service worker : on clique puis on attend la confirmation.
  await page.locator("label.toggle", { hasText: "Activer les rappels" }).click();
  await expect(page.getByText("Rappels activés ✔")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("switch", { name: "Activer les rappels" })).toBeChecked();
  await expect(page.locator("select.select")).toHaveValue("19");
  await page.locator("select.select").selectOption("8");
  await expect(page.locator("select.select")).toHaveValue("8");
  await page.screenshot({ path: "test-results/settings-reminders.png" });
});
