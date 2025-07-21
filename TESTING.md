# LagScope テスティングガイド

## テスト構成

このプロジェクトは包括的なテスト戦略を採用しています：

### テストタイプ
- **単体テスト**: 個別コンポーネント・関数のテスト（Vitest + React Testing Library）
- **統合テスト**: コンポーネント間の連携テスト
- **E2Eテスト**: エンドユーザーの操作フローテスト（Playwright）
- **アクセシビリティテスト**: A11yコンプライアンステスト（jest-axe）

### テスト実行

```bash
# 全テスト実行
npm run test:ci

# 単体・統合テスト
npm run test:run

# E2Eテスト
npm run test:e2e

# 重要テストのみ（CI前チェック）
npm run test:critical

# テストUIで開発
npm run test:ui
npm run test:e2e:ui
```

## CI/CD対応

### CI環境での特別設定
- タイムアウト延長（CI: 10秒、ローカル: 5秒）
- シングルスレッド実行で安定性向上
- Playwrightリトライ設定（CI: 2回）
- メモリ最適化（--max-old-space-size=4096）

### 失敗防止策
1. **Pre-commit Hook**: 重要テストの事前実行
2. **テストヘルパー**: 安定したモーダル操作・待機処理
3. **モック管理**: 型安全な共通モック
4. **環境変数**: CI環境での最適化設定

## 開発フロー

### UI変更時
1. コンポーネント修正
2. 関連テスト更新
3. `npm run test:critical` 実行
4. コミット・プッシュ

### 新機能追加時
1. テスト設計
2. TDD実装
3. 統合テスト追加
4. E2Eシナリオ追加

## トラブルシューティング

### よくある問題

#### "Unable to find element" エラー
```typescript
// 悪い例
screen.getByText('具体的なテキスト')

// 良い例
await screen.findByRole('button', { name: /パターン/ })
```

#### 非同期処理の待機
```typescript
// 悪い例
fireEvent.click(button)
expect(result).toBe(expected)

// 良い例
await user.click(button)
await waitFor(() => {
  expect(result).toBe(expected)
})
```

#### モーダル操作
```typescript
// ヘルパー使用推奨
import { openCharacterModal, selectCharacterSafely } from '../test-utils/test-helpers'

await selectCharacterSafely(user, 'マリオ')
```

### CI失敗時の対応
1. `gh run view [run-id] --log-failed` でログ確認
2. ローカルで `npm run test:ci` 実行
3. 問題特定・修正
4. 再プッシュ

## メンテナンス

### 定期チェック項目
- [ ] テストカバレッジ85%以上維持
- [ ] CI実行時間15分以内
- [ ] E2Eテスト成功率95%以上
- [ ] アクセシビリティ違反0件

### 更新タイミング
- UI変更: 即座にテスト更新
- ストア変更: 関連モック更新
- 新機能: テストファースト追加

## 参考資料

- [テスト安定性ガイド](./.github/workflows/test-stability.md)
- [Testing Library ドキュメント](https://testing-library.com/)
- [Playwright ドキュメント](https://playwright.dev/)
- [Vitest ドキュメント](https://vitest.dev/)