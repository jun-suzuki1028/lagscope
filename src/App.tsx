import { useEffect, useState } from 'react';
import { CharacterSelector } from './components/CharacterSelector';
import { MoveSelector } from './components/MoveSelector';
import OptionsPanel from './components/OptionsPanel';
import ResultsTable from './components/ResultsTable';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useAppStore } from './stores/app-store';
import { mockFighters } from './data/mockData';
import { calculatePunishOptions } from './services/calculationService';
import type { PunishResult } from './types/frameData';

function App() {
  const {
    attackingFighter,
    defendingFighters,
    selectedMove,
    calculationOptions,
    setFightersData,
  } = useAppStore();
  
  const [calculationResults, setCalculationResults] = useState<PunishResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // モックデータの初期化
  useEffect(() => {
    try {
      setFightersData({
        data: mockFighters,
        loading: false,
        error: null,
        lastFetch: Date.now(),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize fighter data:', error);
      setFightersData({
        data: [],
        loading: false,
        error: 'キャラクターデータの初期化に失敗しました',
        lastFetch: Date.now(),
      });
    }
  }, [setFightersData]);

  // 計算実行
  const handleCalculate = async () => {
    if (!attackingFighter || !selectedMove || defendingFighters.length === 0) {
      setCalculationError('攻撃側キャラクター、技、防御側キャラクターを全て選択してください');
      return;
    }

    setIsCalculating(true);
    setCalculationError(null);

    try {
      const results = await calculatePunishOptions({
        attackingFighter,
        attackMove: selectedMove,
        defendingFighters,
        options: calculationOptions,
      });
      setCalculationResults(results);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Calculation failed:', error);
      setCalculationError('計算中にエラーが発生しました');
    } finally {
      setIsCalculating(false);
    }
  };

  const canCalculate = attackingFighter && selectedMove && defendingFighters.length > 0;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm animate-slideInDown">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 py-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LagScope
            </h1>
            <p className="text-gray-600 pb-4">
              大乱闘スマッシュブラザーズ SPECIALの確定反撃算出ツール
            </p>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
          {/* キャラクター選択セクション */}
          <section className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:shadow-lg animate-slideInUp">
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

          {/* 技選択セクション */}
          <section className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:shadow-lg animate-slideInUp" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-xl font-semibold mb-6">技選択</h2>
            <MoveSelector 
              selectedFighter={attackingFighter}
              className="w-full"
            />
          </section>

          {/* 計算オプション */}
          <div className="animate-slideInUp" style={{ animationDelay: '0.2s' }}>
            <OptionsPanel className="w-full transform transition-all duration-300 hover:shadow-lg" />
          </div>

          {/* 計算実行ボタン */}
          <section className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:shadow-lg animate-slideInUp" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={handleCalculate}
                disabled={!canCalculate || isCalculating}
                className={`
                  px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform
                  ${
                    canCalculate && !isCalculating
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                      : 'bg-gray-400 cursor-not-allowed'
                  }
                `}
                aria-label="確定反撃を計算"
              >
                {isCalculating ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>計算中...</span>
                  </div>
                ) : (
                  '確定反撃を計算'
                )}
              </button>
              
              {!canCalculate && (
                <p className="text-sm text-gray-500 text-center">
                  攻撃側キャラクター、技、防御側キャラクターを選択してください
                </p>
              )}
              
              {calculationError && (
                <p className="text-sm text-red-600 text-center">
                  {calculationError}
                </p>
              )}
            </div>
          </section>

          {/* 計算結果 */}
          <div className="animate-slideInUp" style={{ animationDelay: '0.4s' }}>
            <ResultsTable 
              results={calculationResults}
              className="w-full transform transition-all duration-300 hover:shadow-lg"
            />
          </div>

          {/* 選択状態の表示 */}
          <section className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:shadow-lg animate-slideInUp" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-xl font-semibold mb-4">現在の選択状態</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">攻撃側：</span>
                <span className="ml-2">{attackingFighter?.displayName || '未選択'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">技：</span>
                <span className="ml-2">{selectedMove?.displayName || '未選択'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">防御側：</span>
                <span className="ml-2">
                  {defendingFighters.length > 0 
                    ? defendingFighters.map(f => f.displayName).join(', ') 
                    : '未選択'
                  }
                </span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;