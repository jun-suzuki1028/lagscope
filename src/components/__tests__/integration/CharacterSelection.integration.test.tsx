import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CharacterSelector } from '../../CharacterSelector';
import { CharacterGrid } from '../../CharacterGrid';
import { CharacterCard } from '../../CharacterCard';
import { Fighter } from '../../../types/frameData';

// Mock the character icon mapping utility
vi.mock('../../../utils/characterIconMapping', () => ({
  getCharacterIconUrl: vi.fn((id: string) => `/lagscope/icons/fighters/${id}.png`),
}));

const mockFighters: Fighter[] = [
  {
    id: 'mario',
    name: 'mario',
    displayName: 'マリオ',
    series: 'Super Mario',
    weight: 98,
    fallSpeed: 1.8,
    fastFallSpeed: 2.88,
    gravity: 0.087,
    walkSpeed: 1.1,
    runSpeed: 1.76,
    airSpeed: 1.208,
    iconUrl: '/icons/mario.png',
    moves: [],
    shieldData: {
      shieldHealth: 50,
      shieldRegen: 0.07,
      shieldRegenDelay: 30,
      shieldStun: 0.8665,
      shieldReleaseFrames: 11,
      shieldGrabFrames: 6,
      outOfShieldOptions: []
    },
    movementData: {
      jumpSquat: 3,
      fullHopHeight: 34.65,
      shortHopHeight: 16.74,
      airJumps: 1,
      dodgeFrames: {
        spotDodge: { startup: 3, active: 20, recovery: 4, total: 27 },
        airDodge: { startup: 3, active: 29, recovery: 28, total: 60 }
      },
      rollFrames: {
        forward: { startup: 4, active: 12, recovery: 15, total: 31 },
        backward: { startup: 4, active: 12, recovery: 15, total: 31 }
      }
    }
  },
  {
    id: 'link',
    name: 'link',
    displayName: 'リンク',
    series: 'The Legend of Zelda',
    weight: 104,
    fallSpeed: 1.6,
    fastFallSpeed: 2.56,
    gravity: 0.096,
    walkSpeed: 1.247,
    runSpeed: 1.534,
    airSpeed: 1.155,
    iconUrl: '/icons/link.png',
    moves: [],
    shieldData: {
      shieldHealth: 50,
      shieldRegen: 0.07,
      shieldRegenDelay: 30,
      shieldStun: 0.8665,
      shieldReleaseFrames: 11,
      shieldGrabFrames: 6,
      outOfShieldOptions: []
    },
    movementData: {
      jumpSquat: 3,
      fullHopHeight: 31.17,
      shortHopHeight: 15.05,
      airJumps: 1,
      dodgeFrames: {
        spotDodge: { startup: 3, active: 20, recovery: 4, total: 27 },
        airDodge: { startup: 3, active: 29, recovery: 28, total: 60 }
      },
      rollFrames: {
        forward: { startup: 4, active: 12, recovery: 15, total: 31 },
        backward: { startup: 4, active: 12, recovery: 15, total: 31 }
      }
    }
  },
  {
    id: 'pikachu',
    name: 'pikachu',
    displayName: 'ピカチュウ',
    series: 'Pokémon',
    weight: 79,
    fallSpeed: 1.55,
    fastFallSpeed: 2.48,
    gravity: 0.095,
    walkSpeed: 1.302,
    runSpeed: 2.039,
    airSpeed: 1.0,
    iconUrl: '/icons/pikachu.png',
    moves: [],
    shieldData: {
      shieldHealth: 50,
      shieldRegen: 0.07,
      shieldRegenDelay: 30,
      shieldStun: 0.8665,
      shieldReleaseFrames: 11,
      shieldGrabFrames: 6,
      outOfShieldOptions: []
    },
    movementData: {
      jumpSquat: 3,
      fullHopHeight: 36.59,
      shortHopHeight: 17.67,
      airJumps: 1,
      dodgeFrames: {
        spotDodge: { startup: 3, active: 20, recovery: 4, total: 27 },
        airDodge: { startup: 3, active: 29, recovery: 28, total: 60 }
      },
      rollFrames: {
        forward: { startup: 4, active: 12, recovery: 15, total: 31 },
        backward: { startup: 4, active: 12, recovery: 15, total: 31 }
      }
    }
  }
];

