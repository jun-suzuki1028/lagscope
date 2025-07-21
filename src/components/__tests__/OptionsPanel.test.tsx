import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OptionsPanel from '../OptionsPanel';
import { useAppStore } from '../../stores/app-store';

// Zustandストアをモック
vi.mock('../../stores/app-store', () => ({
  useAppStore: vi.fn(),
}));

describe('OptionsPanel', () => {
  const mockSetCalculationOptions = vi.fn();
  const mockCalculationOptions = {
    staleness: 'fresh' as const,
    rangeFilter: ['close', 'mid', 'far'] as const,
    minimumFrameAdvantage: 0,
    maximumFrameAdvantage: 999,
    minimumDamage: 0,
    onlyGuaranteed: false,
    includeKillMoves: true,
    includeDIOptions: false,
    includeSDIOptions: false,
    positionFilter: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue({
      calculationOptions: mockCalculationOptions,
      setCalculationOptions: mockSetCalculationOptions,
    });
  });

  it('オプションパネルを正常にレンダリングする', () => {
    render(<OptionsPanel />);
    
    expect(screen.getByText('計算オプション')).toBeInTheDocument();
    expect(screen.getByText('ワンパターン相殺')).toBeInTheDocument();
    expect(screen.getByText('距離フィルター')).toBeInTheDocument();
    expect(screen.getByText('ガード行動について')).toBeInTheDocument();
    expect(screen.getByText('フィルタリング設定')).toBeInTheDocument();
    expect(screen.getByText('数値フィルター')).toBeInTheDocument();
  });

  it('ワンパターン相殺の選択が正常に動作する', () => {
    render(<OptionsPanel />);
    
    const stalenessSelect = screen.getByDisplayValue('フレッシュ');
    fireEvent.change(stalenessSelect, { target: { value: 'stale1' } });
    
    expect(mockSetCalculationOptions).toHaveBeenCalledWith({
      staleness: 'stale1',
    });
  });

  it('距離フィルターのチェックボックスが正常に動作する', () => {
    render(<OptionsPanel />);
    
    const closeRangeCheckbox = screen.getByLabelText('短距離');
    fireEvent.click(closeRangeCheckbox);
    
    expect(mockSetCalculationOptions).toHaveBeenCalledWith({
      rangeFilter: ['mid', 'far'],
    });
  });

  it('ガード行動について説明文が表示される', () => {
    render(<OptionsPanel />);
    
    expect(screen.getByText('ガード行動について')).toBeInTheDocument();
    expect(screen.getByText('計算結果には以下の2つのパターンが自動的に含まれます：')).toBeInTheDocument();
    expect(screen.getByText(/ガードキャンセル/)).toBeInTheDocument();
    expect(screen.getByText(/ガード解除/)).toBeInTheDocument();
  });

  it('フィルタリング設定のチェックボックスが正常に動作する', () => {
    render(<OptionsPanel />);
    
    const onlyGuaranteedCheckbox = screen.getByLabelText('確定のみ表示');
    fireEvent.click(onlyGuaranteedCheckbox);
    
    expect(mockSetCalculationOptions).toHaveBeenCalledWith({
      onlyGuaranteed: true,
    });
  });

  it('数値フィルターの入力が正常に動作する', () => {
    render(<OptionsPanel />);
    
    const minFrameAdvantageInput = screen.getByRole('spinbutton', { name: '最小フレーム有利' });
    fireEvent.change(minFrameAdvantageInput, { target: { value: '5' } });
    
    expect(mockSetCalculationOptions).toHaveBeenCalledWith({
      minimumFrameAdvantage: 5,
    });
  });

  it('リセットボタンが正常に動作する', () => {
    render(<OptionsPanel />);
    
    const resetButton = screen.getByRole('button', { name: 'リセット' });
    fireEvent.click(resetButton);
    
    expect(mockSetCalculationOptions).toHaveBeenCalledWith({
      staleness: 'fresh',
      rangeFilter: ['close', 'mid', 'far'],
      minimumFrameAdvantage: 0,
      maximumFrameAdvantage: 999,
      minimumDamage: 0,
      onlyGuaranteed: false,
      includeKillMoves: true,
      includeDIOptions: false,
      includeSDIOptions: false,
      positionFilter: [],
    });
  });

  it('カスタムクラス名が適用される', () => {
    const customClass = 'custom-class';
    render(<OptionsPanel className={customClass} />);
    
    const panel = screen.getByText('計算オプション').closest('div');
    expect(panel).toHaveClass(customClass);
  });

  it('距離フィルターのチェックボックスが現在の状態を反映する', () => {
    render(<OptionsPanel />);
    
    const closeRangeCheckbox = screen.getByLabelText('短距離');
    const midRangeCheckbox = screen.getByLabelText('中距離');
    const farRangeCheckbox = screen.getByLabelText('長距離');
    const projectileCheckbox = screen.getByLabelText('飛び道具');
    
    expect(closeRangeCheckbox).toBeChecked();
    expect(midRangeCheckbox).toBeChecked();
    expect(farRangeCheckbox).toBeChecked();
    expect(projectileCheckbox).not.toBeChecked();
  });

  it('フィルタリング設定のチェックボックスが現在の状態を反映する', () => {
    render(<OptionsPanel />);
    
    const onlyGuaranteedCheckbox = screen.getByLabelText('確定のみ表示');
    const includeKillMovesCheckbox = screen.getByLabelText('撃墜技を含める');
    const includeDIOptionsCheckbox = screen.getByLabelText('DIオプションを含める');
    const includeSDIOptionsCheckbox = screen.getByLabelText('SDIオプションを含める');
    
    expect(onlyGuaranteedCheckbox).not.toBeChecked();
    expect(includeKillMovesCheckbox).toBeChecked();
    expect(includeDIOptionsCheckbox).not.toBeChecked();
    expect(includeSDIOptionsCheckbox).not.toBeChecked();
  });
});