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

  test('JavaScript エラーが発生しない', async ({ page }) => {
    const errors: string[] = [];
    
    // JavaScriptエラーを監視
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // エラーが発生しないことを確認
    expect(errors).toHaveLength(0);
  });
});