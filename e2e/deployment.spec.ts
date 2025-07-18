import { test, expect } from '@playwright/test';

test.describe('デプロイ検証テスト', () => {
  test('アプリケーションが正常に読み込まれる', async ({ page }) => {
    await page.goto('/');
    
    // ページタイトルを確認
    await expect(page).toHaveTitle(/LagScope/);
    
    // ルートコンテナが存在することを確認
    await expect(page.locator('#root')).toBeVisible();
    
    // アプリケーションが正常に読み込まれることを確認
    await expect(page.locator('body')).toContainText('LagScope');
  });

  test('静的アセットが正常に読み込まれる', async ({ page }) => {
    await page.goto('/');
    
    // CSSファイルが読み込まれることを確認
    const stylesheets = await page.locator('link[rel="stylesheet"]').count();
    expect(stylesheets).toBeGreaterThan(0);
    
    // JavaScriptファイルが読み込まれることを確認
    const scripts = await page.locator('script[type="module"]').count();
    expect(scripts).toBeGreaterThan(0);
  });

  test('404ページが適切に処理される', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    
    // 404ページでも200ステータスを返すことを確認（SPA対応）
    expect(response?.status()).toBe(200);
    
    // アプリケーションが読み込まれることを確認
    await expect(page.locator('#root')).toBeVisible();
  });

  test('パフォーマンスメトリクスが適切な範囲内', async ({ page }) => {
    // ページ読み込み時間を測定
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // 3秒以内に読み込まれることを確認
    expect(loadTime).toBeLessThan(3000);
    
    // First Contentful Paint の測定
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              resolve(entry.startTime);
            }
          }
        }).observe({ entryTypes: ['paint'] });
      });
    });
    
    // FCP が 2秒以内であることを確認
    expect(fcp).toBeLessThan(2000);
  });

  test('レスポンシブデザインが適切に機能する', async ({ page }) => {
    // デスクトップサイズでテスト
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
    
    // タブレットサイズでテスト
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(page.locator('#root')).toBeVisible();
    
    // モバイルサイズでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await expect(page.locator('#root')).toBeVisible();
  });

  test('JavaScript エラーが発生しない', async ({ page }) => {
    const errors: string[] = [];
    
    // JavaScriptエラーを監視
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // エラーが発生しないことを確認
    expect(errors).toHaveLength(0);
  });
});