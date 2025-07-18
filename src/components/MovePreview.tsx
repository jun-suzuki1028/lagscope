import { Move } from '../types/frameData';

interface MovePreviewProps {
  move: Move | null;
  className?: string;
}

export function MovePreview({ move, className = '' }: MovePreviewProps) {
  if (!move) {
    return (
      <div className={`${className} p-4 border border-gray-200 rounded-lg bg-gray-50`}>
        <div className="text-center text-gray-500">
          技を選択してください
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} p-4 border border-gray-200 rounded-lg bg-white`}>
      <div className="space-y-4">
        <div className="border-b pb-3">
          <h3 className="text-lg font-semibold mb-2">{move.displayName}</h3>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {move.input}
            </span>
            <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {getCategoryLabel(move.category)}
            </span>
            <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {getRangeLabel(move.range)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FrameDataItem label="発生" value={`${move.startup}F`} />
          <FrameDataItem label="持続" value={`${move.active}F`} />
          <FrameDataItem label="硬直" value={`${move.recovery}F`} />
          <FrameDataItem label="全体" value={`${move.totalFrames}F`} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FrameDataItem 
            label="ダメージ" 
            value={Array.isArray(move.damage) ? `${move.damage.join('-')}%` : `${move.damage}%`}
          />
          <FrameDataItem 
            label="ガード硬直差" 
            value={`${move.onShield > 0 ? '+' : ''}${move.onShield}F`}
            valueColor={move.onShield > 0 ? 'text-green-600' : move.onShield < 0 ? 'text-red-600' : 'text-gray-600'}
          />
          <FrameDataItem 
            label="ヒット硬直差" 
            value={`${move.onHit > 0 ? '+' : ''}${move.onHit}F`}
            valueColor={move.onHit > 0 ? 'text-green-600' : move.onHit < 0 ? 'text-red-600' : 'text-gray-600'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FrameDataItem label="ベースKB" value={move.baseKnockback.toString()} />
          <FrameDataItem label="KB成長率" value={move.knockbackGrowth.toString()} />
        </div>

        {move.properties && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">特殊効果</h4>
            <div className="flex flex-wrap gap-2">
              {move.properties.isKillMove && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  撃墜技
                  {move.properties.killPercent && ` (${move.properties.killPercent}%)`}
                </span>
              )}
              {move.properties.hasArmor && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  アーマー
                  {move.properties.armorThreshold && ` (${move.properties.armorThreshold}%)`}
                </span>
              )}
              {move.properties.isCommandGrab && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  コマンドつかみ
                </span>
              )}
              {move.properties.isSpike && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  スパイク
                </span>
              )}
              {move.properties.isMeteor && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  メテオ
                </span>
              )}
              {move.properties.hasInvincibility && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  無敵
                </span>
              )}
              {move.properties.hasIntangibility && (
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                  無形
                </span>
              )}
            </div>
          </div>
        )}

        {move.hitboxData && move.hitboxData.hitboxes.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">ヒットボックス情報</h4>
            <div className="space-y-1">
              {move.hitboxData.hitboxes.map((hitbox, index) => (
                <div key={hitbox.id} className="text-xs bg-gray-50 p-2 rounded">
                  <span className="font-medium">ヒットボックス {index + 1}:</span>
                  <span className="ml-2">
                    ダメージ {hitbox.damage}% | 
                    角度 {hitbox.angle}° | 
                    KB {hitbox.baseKnockback}/{hitbox.knockbackGrowth}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {move.notes && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">備考</h4>
            <p className="text-sm text-gray-600">{move.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface FrameDataItemProps {
  label: string;
  value: string;
  valueColor?: string;
}

function FrameDataItem({ label, value, valueColor = 'text-gray-900' }: FrameDataItemProps) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-sm font-medium ${valueColor}`}>{value}</div>
    </div>
  );
}

function getCategoryLabel(category: string): string {
  const categoryLabels: Record<string, string> = {
    jab: 'ジャブ',
    tilt: 'ティルト',
    smash: 'スマッシュ',
    aerial: '空中攻撃',
    special: '必殺技',
    grab: 'つかみ',
    throw: '投げ',
    dodge: '回避',
    movement: '移動',
  };
  return categoryLabels[category] || category;
}

function getRangeLabel(range: string): string {
  const rangeLabels: Record<string, string> = {
    close: '近距離',
    mid: '中距離',
    far: '遠距離',
    projectile: '飛び道具',
  };
  return rangeLabels[range] || range;
}