# LagScope プロジェクト規約

## プロジェクト概要

LagScopeは、大乱闘スマッシュブラザーズ SPECIALの確定反撃算出ツールです。

**技術スタック**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Vitest + React Testing Library

## 仕様参照

実装時に仕様について迷った場合は、以下のディレクトリを参照してください：
- `/home/calc9/dev/lagscope/.kiro/specs/` - プロジェクトの詳細仕様書
- `/home/calc9/dev/lagscope/.kiro/specs/smash-revenge-calculator/` - 実装計画とタスク定義
- `/home/calc9/dev/lagscope/.kiro/specs/smash-revenge-calculator/tasks.md` - タスク進捗管理

## コーディング規約

### 1. TypeScript 規約

#### 型定義
- **`any`の禁止**: `tsconfig.json`で`"noImplicitAny": true`を必須とし、型安全性を最大限に活用
- **型ファイルの管理**: フレームデータ関連の型は`src/types/frameData.ts`で集中管理
- **Interface vs Type**:
  - `interface`: オブジェクトの構造定義（拡張可能性を重視）
  - `type`: ユニオン型、交差型、プリミティブ型のエイリアス

#### フレームデータ型定義の例
```typescript
// src/types/frameData.ts
export interface Move {
  id: number;
  name: string;
  startup: number;      // 発生フレーム
  totalFrames: number;  // 全体フレーム
  onShield: number;     // ガード硬直差
  // 他のプロパティ
}

export interface Character {
  id: string;
  name: string;
  moves: Move[];
  // キャラクター固有データ
}
```

#### 型推論の活用
- 明らかな型（`const name = "Mario"`）には冗長な型定義を避ける
- Non-null Assertion Operator (`!`) は限定的に使用し、基本的には型ガードやオプショナルチェイニング (`?.`) を使用

### 2. 命名規則

- **変数・関数**: `camelCase` (`calculateFrameAdvantage`, `selectedCharacter`)
- **コンポーネント・型・インターフェース**: `PascalCase` (`CharacterSelector`, `Move`, `FrameData`)
- **定数**: `UPPER_SNAKE_CASE` (`MAX_FRAME_ADVANTAGE`, `SHIELD_RELEASE_FRAMES`)
- **ファイル名**: 
  - コンポーネント: `PascalCase.tsx` (`CharacterSelector.tsx`)
  - その他: `kebab-case.ts` (`frame-calculator.ts`)

### 3. React コンポーネント設計

#### コンポーネントの粒度
- 意味のある単位で細かくコンポーネント化
- 例: `CharacterSelector`, `MoveList`, `ResultDisplay`, `FrameCalculator`

#### Props の型定義
```typescript
interface CharacterSelectorProps {
  type: 'attacker' | 'defender';
  selectedCharacters: string[];
  onCharacterSelect: (characterId: string) => void;
  multiSelect?: boolean;
}
```

#### パフォーマンス最適化
- 重い計算には `useMemo` を使用
- 不要な再レンダリングを防ぐため `React.memo` を活用
- 複雑な計算ロジックはコンポーネント外の純粋関数として実装

### 4. Zustand 状態管理

#### ストアの分割
関心ごとに小さくストアを分割:
- `useCharacterSelectionStore`: キャラクター選択状態
- `useCalculatorResultStore`: 計算結果状態
- `useUISettingsStore`: UI設定状態

#### Selector の活用
```typescript
// 悪い例: オブジェクト全体を購読
const { characterA } = useCharacterSelectionStore();

// 良い例: 必要な値だけを購読
const characterA = useCharacterSelectionStore(state => state.characterA);
```

### 5. Tailwind CSS 規約

#### Utility First の徹底
- `@apply` を使ったカスタムクラスは最小限に留める
- JSX内でユーティリティクラスを直接記述

#### 動的クラス名の注意
- `className={\`w-[${width}px]\`}` のような動的クラス名は避ける
- 完全なクラス名を記述してビルド時パージ対象を回避

#### 設定ファイル
- `tailwind.config.js` でテーマカラー、フォント、カスタム値を定義
- デザインの一貫性を保つ

### 6. 計算ロジック分離

#### 純粋関数として実装
```typescript
// src/lib/calculator.ts
import { Move } from '../types/frameData';

export function calculateFrameAdvantage(
  myMove: Move, 
  opponentShieldReleaseFrame: number
): number {
  return myMove.onShield + opponentShieldReleaseFrame;
}
```

#### React での使用
```tsx
const frameAdvantage = useMemo(() => {
  if (!myMove || !opponent) return null;
  return calculateFrameAdvantage(myMove, opponent.shieldReleaseFrame);
}, [myMove, opponent]);
```

### 7. フォーマット・静的解析

