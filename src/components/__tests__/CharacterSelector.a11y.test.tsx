import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CharacterSelector } from '../CharacterSelector';

expect.extend(toHaveNoViolations);

const mockFightersData = {
  loading: false,
  error: null,
  data: [
    {
      id: 'mario',
      name: 'mario',
      displayName: 'マリオ',
      series: 'Super Mario',
      iconUrl: '/icons/mario.png',
      moves: [],
    },
    {
      id: 'link',
      name: 'link',
      displayName: 'リンク',
      series: 'The Legend of Zelda',
      iconUrl: '/icons/link.png',
      moves: [],
    },
  ],
};

vi.mock('../stores/app-store', () => ({
  useAppStore: () => ({
    fightersData: mockFightersData,
    attackingFighter: null,
    defendingFighters: [],
    setAttackingFighter: vi.fn(),
    addDefendingFighter: vi.fn(),
    removeDefendingFighter: vi.fn(),
  }),
}));

describe('CharacterSelector アクセシビリティテスト', () => {
  it('アクセシビリティ違反がない (攻撃側)', async () => {
    const { container } = render(
      <CharacterSelector type="attacker" />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('アクセシビリティ違反がない (防御側・複数選択)', async () => {
    const { container } = render(
      <CharacterSelector type="defender" multiSelect />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ローディング状態でアクセシビリティ違反がない', async () => {
    vi.mocked(useAppStore).mockReturnValue({
      fightersData: { loading: true, error: null, data: [] },
      attackingFighter: null,
      defendingFighters: [],
      setAttackingFighter: vi.fn(),
      addDefendingFighter: vi.fn(),
      removeDefendingFighter: vi.fn(),
    });

    const { container } = render(
      <CharacterSelector type="attacker" />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('エラー状態でアクセシビリティ違反がない', async () => {
    vi.mocked(useAppStore).mockReturnValue({
      fightersData: { loading: false, error: 'テストエラー', data: [] },
      attackingFighter: null,
      defendingFighters: [],
      setAttackingFighter: vi.fn(),
      addDefendingFighter: vi.fn(),
      removeDefendingFighter: vi.fn(),
    });

    const { container } = render(
      <CharacterSelector type="attacker" />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('適切なARIA属性が設定されている', () => {
    render(<CharacterSelector type="attacker" />);

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveAttribute('aria-label', 'キャラクター検索');
    expect(searchInput).toHaveAttribute('aria-autocomplete', 'list');

    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
  });

  it('キーボードナビゲーションが適切に動作する', () => {
    render(<CharacterSelector type="attacker" />);

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveAttribute('tabIndex', '0');

    const clearButton = screen.queryByLabelText('検索をクリア');
    if (clearButton) {
      expect(clearButton).toHaveAttribute('tabIndex', '0');
    }
  });
});