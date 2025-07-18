import { test, expect } from '@playwright/test';

test.describe('漂漂河小遊戲測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/');
  });

  test('遊戲載入測試', async ({ page }) => {
    // 檢查遊戲標題是否存在
    await expect(page.locator('h1')).toHaveText('🏊‍♂️ 漂漂河小遊戲 🚣‍♀️');
    
    // 檢查遊戲容器是否存在
    await expect(page.locator('.game-container')).toBeVisible();
    
    // 檢查得分顯示
    await expect(page.locator('.score')).toContainText('得分: 0');
    
    // 檢查時間顯示
    await expect(page.locator('.time')).toContainText('時間: 0s');
    
    // 檢查河流 SVG 是否存在
    await expect(page.locator('.river')).toBeVisible();
  });

  test('遊戲元素顯示測試', async ({ page }) => {
    // 檢查河道路徑是否存在
    await expect(page.locator('.river-path.outer-path')).toBeVisible();
    await expect(page.locator('.river-path.inner-path')).toBeVisible();
    
    // 檢查小船是否存在
    await expect(page.locator('.boat')).toBeVisible();
    
    // 檢查水流效果容器是否存在
    await expect(page.locator('.water-flow')).toBeVisible();
  });

  test('遊戲交互測試', async ({ page }) => {
    // 檢查遊戲容器是否可以獲得焦點
    await page.locator('.game-container').focus();
    
    // 測試鍵盤控制（模擬按鍵）
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    // 檢查遊戲是否還在運行
    await expect(page.locator('.game-container')).toBeVisible();
  });

  test('遊戲資訊顯示測試', async ({ page }) => {
    // 檢查遊戲資訊區域
    await expect(page.locator('.game-info')).toBeVisible();
    
    // 檢查得分和時間的初始值
    await expect(page.locator('.score')).toContainText('得分:');
    await expect(page.locator('.time')).toContainText('時間:');
    
    // 檢查遊戲標題區域
    await expect(page.locator('.game-header')).toBeVisible();
  });

  test('遊戲長時間運行測試', async ({ page }) => {
    // 檢查遊戲初始狀態
    await expect(page.locator('.game-container')).toBeVisible();
    
    // 讓遊戲運行一段時間
    await page.waitForTimeout(3000);
    
    // 檢查遊戲是否仍然正常運行
    await expect(page.locator('.game-container')).toBeVisible();
    await expect(page.locator('.boat')).toBeVisible();
  });

  test('響應式設計測試', async ({ page }) => {
    // 測試桌面版本
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.game-container')).toBeVisible();
    await expect(page.locator('.game-controls')).toBeVisible();
    
    // 測試平板版本
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.game-container')).toBeVisible();
    await expect(page.locator('.game-controls')).toBeVisible();
    
    // 測試手機版本
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.game-container')).toBeVisible();
    await expect(page.locator('.game-controls')).toBeVisible();
    
    // 檢查按鈕是否可見
    await expect(page.locator('.start-btn')).toBeVisible();
    await expect(page.locator('.reset-btn')).toBeVisible();
  });

  test('按鈕可見性測試', async ({ page }) => {
    // 檢查按鈕是否在視窗範圍內
    const startBtn = page.locator('.start-btn');
    const resetBtn = page.locator('.reset-btn');
    
    await expect(startBtn).toBeVisible();
    await expect(resetBtn).toBeVisible();
    
    // 獲取按鈕位置
    const startBtnBox = await startBtn.boundingBox();
    const resetBtnBox = await resetBtn.boundingBox();
    
    // 檢查按鈕是否在視窗內
    expect(startBtnBox).not.toBeNull();
    expect(resetBtnBox).not.toBeNull();
    
    if (startBtnBox && resetBtnBox) {
      const viewportSize = page.viewportSize();
      if (viewportSize) {
        expect(startBtnBox.y + startBtnBox.height).toBeLessThanOrEqual(viewportSize.height);
        expect(resetBtnBox.y + resetBtnBox.height).toBeLessThanOrEqual(viewportSize.height);
      }
    }
  });
});
