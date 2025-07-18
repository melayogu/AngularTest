import { test, expect } from '@playwright/test';

test.describe('遊戲中心基本測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/');
  });

  test('頁面載入測試', async ({ page }) => {
    // 檢查頁面標題
    await expect(page.locator('h1')).toContainText('遊戲中心');
    
    // 檢查遊戲選擇器容器
    await expect(page.locator('.game-selector-container')).toBeVisible();
  });

  test('遊戲元素顯示測試', async ({ page }) => {
    // 檢查篩選器是否存在
    await expect(page.locator('.filters')).toBeVisible();
    
    // 檢查遊戲網格是否存在
    await expect(page.locator('.games-grid')).toBeVisible();
    
    // 檢查遊戲卡片是否存在（使用 first() 只檢查第一個）
    await expect(page.locator('.game-card').first()).toBeVisible();
  });

  test('遊戲交互測試', async ({ page }) => {
    // 檢查篩選器是否可以交互
    const categorySelect = page.locator('select').first();
    await expect(categorySelect).toBeVisible();
    
    // 選擇不同的分類
    await categorySelect.selectOption('action');
    await page.waitForTimeout(500);
    
    // 檢查遊戲卡片是否仍然可見（使用 first() 只檢查第一個）
    await expect(page.locator('.game-card').first()).toBeVisible();
  });

  test('遊戲統計顯示測試', async ({ page }) => {
    // 檢查統計資訊區域
    await expect(page.locator('.stats')).toBeVisible();
    
    // 檢查統計數字（使用 first() 只檢查第一個）
    await expect(page.locator('.stat-number').first()).toBeVisible();
    await expect(page.locator('.stat-label').first()).toBeVisible();
  });

  test('遊戲卡片互動測試', async ({ page }) => {
    // 檢查遊戲卡片基本資訊（使用 first() 只檢查第一個）
    await expect(page.locator('.game-card').first()).toBeVisible();
    await expect(page.locator('.game-info').first()).toBeVisible();
    await expect(page.locator('.game-meta').first()).toBeVisible();
  });

  test('響應式設計測試', async ({ page }) => {
    // 測試桌面版本
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.game-selector-container')).toBeVisible();
    
    // 測試平板版本
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.game-selector-container')).toBeVisible();
    
    // 測試手機版本
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.game-selector-container')).toBeVisible();
  });

  test('按鈕可見性測試', async ({ page }) => {
    // 檢查遊戲卡片中的按鈕（使用 first() 只檢查第一個）
    const playBtn = page.locator('.btn-play').first();
    await expect(playBtn).toBeVisible();
    
    // 檢查按鈕文字
    await expect(playBtn).toContainText('開始遊戲');
  });
});
