import { test, expect } from '@playwright/test';

test('登入表單成功與失敗', async ({ page }) => {
  await page.goto('http://localhost:4200/');

  // 成功案例
  await page.fill('#username', 'admin');
  await page.fill('#password', '1234');
  await page.click('button[type="submit"]');
  await expect(page.locator('#message')).toHaveText('登入成功！');

  // 停五秒
  await page.waitForTimeout(5000);

  // 失敗案例
  await page.fill('#username', 'user');
  await page.fill('#password', 'wrong');
  await page.click('button[type="submit"]');
  await expect(page.locator('#message')).toHaveText('登入失敗。');

  // 停五秒
  await page.waitForTimeout(5000);
});