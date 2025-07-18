import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MovePreview } from '../MovePreview';
import { Move } from '../../types/frameData';

const mockMove: Move = {
  id: 'mario-utilt',
  name: 'Up Tilt',
  displayName: '上強攻撃',
  category: 'tilt',
  type: 'normal',
  input: '上+A',
  startup: 5,
  active: 5,
  recovery: 10,
  totalFrames: 20,
  onShield: -8,
  onHit: 5,
  onWhiff: -8,
  damage: 5.5,
  baseKnockback: 50,
  knockbackGrowth: 120,
  range: 'close',
  hitboxData: {
    hitboxes: [
      {
        id: 1,
        damage: 5.5,
        angle: 90,
        baseKnockback: 50,
        knockbackGrowth: 120,
        hitboxType: 'normal',
        effect: 'normal',
        size: 4.5,
        position: { x: 0, y: 8, z: 0 },
      },
    ],
    multihit: false,
  },
  properties: {
    isKillMove: true,
    killPercent: 160,
    hasArmor: false,
    isCommandGrab: false,
    isSpike: false,
    isMeteor: false,
    hasInvincibility: false,
    hasIntangibility: false,
    canClank: true,
    priority: 1,
    transcendentPriority: false,
  },
  notes: 'コンボ始動技として優秀',
};

