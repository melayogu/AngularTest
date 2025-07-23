import { test, expect } from '@playwright/test';

test.describe('遊戲中心響應式測試', () => {
  test.beforeEach(async ({ page }) => {
    // 增加頁面載入超時時間
    page.setDefaultTimeout(15000);

    await page.goto('http://localhost:4200/');

    // 等待 Angular 應用程式完全載入
    await page.waitForLoadState('networkidle');

    // 等待主要內容載入
    try {
      await page.waitForSelector('.game-selector-container', { timeout: 15000 });
    } catch (error) {
      console.log('等待遊戲選擇器容器超時，檢查頁面內容...');
      const content = await page.content();
      console.log('頁面內容:', content.substring(0, 500));
      throw error;
    }
  });

  test('桌面版本顯示測試', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 檢查遊戲選擇器是否可見
    await expect(page.locator('.game-selector-container')).toBeVisible();
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('h1')).toContainText('遊戲中心');

    // 檢查篩選器是否可見
    await expect(page.locator('.filters')).toBeVisible();
    await expect(page.locator('.games-grid')).toBeVisible();
  });

  test('平板版本顯示測試', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    // 檢查基本元素是否可見
    await expect(page.locator('.game-selector-container')).toBeVisible();
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.games-grid')).toBeVisible();
  });

  test('手機版本顯示測試', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // 檢查基本元素是否可見
    await expect(page.locator('.game-selector-container')).toBeVisible();
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.games-grid')).toBeVisible();
  });

  test('小屏幕手機顯示測試', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    // 檢查基本元素是否可見
    await expect(page.locator('.game-selector-container')).toBeVisible();
    await expect(page.locator('.header')).toBeVisible();
  });

  test('低高度屏幕顯示測試', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 400 });

    // 檢查基本元素是否可見
    await expect(page.locator('.game-selector-container')).toBeVisible();
    await expect(page.locator('.header')).toBeVisible();
  });

  test('按鈕位置測試', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });

    // 檢查遊戲卡片按鈕是否可見（使用 first() 只檢查第一個）
    await expect(page.locator('.btn-play').first()).toBeVisible();
  });

  test('滾動測試', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 500 });

    // 檢查頁面是否可滾動
    await expect(page.locator('.game-selector-container')).toBeVisible();

    // 滾動到底部
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // 檢查統計資訊是否可見
    await expect(page.locator('.stats')).toBeVisible();
  });
});
