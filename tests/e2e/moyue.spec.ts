// Pruebas end-to-end (Playwright) — 12 escenarios
// Ejecutar: npx playwright test
import { expect, test } from "@playwright/test";

test.describe("墨玥 MoYue", () => {
  test("1. la portada muestra el título y el CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("MoYue");
    await expect(page.getByRole("button", { name: /Entrar al pergamino/ })).toBeVisible();
  });

  test("2. el título del documento es correcto", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/墨玥 · MoYue/);
  });

  test("3. se listan los pergaminos recientes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Publicaciones recientes" })).toBeVisible();
    await expect(page.locator('a[href^="#/blog/"]').first()).toBeVisible();
  });

  test("4. navegación al pergamino de los Cuatro Inventos", async ({ page }) => {
    await page.goto("/#/blog/cuatro-inventos");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Cuatro Grandes Inventos");
    await expect(page.getByText("Cai Lun").first()).toBeVisible();
  });

  test("5. cada artículo termina con el sello 林玥", async ({ page }) => {
    await page.goto("/#/blog/personajes");
    await expect(page.getByRole("img", { name: /Sello rojo: 林玥/ }).last()).toBeVisible();
  });

  test("6. la tabla comparativa tiene caption accesible", async ({ page }) => {
    await page.goto("/#/blog/china-moderna");
    await expect(page.getByRole("table").first()).toBeVisible();
  });

  test("7. el globo de la Ruta de la Seda permite filtrar", async ({ page }) => {
    await page.goto("/#/blog/ruta-seda-digital");
    await page.getByRole("button", { name: "Digital", exact: true }).click();
    await expect(page.getByRole("button", { name: /Shenzhen/ })).toBeVisible();
  });

  test("8. cambio de tema oscuro ↔ pergamino", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /modo pergamino/ }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("9. triple-click en el logo estampa el sello gigante", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /墨玥 MoYue — inicio/ }).click({ clickCount: 3 });
    await expect(page.getByRole("dialog", { name: /Sello de Lin Yue/ })).toBeVisible();
  });

  test("10. el formulario de contacto valida con Zod", async ({ page }) => {
    await page.goto("/#/contact");
    await page.getByRole("button", { name: /Sellar y enviar/ }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
  });

  test("11. envío correcto de una carta", async ({ page }) => {
    await page.goto("/#/contact");
    await page.getByLabel(/Remitente/).fill("Mei Hua");
    await page.getByLabel(/Dirección/).fill("mei@luna.cn");
    await page.getByText("Personajes clave · 人物").click();
    await page.getByLabel(/Carta/).fill("Querida Lin Yue, gracias por el pergamino sobre Shen Kuo.");
    await page.getByRole("button", { name: /Sellar y enviar/ }).click();
    await expect(page.getByText("Tu carta ha sido sellada")).toBeVisible();
  });

  test("12. la página About muestra el jardín de contribuciones", async ({ page }) => {
    await page.goto("/#/about");
    await expect(page.getByRole("heading", { name: "Jardín de contribuciones" })).toBeVisible();
  });

  test("13. ruta inexistente muestra el 404 poético", async ({ page }) => {
    await page.goto("/#/blog/perdido");
    await expect(page.getByText("迷路")).toBeVisible();
  });
});