describe('MovePreview', () => {
  it('shows placeholder when no move is selected', () => {
    render(<MovePreview move={null} />);
    expect(screen.getByText('技を選択してください')).toBeInTheDocument();
  });

  it('displays move name and input', () => {
    render(<MovePreview move={mockMove} />);
    expect(screen.getByText('上強攻撃')).toBeInTheDocument();
    expect(screen.getByText('上+A')).toBeInTheDocument();
  });

  it('displays frame data correctly', () => {
    render(<MovePreview move={mockMove} />);
    expect(screen.getByText('5F')).toBeInTheDocument(); // startup
    expect(screen.getByText('5F')).toBeInTheDocument(); // active
    expect(screen.getByText('10F')).toBeInTheDocument(); // recovery
    expect(screen.getByText('20F')).toBeInTheDocument(); // total
  });

  it('displays damage and advantage data', () => {
    render(<MovePreview move={mockMove} />);
    expect(screen.getByText('5.5%')).toBeInTheDocument(); // damage
    expect(screen.getByText('-8F')).toBeInTheDocument(); // on shield
    expect(screen.getByText('+5F')).toBeInTheDocument(); // on hit
  });

  it('displays knockback data', () => {
    render(<MovePreview move={mockMove} />);
    expect(screen.getByText('50')).toBeInTheDocument(); // base knockback
    expect(screen.getByText('120')).toBeInTheDocument(); // knockback growth
  });

  it('shows kill move badge with percent', () => {
    render(<MovePreview move={mockMove} />);
    expect(screen.getByText('撃墜技 (160%)')).toBeInTheDocument();
  });

  it('displays category badge', () => {
    render(<MovePreview move={mockMove} />);
    expect(screen.getByText('ティルト')).toBeInTheDocument();
  });

  it('displays range badge', () => {
    render(<MovePreview move={mockMove} />);
    expect(screen.getByText('近距離')).toBeInTheDocument();
  });

  it('shows hitbox information', () => {
    render(<MovePreview move={mockMove} />);
    expect(screen.getByText('ヒットボックス情報')).toBeInTheDocument();
    expect(screen.getByText(/ヒットボックス 1:/)).toBeInTheDocument();
    expect(screen.getByText(/ダメージ 5.5%/)).toBeInTheDocument();
    expect(screen.getByText(/角度 90°/)).toBeInTheDocument();
    expect(screen.getByText(/KB 50\/120/)).toBeInTheDocument();
  });

  it('displays notes when present', () => {
    render(<MovePreview move={mockMove} />);
    expect(screen.getByText('備考')).toBeInTheDocument();
    expect(screen.getByText('コンボ始動技として優秀')).toBeInTheDocument();
  });

  it('handles array damage correctly', () => {
    const moveWithArrayDamage = {
      ...mockMove,
      damage: [5.5, 7.0, 8.5],
    };
    render(<MovePreview move={moveWithArrayDamage} />);
    expect(screen.getByText('5.5-7-8.5%')).toBeInTheDocument();
  });

  it('shows armor property when present', () => {
    const moveWithArmor = {
      ...mockMove,
      properties: {
        ...mockMove.properties,
        hasArmor: true,
        armorThreshold: 10,
      },
    };
    render(<MovePreview move={moveWithArmor} />);
    expect(screen.getByText('アーマー (10%)')).toBeInTheDocument();
  });

  it('shows command grab property when present', () => {
    const commandGrabMove = {
      ...mockMove,
      properties: {
        ...mockMove.properties,
        isCommandGrab: true,
      },
    };
    render(<MovePreview move={commandGrabMove} />);
    expect(screen.getByText('コマンドつかみ')).toBeInTheDocument();
  });

  it('shows spike property when present', () => {
    const spikeMove = {
      ...mockMove,
      properties: {
        ...mockMove.properties,
        isSpike: true,
      },
    };
    render(<MovePreview move={spikeMove} />);
    expect(screen.getByText('スパイク')).toBeInTheDocument();
  });

  it('shows meteor property when present', () => {
    const meteorMove = {
      ...mockMove,
      properties: {
        ...mockMove.properties,
        isMeteor: true,
      },
    };
    render(<MovePreview move={meteorMove} />);
    expect(screen.getByText('メテオ')).toBeInTheDocument();
  });

  it('shows invincibility property when present', () => {
    const invincibilityMove = {
      ...mockMove,
      properties: {
        ...mockMove.properties,
        hasInvincibility: true,
      },
    };
    render(<MovePreview move={invincibilityMove} />);
    expect(screen.getByText('無敵')).toBeInTheDocument();
  });

  it('shows intangibility property when present', () => {
    const intangibilityMove = {
      ...mockMove,
      properties: {
        ...mockMove.properties,
        hasIntangibility: true,
      },
    };
    render(<MovePreview move={intangibilityMove} />);
    expect(screen.getByText('無形')).toBeInTheDocument();
  });

  it('applies correct color coding to frame advantage', () => {
    const advantageMove = {
      ...mockMove,
      onShield: 5,
      onHit: -3,
    };
    render(<MovePreview move={advantageMove} />);
    
    // Should show positive advantage in green
    const shieldAdvantage = screen.getByText('+5F');
    expect(shieldAdvantage).toHaveClass('text-green-600');
    
    // Should show negative advantage in red
    const hitAdvantage = screen.getByText('-3F');
    expect(hitAdvantage).toHaveClass('text-red-600');
  });

  it('handles moves without hitboxes', () => {
    const moveWithoutHitboxes = {
      ...mockMove,
      hitboxData: {
        hitboxes: [],
        multihit: false,
      },
    };
    render(<MovePreview move={moveWithoutHitboxes} />);
    expect(screen.queryByText('ヒットボックス情報')).not.toBeInTheDocument();
  });

  it('handles moves without notes', () => {
    const moveWithoutNotes = {
      ...mockMove,
      notes: undefined,
    };
    render(<MovePreview move={moveWithoutNotes} />);
    expect(screen.queryByText('備考')).not.toBeInTheDocument();
  });

  it('handles moves with no special properties', () => {
    const basicMove = {
      ...mockMove,
      properties: {
        isKillMove: false,
        hasArmor: false,
        isCommandGrab: false,
        isSpike: false,
        isMeteor: false,
        hasInvincibility: false,
        hasIntangibility: false,
        canClank: true,
        priority: 1,
        transcendentPriority: false,
      },
    };
    render(<MovePreview move={basicMove} />);
    expect(screen.queryByText('撃墜技')).not.toBeInTheDocument();
    expect(screen.queryByText('アーマー')).not.toBeInTheDocument();
    expect(screen.queryByText('コマンドつかみ')).not.toBeInTheDocument();
  });
});