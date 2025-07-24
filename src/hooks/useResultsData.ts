import { useState, useMemo, useCallback } from 'react';
import type { PunishResult, PunishMove, SortOption, SortConfig, FilterConfig } from '@/types/frameData';

export interface FlattenedResult {
  result: PunishResult;
  move: PunishMove;
  key: string;
}

/**
 * 結果データのソート・フィルタリング処理を管理するカスタムフック
 * 
 * @param results - 処理対象の結果データ
 * @returns ソート・フィルタリング済みデータとその操作関数
 */
export function useResultsData(results: PunishResult[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    option: 'damage', 
    direction: 'desc' 
  });
  
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    guaranteed: false,
    killMoves: false,
    moveType: 'all',
    minDamage: 0,
    maxDamage: 999,
  });

  // 結果データを平坦化（フラット化）
  const flattenedResults = useMemo((): FlattenedResult[] => {
    const flattened: FlattenedResult[] = [];

    results.forEach(result => {
      result.punishingMoves.forEach(move => {
        flattened.push({
          result,
          move,
          key: `${result.defendingFighter.id}-${move.move.id}-${move.method}`,
        });
      });
    });

    return flattened;
  }, [results]);

  // フィルタリング処理
  const filteredResults = useMemo(() => {
    return flattenedResults.filter(({ move }) => {
      if (filterConfig.guaranteed && !move.isGuaranteed) return false;
      if (filterConfig.killMoves && !move.move.properties.isKillMove) return false;
      if (filterConfig.moveType !== 'all' && move.move.type !== filterConfig.moveType) return false;
      if (move.damage < filterConfig.minDamage || move.damage > filterConfig.maxDamage) return false;
      return true;
    });
  }, [flattenedResults, filterConfig]);

  // ソート処理
  const sortedResults = useMemo(() => {
    return [...filteredResults].sort((a, b) => {
      const { option, direction } = sortConfig;
      let aValue: number | string;
      let bValue: number | string;

      switch (option) {
        case 'name':
          aValue = a.move.move.displayName;
          bValue = b.move.move.displayName;
          break;
        case 'damage':
          aValue = a.move.damage;
          bValue = b.move.damage;
          break;
        case 'startup':
          aValue = a.move.move.startup;
          bValue = b.move.move.startup;
          break;
        case 'recovery':
          aValue = a.move.move.recovery;
          bValue = b.move.move.recovery;
          break;
        case 'total':
          aValue = a.move.totalFrames;
          bValue = b.move.totalFrames;
          break;
        case 'killPercent':
          aValue = a.move.killPercent || 999;
          bValue = b.move.killPercent || 999;
          break;
        default:
          aValue = a.move.damage;
          bValue = b.move.damage;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return direction === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });
  }, [filteredResults, sortConfig]);

  // ソート設定を変更 - 子コンポーネントに渡すため、useCallbackが必要
  const handleSort = useCallback((option: SortOption) => {
    setSortConfig(prev => ({
      option,
      direction: prev.option === option && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // フィルター設定を変更 - 子コンポーネントに渡すため、useCallbackが必要
  const handleFilterChange = useCallback((key: keyof FilterConfig, value: string | boolean | number) => {
    setFilterConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // ソートアイコンを取得 - 依存配列があり、頻繁に呼ばれる可能性があるため保持
  const getSortIcon = useCallback((option: SortOption) => {
    if (sortConfig.option !== option) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  }, [sortConfig]);

  return {
    processedData: sortedResults,
    sortConfig,
    filterConfig,
    handleSort,
    handleFilterChange,
    getSortIcon,
    totalCount: flattenedResults.length,
    filteredCount: filteredResults.length,
  };
}