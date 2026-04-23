import { expect, test } from "@playwright/test";

test("user can register, login and open dashboard", async ({ page }) => {
  const uniqueEmail = `student-${Date.now()}@example.com`;
  const password = "strongpass123";

  await page.goto("/register");
  await page.getByPlaceholder("Как к вам обращаться?").fill("Учебный Пользователь");
  await page.getByPlaceholder("Введите ваш email").fill(uniqueEmail);
  await page.locator('input[name="password"]').first().fill(password);
  await page.getByPlaceholder("Подтвердите ваш пароль").fill(password);
  await page.getByRole("button", { name: "Зарегистрироваться" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("Регистрация прошла успешно. Теперь войдите в систему.")).toBeVisible();

  await page.getByPlaceholder("Введите ваш email").fill(uniqueEmail);
  await page.getByPlaceholder("Введите ваш пароль").fill(password);
  await page.getByRole("button", { name: "Войти" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /Здравствуйте,/ })).toBeVisible();
  await expect(page.getByText("Пока нет ни одного опроса.")).toBeVisible();
});
