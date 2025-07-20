import { useEffect, useState, useCallback } from 'react';
import { CharacterSelector } from './components/CharacterSelector';
import { MoveSelector } from './components/MoveSelector';
import OptionsPanel from './components/OptionsPanel';
import ResultsTable from './components/ResultsTable';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useAppStore } from './stores/app-store';
import { useDebounce } from './hooks/useDebounce';
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

  // オプション変更のデバウンス処理
  const debouncedCalculationOptions = useDebounce(calculationOptions, 500);

  // 生成されたフレームデータの読み込み
  useEffect(() => {
    const loadFighterData = async () => {
      setFightersData({
        data: [],
        loading: true,
        error: null,
        lastFetch: Date.now(),
      });

      try {
        // ベースパスを考慮したURL構築
        const baseUrl = import.meta.env.BASE_URL || '/';
        const dataUrl = `${baseUrl}data/all-fighters.json`.replace(/\/+/g, '/');
        
        // eslint-disable-next-line no-console
        console.log('Attempting to fetch data from:', dataUrl);
        
        const response = await fetch(dataUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText} - URL: ${dataUrl}`);
        }
        const fighters = await response.json();
        
        // データ検証
        if (!Array.isArray(fighters) || fighters.length === 0) {
          throw new Error('Invalid fighter data: expected non-empty array');
        }
        
        // eslint-disable-next-line no-console
        console.log(`Successfully loaded ${fighters.length} fighters`);
        
        setFightersData({
          data: fighters,
          loading: false,
          error: null,
          lastFetch: Date.now(),
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load fighter data:', error);
        // eslint-disable-next-line no-console
        console.warn('Falling back to mock data');
        
        // フォールバック: モックデータを使用
        setFightersData({
          data: mockFighters,
          loading: false,
          error: null,
          lastFetch: Date.now(),
        });
      }
    };

    loadFighterData();
  }, [setFightersData]);

  // 自動計算実行
  const performCalculation = useCallback(async () => {
    if (!attackingFighter || !selectedMove || defendingFighters.length === 0) {
      setCalculationResults([]);
      setCalculationError(null);
      return;
    }

    setIsCalculating(true);
    setCalculationError(null);

    try {
      const results = await calculatePunishOptions({
        attackingFighter,
        attackMove: selectedMove,
        defendingFighters,
        options: debouncedCalculationOptions,
      });
      setCalculationResults(results);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Auto calculation failed:', error);
      setCalculationError('計算中にエラーが発生しました');
      setCalculationResults([]);
    } finally {
      setIsCalculating(false);
    }
  }, [attackingFighter, selectedMove, defendingFighters, debouncedCalculationOptions]);

  // 技選択やオプション変更時の自動計算
  useEffect(() => {
    performCalculation();
  }, [performCalculation]);


  const hasCompleteSelection = attackingFighter && selectedMove && defendingFighters.length > 0;

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

          {/* 計算状態表示 */}
          <section className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:shadow-lg animate-slideInUp" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col items-center space-y-4">
              {isCalculating && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm font-medium">計算中...</span>
                </div>
              )}
              
              {!hasCompleteSelection && !isCalculating && (
                <p className="text-sm text-gray-500 text-center">
                  攻撃側キャラクター、技、防御側キャラクターを選択すると自動で計算されます
                </p>
              )}
              
              {hasCompleteSelection && !isCalculating && calculationResults.length === 0 && !calculationError && (
                <div className="text-center">
                  <div className="text-2xl mb-2">🤔</div>
                  <p className="text-sm text-gray-600">
                    条件に該当する確定反撃技が見つかりませんでした
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    オプション設定を調整してみてください
                  </p>
                </div>
              )}
              
              {calculationError && (
                <p className="text-sm text-red-600 text-center">
                  {calculationError}
                </p>
              )}
            </div>
          </section>

          {/* 計算結果 */}
          {(hasCompleteSelection || calculationResults.length > 0) && (
            <div className="animate-slideInUp" style={{ animationDelay: '0.4s' }}>
              <ResultsTable 
                results={calculationResults}
                className="w-full transform transition-all duration-300 hover:shadow-lg"
              />
            </div>
          )}

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