// Mock store
const mockStore = {
  fightersData: {
    loading: false,
    error: null,
    data: mockFighters
  },
  attackingFighter: null,
  defendingFighter: null,
  setAttackingFighter: vi.fn(),
  setDefendingFighter: vi.fn(),
};

vi.mock('../../../stores/app-store', () => ({
  useAppStore: () => mockStore,
}));

vi.mock('../../../hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

describe('キャラクター選択統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.attackingFighter = null;
    mockStore.defendingFighter = null;
  });

  // モーダルを開く共通のヘルパー関数
  const openModal = async (user: any) => {
    const modalButton = screen.getByRole('button', { name: 'キャラクター選択モーダルを開く' });
    await user.click(modalButton);
    // モーダルが開くまで待機
    await screen.findByRole('dialog');
  };

  describe('基本的なキャラクター選択フロー', () => {
    it('攻撃側キャラクターを選択し、ストアが更新される', async () => {
      const user = userEvent.setup();
      
      render(<CharacterSelector type="attacker" />);
      
      // モーダルを開く
      await openModal(user);
      
      // マリオのキャラクターカードを探してクリック（モーダル内で）
      const marioCard = screen.getByRole('button', { name: /マリオ/ });
      await user.click(marioCard);
      
      expect(mockStore.setAttackingFighter).toHaveBeenCalledWith(mockFighters[0]);
    });

    it('防御側キャラクターを選択し、ストアが更新される', async () => {
      const user = userEvent.setup();
      
      render(<CharacterSelector type="defender" />);
      
      // モーダルを開く
      await openModal(user);
      
      // マリオを選択
      const marioCard = screen.getByRole('button', { name: /マリオ/ });
      await user.click(marioCard);
      
      expect(mockStore.setDefendingFighter).toHaveBeenCalledWith(mockFighters[0]);
    });

    it('選択解除が機能する', async () => {
      const user = userEvent.setup();
      
      // 既に選択されている状態をセット
      mockStore.defendingFighter = mockFighters[0];
      
      render(<CharacterSelector type="defender" />);
      
      // 選択をクリアボタンをクリック
      const clearButton = screen.getByRole('button', { name: '選択をクリア' });
      await user.click(clearButton);
      
      expect(mockStore.setDefendingFighter).toHaveBeenCalledWith(null);
    });
  });

  describe('検索機能', () => {
    it('検索語でキャラクターをフィルタリングする', async () => {
      const user = userEvent.setup();
      
      render(<CharacterSelector type="attacker" />);
      
      // モーダルを開く
      await openModal(user);
      
      // 検索入力（モーダル内の検索ボックス）
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'マリオ');
      
      // マリオのみ表示されることを確認
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /マリオ/ })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /リンク/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /ピカチュウ/ })).not.toBeInTheDocument();
      });
    });

    it('検索語をクリアする', async () => {
      const user = userEvent.setup();
      
      render(<CharacterSelector type="attacker" />);
      
      // モーダルを開く
      await openModal(user);
      
      // 検索入力
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'マリオ');
      
      // 検索欄をクリアする
      await user.clear(searchInput);
      
      // 全てのキャラクターが表示されることを確認
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /マリオ/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /リンク/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ピカチュウ/ })).toBeInTheDocument();
      });
    });

    it('シリーズ名でも検索できる', async () => {
      const user = userEvent.setup();
      
      render(<CharacterSelector type="attacker" />);
      
      // モーダルを開く
      await openModal(user);
      
      // シリーズ名で検索
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'Pokémon');
      
      // ピカチュウのみ表示されることを確認
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /ピカチュウ/ })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /マリオ/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /リンク/ })).not.toBeInTheDocument();
      });
    });
  });

  describe('選択状態の表示', () => {
    it('選択されたキャラクターが表示される', () => {
      mockStore.defendingFighter = mockFighters[0];
      
      render(<CharacterSelector type="defender" />);
      
      expect(screen.getByText('マリオ')).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === '防御側キャラクター - 選択済み';
      })).toBeInTheDocument();
    });

    it('選択クリアボタンが表示される', () => {
      mockStore.attackingFighter = mockFighters[0];
      
      render(<CharacterSelector type="attacker" />);
      
      expect(screen.getByRole('button', { name: '選択をクリア' })).toBeInTheDocument();
    });

    it('選択クリアボタンが機能する', async () => {
      const user = userEvent.setup();
      mockStore.attackingFighter = mockFighters[0];
      
      render(<CharacterSelector type="attacker" />);
      
      const clearButton = screen.getByRole('button', { name: '選択をクリア' });
      await user.click(clearButton);
      
      expect(mockStore.setAttackingFighter).toHaveBeenCalledWith(null);
    });
  });

  describe('キーボードナビゲーション', () => {
    it('Enterキーでキャラクターを選択できる', async () => {
      const user = userEvent.setup();
      
      render(<CharacterSelector type="attacker" />);
      
      // モーダルを開く
      await openModal(user);
      
      // マリオのカードにフォーカス
      const marioCard = screen.getByRole('button', { name: /マリオ/ });
      marioCard.focus();
      
      // Enterキーを押す
      await user.keyboard('{Enter}');
      
      expect(mockStore.setAttackingFighter).toHaveBeenCalledWith(mockFighters[0]);
    });

    it('スペースキーでキャラクターを選択できる', async () => {
      const user = userEvent.setup();
      
      render(<CharacterSelector type="attacker" />);
      
      // モーダルを開く
      await openModal(user);
      
      // マリオのカードにフォーカス
      const marioCard = screen.getByRole('button', { name: /マリオ/ });
      marioCard.focus();
      
      // スペースキーを押す
      await user.keyboard(' ');
      
      expect(mockStore.setAttackingFighter).toHaveBeenCalledWith(mockFighters[0]);
    });
  });

  describe('ローディング状態', () => {
    it('ローディング中はスケルトンスクリーンを表示する', () => {
      mockStore.fightersData.loading = true;
      mockStore.fightersData.data = [];
      
      render(<CharacterSelector type="attacker" />);
      
      expect(screen.getByText('キャラクターデータを読み込み中...')).toBeInTheDocument();
    });
  });

  describe('エラー状態', () => {
    it('エラー時はエラーメッセージを表示する', () => {
      mockStore.fightersData.loading = false;
      mockStore.fightersData.error = 'データの読み込みに失敗しました';
      mockStore.fightersData.data = [];
      
      render(<CharacterSelector type="attacker" />);
      
      expect(screen.getByText('キャラクターデータの読み込みエラー')).toBeInTheDocument();
    });
  });

  describe('レスポンシブ動作', () => {
    it('モバイル表示でモーダルボタンが表示される', () => {
      // モバイル画面サイズをシミュレート
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      // 正常状態をセット（エラー状態をクリア）
      mockStore.fightersData.loading = false;
      mockStore.fightersData.error = null;
      mockStore.fightersData.data = mockFighters;
      
      render(<CharacterSelector type="attacker" />);
      
      expect(screen.getByRole('button', { name: 'キャラクター選択モーダルを開く' })).toBeInTheDocument();
    });
  });

  describe('統合されたコンポーネント動作', () => {
    it('CharacterGrid内のCharacterCardが正しく動作する', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterGrid
          fighters={mockFighters}
          selectedFighterIds={[]}
          onFighterSelect={(fighter) => mockStore.setAttackingFighter(fighter)}
          multiSelect={false}
        />
      );
      
      // マリオのカードをクリック
      const marioCard = screen.getByRole('button', { name: /マリオ/ });
      await user.click(marioCard);
      
      expect(mockStore.setAttackingFighter).toHaveBeenCalledWith(mockFighters[0]);
    });

    it('選択状態がCharacterCardに正しく反映される', () => {
      render(
        <CharacterCard
          fighter={mockFighters[0]}
          isSelected={true}
          onSelect={() => {}}
          multiSelect={false}
        />
      );
      
      const card = screen.getByRole('button', { name: /マリオ/ });
      expect(card).toHaveAttribute('aria-pressed', 'true');
    });
  });
});