#### 必須ツール
- **Prettier**: コードフォーマット自動化
- **ESLint**: コード品質保証
  - `no-console`: 本番コードの `console.log` を禁止
  - `no-debugger`: デバッガステートメントを禁止
  - `@typescript-eslint/recommended`: TypeScript推奨ルール

#### 設定ファイル
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2
}
```

### 8. コメント規約

- **「なぜ」を説明**: 「何を」ではなく「なぜ」その実装になっているかを説明
- **JSDoc/TSDoc**: 公開API・複雑な関数には引数、戻り値、目的を説明
- **計算ロジック**: フレーム計算の根拠や参考資料を記載

例:
```typescript
/**
 * シールド硬直差を計算します
 * @param attackMove 攻撃側の技
 * @param defenderShieldFrame 防御側のシールド解除フレーム
 * @returns フレーム有利値（正の値で攻撃側有利）
 * @see https://ultimateframedata.com/ - フレームデータ参考
 */
export function calculateShieldAdvantage(
  attackMove: Move,
  defenderShieldFrame: number
): number {
  // ワンパターン相殺を考慮した計算
  // 公式：|技のガード硬直差| - シールド解除フレーム
  return Math.abs(attackMove.onShield) - defenderShieldFrame;
}
```

## テストルール

### 1. テスト戦略

#### テストピラミッド
1. **単体テスト (Unit Tests)**: 70%
2. **統合テスト (Integration Tests)**: 20%
3. **E2Eテスト (End-to-End Tests)**: 10%

#### テストフレームワーク
- **Vitest**: JavaScript/TypeScript ロジックのテスト
- **React Testing Library**: React コンポーネントのテスト
- **Playwright** (将来): E2E テスト

### 2. 単体テスト

#### 対象
- **計算ロジック**: `src/lib/calculator.ts` 内の全関数
- **ユーティリティ関数**: データ変換、バリデーション等
- **カスタムフック**: Zustand ストアのロジック

#### テストパターン
```typescript
// src/lib/__tests__/calculator.test.ts
import { calculateFrameAdvantage } from '../calculator';
import { Move } from '../../types/frameData';

describe('calculateFrameAdvantage', () => {
  const mockMove: Move = {
    id: 1,
    name: 'ジャブ',
    startup: 3,
    totalFrames: 16,
    onShield: -2,
  };

  it('正常なフレーム有利を計算する', () => {
    const result = calculateFrameAdvantage(mockMove, 11);
    expect(result).toBe(9); // |(-2)| + 11 = 9
  });

  it('不利な状況を正しく計算する', () => {
    const disadvantageMove: Move = { ...mockMove, onShield: -15 };
    const result = calculateFrameAdvantage(disadvantageMove, 11);
    expect(result).toBe(-4); // |(-15)| - 11 = -4
  });
});
```

### 3. 統合テスト

#### 対象
- コンポーネント間の相互作用
- ストアとコンポーネントの連携
- データフローの整合性

#### テストパターン
```typescript
// src/components/__tests__/CharacterSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterSelector } from '../CharacterSelector';

describe('CharacterSelector', () => {
  it('キャラクター選択時にコールバックが呼ばれる', () => {
    const mockOnSelect = vi.fn();
    render(
      <CharacterSelector
        type="attacker"
        selectedCharacters={[]}
        onCharacterSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByText('マリオ'));
    expect(mockOnSelect).toHaveBeenCalledWith('mario');
  });
});
```

### 4. E2Eテスト

#### 対象
- 主要なユーザーシナリオ
- 「キャラクター選択 → 技選択 → 計算実行 → 結果表示」のフロー
- レスポンシブ動作

#### テストパターン
```typescript
// e2e/punish-calculation.spec.ts
import { test, expect } from '@playwright/test';

