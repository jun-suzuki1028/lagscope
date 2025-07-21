import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { CharacterSelector } from './components/CharacterSelector';
import { MoveSelector } from './components/MoveSelector';
import OptionsPanel from './components/OptionsPanel';
import ResultsTable from './components/ResultsTable';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CalculationStatus } from './components/CalculationStatus';
import { SelectionStatus } from './components/SelectionStatus';
import { useAppStore } from './stores/app-store';
import { useDebounce } from './hooks/useDebounce';
import { mockFighters } from './data/mockData';
import { calculatePunishOptions } from './services/calculationService';
import type { PunishResult } from './types/frameData';

const App = memo(() => {
  const {
    attackingFighter,
    defendingFighter,
    selectedMove,
    calculationOptions,
    setFightersData,
  } = useAppStore();
  
  const [calculationResults, setCalculationResults] = useState<PunishResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // オプション変更のデバウンス処理 - useMemo で最適化
  const debouncedCalculationOptions = useDebounce(calculationOptions, 500);
  
  // 計算の完了状態をメモ化
  const hasCompleteSelection = useMemo(() => 
    Boolean(attackingFighter && selectedMove && defendingFighter),
    [attackingFighter, selectedMove, defendingFighter]
  );

  // 生成されたフレームデータの読み込み - useCallback で最適化
  const loadFighterData = useCallback(async () => {
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
  }, [setFightersData]);
  
  useEffect(() => {
    loadFighterData();
  }, [loadFighterData]);

  // 自動計算実行 - 依存関係を最適化
  const performCalculation = useCallback(async () => {
    if (!hasCompleteSelection || !attackingFighter || !selectedMove || !defendingFighter) {
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
        defendingFighters: [defendingFighter],
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
  }, [hasCompleteSelection, attackingFighter, selectedMove, defendingFighter, debouncedCalculationOptions]);

  // 技選択やオプション変更時の自動計算
  useEffect(() => {
    performCalculation();
  }, [performCalculation]);



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
        
        <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8 animate-fadeIn">
          {/* キャラクター選択セクション */}
          <section className="bg-white rounded-lg shadow p-3 sm:p-6 transform transition-all duration-300 hover:shadow-lg animate-slideInUp">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">キャラクター選択</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              <div>
                <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">攻撃側キャラクター</h3>
                <CharacterSelector type="attacker" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">防御側キャラクター</h3>
                <CharacterSelector type="defender" />
              </div>
            </div>
          </section>

          {/* 技選択セクション */}
          <section className="bg-white rounded-lg shadow p-3 sm:p-6 transform transition-all duration-300 hover:shadow-lg animate-slideInUp" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">技選択</h2>
            <MoveSelector 
              selectedFighter={attackingFighter}
              className="w-full"
            />
          </section>

          {/* 計算オプション */}
          <div className="animate-slideInUp" style={{ animationDelay: '0.2s' }}>
            <OptionsPanel className="w-full transform transition-all duration-300 hover:shadow-lg" />
          </div>

          {/* 計算状態表示 - メモ化されたコンポーネント */}
          <CalculationStatus 
            isCalculating={isCalculating}
            hasCompleteSelection={hasCompleteSelection}
            calculationResults={calculationResults}
            calculationError={calculationError}
          />

          {/* 計算結果 */}
          {(hasCompleteSelection || calculationResults.length > 0) && (
            <div className="animate-slideInUp" style={{ animationDelay: '0.4s' }}>
              <ResultsTable 
                results={calculationResults}
                className="w-full transform transition-all duration-300 hover:shadow-lg"
              />
            </div>
          )}

          {/* 選択状態の表示 - メモ化されたコンポーネント */}
          <SelectionStatus
            attackingFighter={attackingFighter}
            selectedMove={selectedMove}
            defendingFighter={defendingFighter}
          />
        </main>
      </div>
    </ErrorBoundary>
  );
});

export default App;