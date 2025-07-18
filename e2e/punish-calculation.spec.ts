import { test, expect } from '@playwright/test';

test.describe('確定反撃計算のE2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('基本的な確定反撃計算フロー', async ({ page }) => {
    // キャラクター選択
    await page.getByRole('button', { name: 'マリオを選択' }).click();
    await page.getByRole('button', { name: 'リンクを選択' }).click();
    
    // 技選択
    await page.getByRole('combobox', { name: '技を選択' }).click();
    await page.getByRole('option', { name: 'ジャブ1' }).click();
    
    // 計算オプション設定
    await page.getByRole('checkbox', { name: 'ガードキャンセル行動を含む' }).check();
    await page.getByRole('checkbox', { name: 'シールドドロップを含む' }).check();
    
    // 計算実行
    await page.getByRole('button', { name: '計算実行' }).click();
    
    // 結果確認
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('計算結果')).toBeVisible();
    
    // 結果の詳細確認
    const resultRows = page.locator('tbody tr');
    await expect(resultRows).toHaveCount(1, { timeout: 5000 });
    
    // 結果の内容確認
    const firstRow = resultRows.first();
    await expect(firstRow.locator('td').nth(0)).toContainText('リンク');
    await expect(firstRow.locator('td').nth(1)).toContainText('技名');
    await expect(firstRow.locator('td').nth(2)).toContainText('%');
  });

  test('複数キャラクターでの確定反撃計算', async ({ page }) => {
    // 攻撃側キャラクター選択
    await page.getByRole('button', { name: 'マリオを選択' }).click();
    
    // 複数の防御側キャラクター選択
    await page.getByRole('button', { name: 'リンクを選択' }).first().click();
    await page.getByRole('button', { name: 'ピカチュウを選択' }).first().click();
    await page.getByRole('button', { name: 'ルイージを選択' }).first().click();
    
    // 技選択
    await page.getByRole('combobox', { name: '技を選択' }).click();
    await page.getByRole('option', { name: 'ダッシュアタック' }).click();
    
    // 計算実行
    await page.getByRole('button', { name: '計算実行' }).click();
    
    // 複数キャラクターの結果確認
    await expect(page.getByRole('table')).toBeVisible();
    const resultRows = page.locator('tbody tr');
    await expect(resultRows).toHaveCount(3, { timeout: 5000 });
    
    // 各キャラクターの結果確認
    await expect(page.getByText('リンク')).toBeVisible();
    await expect(page.getByText('ピカチュウ')).toBeVisible();
    await expect(page.getByText('ルイージ')).toBeVisible();
  });

  test('フィルタリング機能', async ({ page }) => {
    // 基本的な計算セットアップ
    await page.getByRole('button', { name: 'マリオを選択' }).click();
    await page.getByRole('button', { name: 'リンクを選択' }).click();
    await page.getByRole('combobox', { name: '技を選択' }).click();
    await page.getByRole('option', { name: 'ダッシュアタック' }).click();
    await page.getByRole('button', { name: '計算実行' }).click();
    
    // 結果が表示されるまで待機
    await expect(page.getByRole('table')).toBeVisible();
    
    // 確定技のみフィルタ
    await page.getByRole('checkbox', { name: '確定のみ' }).check();
    
    // フィルタされた結果の確認
    const guaranteedRows = page.locator('tbody tr:has-text("確定")');
    await expect(guaranteedRows).toHaveCount(1, { timeout: 3000 });
    
    // 撃墜技のみフィルタ
    await page.getByRole('checkbox', { name: '確定のみ' }).uncheck();
    await page.getByRole('checkbox', { name: '撃墜技のみ' }).check();
    
    // 撃墜技の結果確認
    const killMoveRows = page.locator('tbody tr:has-text("撃墜")');
    await expect(killMoveRows).toHaveCount(1, { timeout: 3000 });
  });

  test('ソート機能', async ({ page }) => {
    // 基本的な計算セットアップ
    await page.getByRole('button', { name: 'マリオを選択' }).click();
    await page.getByRole('button', { name: 'リンクを選択' }).click();
    await page.getByRole('combobox', { name: '技を選択' }).click();
    await page.getByRole('option', { name: 'ダッシュアタック' }).click();
    await page.getByRole('button', { name: '計算実行' }).click();
    
    // 結果が表示されるまで待機
    await expect(page.getByRole('table')).toBeVisible();
    
    // ダメージでソート
    await page.getByRole('columnheader', { name: 'ダメージ' }).click();
    
    // ソート結果の確認
    const damageValues = page.locator('tbody tr td:nth-child(3)');
    const firstDamage = await damageValues.first().textContent();
    const lastDamage = await damageValues.last().textContent();
    
    // 降順ソートの確認（最初の値が最後の値より大きい）
    if (firstDamage && lastDamage) {
      const firstValue = parseInt(firstDamage.replace('%', ''));
      const lastValue = parseInt(lastDamage.replace('%', ''));
      expect(firstValue).toBeGreaterThanOrEqual(lastValue);
    }
    
    // 再度クリックで昇順ソート
    await page.getByRole('columnheader', { name: 'ダメージ' }).click();
    
    // 昇順ソート結果の確認
    const newFirstDamage = await damageValues.first().textContent();
    const newLastDamage = await damageValues.last().textContent();
    
    if (newFirstDamage && newLastDamage) {
      const newFirstValue = parseInt(newFirstDamage.replace('%', ''));
      const newLastValue = parseInt(newLastDamage.replace('%', ''));
      expect(newFirstValue).toBeLessThanOrEqual(newLastValue);
    }
  });

  test('エクスポート機能', async ({ page }) => {
    // 基本的な計算セットアップ
    await page.getByRole('button', { name: 'マリオを選択' }).click();
    await page.getByRole('button', { name: 'リンクを選択' }).click();
    await page.getByRole('combobox', { name: '技を選択' }).click();
    await page.getByRole('option', { name: 'ジャブ1' }).click();
    await page.getByRole('button', { name: '計算実行' }).click();
    
    // 結果が表示されるまで待機
    await expect(page.getByRole('table')).toBeVisible();
    
    // エクスポートボタンクリック
    await page.getByRole('button', { name: 'エクスポート' }).click();
    
    // エクスポートモーダルの確認
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('エクスポート形式を選択')).toBeVisible();
    
    // CSV形式選択
    await page.getByRole('radio', { name: 'CSV形式' }).check();
    
    // ダウンロード処理の待機
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'ダウンロード' }).click();
    const download = await downloadPromise;
    
    // ダウンロードファイルの確認
    expect(download.suggestedFilename()).toMatch(/lagscope-results.*\.csv$/);
  });

  test('キャラクター検索機能', async ({ page }) => {
    // 検索ボックスに入力
    await page.getByRole('searchbox', { name: 'キャラクター検索' }).fill('マリオ');
    
    // 検索結果の確認
    await expect(page.getByRole('button', { name: 'マリオを選択' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'リンクを選択' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'ピカチュウを選択' })).not.toBeVisible();
    
    // 検索クリア
    await page.getByRole('button', { name: '検索をクリア' }).click();
    
    // 全キャラクターが表示されることを確認
    await expect(page.getByRole('button', { name: 'マリオを選択' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'リンクを選択' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ピカチュウを選択' })).toBeVisible();
  });

  test('計算オプション変更', async ({ page }) => {
    // 基本的な計算セットアップ
    await page.getByRole('button', { name: 'マリオを選択' }).click();
    await page.getByRole('button', { name: 'リンクを選択' }).click();
    await page.getByRole('combobox', { name: '技を選択' }).click();
    await page.getByRole('option', { name: 'ダッシュアタック' }).click();
    
    // 計算オプション設定
    await page.getByRole('checkbox', { name: 'ワンパターン相殺を適用' }).check();
    await page.getByRole('combobox', { name: 'ワンパターンレベル' }).selectOption('stale3');
    
    // 距離フィルタ設定
    await page.getByRole('checkbox', { name: '近距離技のみ' }).check();
    await page.getByRole('checkbox', { name: '中距離技のみ' }).uncheck();
    await page.getByRole('checkbox', { name: '遠距離技のみ' }).uncheck();
    
    // 計算実行
    await page.getByRole('button', { name: '計算実行' }).click();
    
    // 結果確認
    await expect(page.getByRole('table')).toBeVisible();
    
    // ワンパターン相殺が適用された結果であることを確認
    await expect(page.getByText('ワンパターン相殺適用済み')).toBeVisible();
    
    // 近距離技のみが表示されることを確認
    const rangeColumns = page.locator('tbody tr td:nth-child(4)');
    await expect(rangeColumns.first()).toContainText('近距離');
  });

  test('レスポンシブデザイン', async ({ page }) => {
    // モバイルビューポートに変更
    await page.setViewportSize({ width: 375, height: 667 });
    
    // モバイル用キャラクター選択モーダル
    await page.getByRole('button', { name: '選択' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // モーダル内でキャラクター選択
    await page.getByRole('button', { name: 'マリオを選択' }).click();
    await page.getByRole('button', { name: 'リンクを選択' }).click();
    
    // モーダル閉じる
    await page.getByRole('button', { name: '閉じる' }).click();
    
    // モバイル用結果表示の確認
    await page.getByRole('combobox', { name: '技を選択' }).click();
    await page.getByRole('option', { name: 'ジャブ1' }).click();
    await page.getByRole('button', { name: '計算実行' }).click();
    
    // モバイル用カード表示の確認
    await expect(page.locator('[data-testid="mobile-result-card"]')).toBeVisible();
  });

  test('アクセシビリティ', async ({ page }) => {
    // キーボードナビゲーション
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // ARIA属性の確認
    const searchBox = page.getByRole('searchbox', { name: 'キャラクター検索' });
    await expect(searchBox).toHaveAttribute('aria-label', 'キャラクター検索');
    
    // スクリーンリーダー対応の確認
    const statusRegion = page.getByRole('status');
    await expect(statusRegion).toBeVisible();
    
    // 高コントラストモード
    await page.getByRole('button', { name: 'アクセシビリティ設定' }).click();
    await page.getByRole('switch', { name: '高コントラストモード' }).click();
    
    // 高コントラストモードが適用されることを確認
    await expect(page.locator('html')).toHaveClass(/high-contrast/);
  });

  test('エラーハンドリング', async ({ page }) => {
    // ネットワークエラーをシミュレート
    await page.route('**/api/fighters', route => route.abort());
    
    // エラーメッセージの確認
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText('データの読み込みに失敗しました')).toBeVisible();
    
    // リトライボタンの確認
    await page.getByRole('button', { name: 'リトライ' }).click();
    
    // 正常な状態に戻す
    await page.unroute('**/api/fighters');
    
    // 正常にデータが読み込まれることを確認
    await expect(page.getByRole('button', { name: 'マリオを選択' })).toBeVisible();
  });

  test('パフォーマンス測定', async ({ page }) => {
    // パフォーマンス測定開始
    await page.evaluate(() => performance.mark('calculation-start'));
    
    // 大量データでの計算
    await page.getByRole('button', { name: 'マリオを選択' }).click();
    
    // 複数キャラクター選択
    for (let i = 0; i < 10; i++) {
      await page.getByRole('button', { name: `キャラクター${i}を選択` }).click();
    }
    
    await page.getByRole('combobox', { name: '技を選択' }).click();
    await page.getByRole('option', { name: 'スマッシュ攻撃' }).click();
    await page.getByRole('button', { name: '計算実行' }).click();
    
    // パフォーマンス測定終了
    await page.evaluate(() => performance.mark('calculation-end'));
    
    // 結果が表示されるまで待機
    await expect(page.getByRole('table')).toBeVisible();
    
    // パフォーマンス測定結果の確認
    const performanceData = await page.evaluate(() => {
      performance.measure('calculation', 'calculation-start', 'calculation-end');
      const measures = performance.getEntriesByName('calculation');
      return measures[0]?.duration || 0;
    });
    
    // 計算時間が5秒以内であることを確認
    expect(performanceData).toBeLessThan(5000);
  });
});