import { useEffect } from 'react';
import { CharacterSelector } from './components/CharacterSelector';
import { useAppStore } from './stores/app-store';
import { mockFighters } from './data/mockData';

function App() {
  const {
    attackingFighter,
    defendingFighters,
    setFightersData,
  } = useAppStore();

  // モックデータの初期化
  useEffect(() => {
    setFightersData({
      data: mockFighters,
      loading: false,
      error: null,
      lastFetch: Date.now(),
    });
  }, [setFightersData]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 py-6">
            LagScope
          </h1>
          <p className="text-gray-600 pb-4">
            大乱闘スマッシュブラザーズ SPECIALの確定反撃算出ツール
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* キャラクター選択セクション */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">キャラクター選択</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">攻撃側キャラクター</h3>
              <CharacterSelector type="attacker" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">防御側キャラクター</h3>
              <CharacterSelector type="defender" multiSelect />
            </div>
          </div>
        </section>

        {/* 選択状態の表示 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">選択状態</h2>
          <div className="space-y-2">
            <p>攻撃側: {attackingFighter?.displayName || '未選択'}</p>
            <p>防御側: {defendingFighters.length > 0 ? defendingFighters.map(f => f.displayName).join(', ') : '未選択'}</p>
          </div>
        </section>

        {/* 開発中メッセージ */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">開発状況</h2>
          <div className="space-y-2">
            <p className="text-green-600">✓ キャラクター選択機能</p>
            <p className="text-green-600">✓ アクセシビリティ機能</p>
            <p className="text-green-600">✓ パフォーマンス最適化</p>
            <p className="text-green-600">✓ 包括的なテストスイート</p>
            <p className="text-yellow-600">⚠ 技選択機能（実装中）</p>
            <p className="text-yellow-600">⚠ 計算エンジン（実装中）</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;