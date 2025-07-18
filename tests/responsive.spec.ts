import { test, expect } from '@playwright/test';

test.describe('漂漂河小遊戲響應式測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/');
  });

  test('桌面版本顯示測試', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 檢查所有元素是否可見
    await expect(page.locator('.game-container')).toBeVisible();
    await expect(page.locator('.game-header')).toBeVisible();
    await expect(page.locator('.river-container')).toBeVisible();
    await expect(page.locator('.game-controls')).toBeVisible();
    
    // 檢查按鈕是否可見
    await expect(page.locator('.start-btn')).toBeVisible();
    await expect(page.locator('.reset-btn')).toBeVisible();
  });

  test('平板版本顯示測試', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 檢查所有元素是否可見
    await expect(page.locator('.game-container')).toBeVisible();
    await expect(page.locator('.game-header')).toBeVisible();
    await expect(page.locator('.river-container')).toBeVisible();
    await expect(page.locator('.game-controls')).toBeVisible();
    
    // 檢查按鈕是否可見
    await expect(page.locator('.start-btn')).toBeVisible();
    await expect(page.locator('.reset-btn')).toBeVisible();
  });

  test('手機版本顯示測試', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 檢查所有元素是否可見
    await expect(page.locator('.game-container')).toBeVisible();
    await expect(page.locator('.game-header')).toBeVisible();
    await expect(page.locator('.river-container')).toBeVisible();
    await expect(page.locator('.game-controls')).toBeVisible();
    
    // 檢查按鈕是否可見
    await expect(page.locator('.start-btn')).toBeVisible();
    await expect(page.locator('.reset-btn')).toBeVisible();
  });

  test('小屏幕手機顯示測試', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    
    // 檢查所有元素是否可見
    await expect(page.locator('.game-container')).toBeVisible();
    await expect(page.locator('.game-header')).toBeVisible();
    await expect(page.locator('.river-container')).toBeVisible();
    await expect(page.locator('.game-controls')).toBeVisible();
    
    // 檢查按鈕是否可見
    await expect(page.locator('.start-btn')).toBeVisible();
    await expect(page.locator('.reset-btn')).toBeVisible();
  });

  test('低高度屏幕顯示測試', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    
    // 檢查所有元素是否可見
    await expect(page.locator('.game-container')).toBeVisible();
    await expect(page.locator('.game-header')).toBeVisible();
    await expect(page.locator('.river-container')).toBeVisible();
    await expect(page.locator('.game-controls')).toBeVisible();
    
    // 檢查按鈕是否可見
    await expect(page.locator('.start-btn')).toBeVisible();
    await expect(page.locator('.reset-btn')).toBeVisible();
  });

  test('按鈕位置測試', async ({ page }) => {
    const viewportSizes = [
      { width: 1920, height: 1080 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 },
      { width: 320, height: 568 }
    ];

    for (const size of viewportSizes) {
      await page.setViewportSize(size);
      
      // 檢查按鈕是否在視窗範圍內
      const startBtn = page.locator('.start-btn');
      const resetBtn = page.locator('.reset-btn');
      
      await expect(startBtn).toBeVisible();
      await expect(resetBtn).toBeVisible();
      
      // 檢查按鈕是否可點擊
      await expect(startBtn).toBeEnabled();
      await expect(resetBtn).toBeEnabled();
      
      // 獲取按鈕位置並確保在視窗內
      const startBtnBox = await startBtn.boundingBox();
      const resetBtnBox = await resetBtn.boundingBox();
      
      expect(startBtnBox).not.toBeNull();
      expect(resetBtnBox).not.toBeNull();
      
      if (startBtnBox && resetBtnBox) {
        // 確保按鈕完全在視窗內
        expect(startBtnBox.y).toBeGreaterThanOrEqual(0);
        expect(startBtnBox.y + startBtnBox.height).toBeLessThanOrEqual(size.height);
        expect(resetBtnBox.y).toBeGreaterThanOrEqual(0);
        expect(resetBtnBox.y + resetBtnBox.height).toBeLessThanOrEqual(size.height);
      }
    }
  });

  test('滾動測試', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 500 });
    
    // 檢查是否可以滾動到按鈕
    const gameControls = page.locator('.game-controls');
    await expect(gameControls).toBeVisible();
    
    // 滾動到底部
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // 檢查按鈕是否仍然可見
    await expect(page.locator('.start-btn')).toBeVisible();
    await expect(page.locator('.reset-btn')).toBeVisible();
  });
});