test('確定反撃計算のフルフロー', async ({ page }) => {
  await page.goto('/');
  
  // キャラクター選択
  await page.selectOption('[data-testid="attacker-select"]', 'mario');
  await page.selectOption('[data-testid="defender-select"]', 'link');
  
  // 技選択
  await page.selectOption('[data-testid="move-select"]', 'jab1');
  
  // 計算実行
  await page.click('[data-testid="calculate-button"]');
  
  // 結果確認
  await expect(page.locator('[data-testid="results-table"]')).toBeVisible();
});
```

### 5. テスト品質基準

#### カバレッジ目標
- **計算ロジック**: 95%以上
- **コンポーネント**: 80%以上
- **全体**: 85%以上

#### テスト命名
- **形式**: `[テスト対象] は [条件] で [期待結果] を返す`
- **例**: `calculateFrameAdvantage は 不利な技で 負の値を返す`

#### テストの独立性
- 各テストは他のテストに依存しない
- `beforeEach` / `afterEach` で状態をクリーンアップ
- モックの適切な使用とクリーンアップ

### 6. データ精度とバリデーション

#### フレームデータの検証
- **データソース**: Ultimate Frame Data, コミュニティ検証済みデータ
- **バリデーション**: データ読み込み時のランタイム型チェック
- **テストデータ**: 実際のゲームデータに基づくテストケース

#### エラーハンドリング
- 不正なデータに対する適切なエラーメッセージ
- フォールバック動作の実装
- ユーザーへの明確なフィードバック

## 開発フロー

### 1. 機能開発の流れ
1. **要件定義**: 機能の目的と受け入れ基準を明確化
2. **設計**: コンポーネント設計、データフロー設計
3. **実装**: テストファーストで実装
4. **テスト**: 単体・統合・E2E テストの実装
5. **レビュー**: コードレビューとテストレビュー
6. **デプロイ**: CI/CDパイプラインでの自動テスト・デプロイ

### 2. 品質チェック
- **pre-commit**: ESLint、Prettier、型チェック
- **CI/CD**: テスト実行、ビルド検証、デプロイ
- **定期的**: 依存関係の更新、セキュリティ監査

### 3. パフォーマンス監視
- **Core Web Vitals**: LCP, FID, CLS の監視
- **バンドルサイズ**: 定期的な分析と最適化
- **計算性能**: 100ms以内の応答時間維持

このプロジェクトでは、フレームデータの正確性とユーザー体験が最重要です。すべての実装において、これらの品質基準を満たすことを最優先とします。

## CI/CD品質チェック

### Push前必須チェック項目

コードをpushする前に、以下の項目を**必ず**ローカルで確認してください。CIで同じチェックが実行されるため、事前確認により無駄なCI実行を防げます。

#### 1. 型チェック
```bash
npx tsc --noEmit
```
- TypeScriptの型エラーがないことを確認
- any型の使用、型安全性の問題を検出

#### 2. ESLintチェック
```bash
npm run lint
```
- コーディング規約への準拠を確認
- unused variables、console.log等のチェック
- 自動修正: `npm run lint -- --fix`

#### 3. 単体テスト
```bash
npm run test:run
```
- 全テストスイートの実行（338テスト）
- カバレッジ確認、テスト失敗の検出

#### 4. E2Eテスト
```bash
npx playwright install --with-deps  # 初回のみ
npx playwright test
```
- ブラウザでの統合テスト実行
- 実際のユーザーフロー検証

#### 5. ビルドテスト
```bash
npm run build
```
- 本番ビルドの成功確認
- バンドルサイズ、アセット生成の検証

### CI/CD推奨ワークフロー

```bash
# 1. 開発完了後の品質チェック
npm run lint
npx tsc --noEmit
npm run test:run

# 2. E2Eテスト（重要な変更の場合）
npx playwright test

# 3. ビルド確認
npm run build

# 4. 問題なければcommit & push
git add .
git commit -m "..."
git push
```

### CIエラー対応

CIでエラーが発生した場合：

1. **型エラー**: `npx tsc --noEmit`でローカル確認
2. **Lintエラー**: `npm run lint -- --fix`で自動修正
3. **テスト失敗**: `npm run test:run`でローカル再現
4. **E2Eエラー**: `npx playwright test --ui`でデバッグ
5. **ビルドエラー**: `npm run build`で依存関係確認

この事前チェックにより、CI/CDパイプラインの効率的な運用と高品質なコードの維持を実現します。

## アセット・画像ソース情報

### キャラクターアイコン

**現在使用中**: `smash-ultimate-assets` パッケージ
- **リポジトリ**: https://github.com/marcrd/smash-ultimate-assets
- **作者**: Marc A Rudkowski
- **ライセンス**: ISC
- **形式**: 200x200px PNG、RGBA
- **パス**: `/public/icons/fighters/`
- **説明**: コミュニティ提供のスマブラアセット集

**過去に使用**: `SSBU-Team-Selector` リポジトリ
- **リポジトリ**: https://github.com/zayeemvt/SSBU-Team-Selector
- **形式**: 64x64px PNG
- **実装日**: 2025年7月19日
- **説明**: 最初のストックアイコン実装で使用

### 著作権・免責事項

全ての知的財産権は任天堂株式会社に帰属します。本プロジェクトで使用している画像アセットは、フェアユース（公正使用）の範囲内での利用を意図しています。

**参考**:
- Nintendo の著作権ポリシー
- コミュニティツール開発のためのフェアユース適用

### アイコン更新履歴

- **2025-07-19**: 初回実装（64x64px、zayeemvt/SSBU-Team-Selector）
- **2025-07-20**: 統一化（200x200px、marcrd/smash-ultimate-assets）
- **2025-07-20**: ポケモントレーナー削除、個別ポケモンアイコン対応