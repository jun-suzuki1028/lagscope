import { Fighter } from '../types/frameData';

export interface CharacterInfo {
  id: string;
  name: string;
  displayName: string;
  series: string;
  fighterNumber: number;
  echoFighter?: string;
  category: 'starter' | 'unlockable' | 'dlc';
  releaseDate?: string;
  dlcPack?: string;
}

/**
 * 大乱闘スマッシュブラザーズ SPECIAL 全キャラクター定義
 * ファイター番号順に配列
 */
export const ALL_CHARACTERS: CharacterInfo[] = [
  // オリジナル8ファイター
  { id: 'mario', name: 'mario', displayName: 'マリオ', series: 'Super Mario', fighterNumber: 1, category: 'starter' },
  { id: 'donkey_kong', name: 'donkey_kong', displayName: 'ドンキーコング', series: 'Donkey Kong', fighterNumber: 2, category: 'starter' },
  { id: 'link', name: 'link', displayName: 'リンク', series: 'The Legend of Zelda', fighterNumber: 3, category: 'starter' },
  { id: 'samus', name: 'samus', displayName: 'サムス', series: 'Metroid', fighterNumber: 4, category: 'starter' },
  { id: 'dark_samus', name: 'dark_samus', displayName: 'ダークサムス', series: 'Metroid', fighterNumber: 5, category: 'unlockable', echoFighter: 'samus' },
  { id: 'yoshi', name: 'yoshi', displayName: 'ヨッシー', series: 'Yoshi', fighterNumber: 6, category: 'starter' },
  { id: 'kirby', name: 'kirby', displayName: 'カービィ', series: 'Kirby', fighterNumber: 7, category: 'starter' },
  { id: 'fox', name: 'fox', displayName: 'フォックス', series: 'Star Fox', fighterNumber: 8, category: 'starter' },
  { id: 'pikachu', name: 'pikachu', displayName: 'ピカチュウ', series: 'Pokémon', fighterNumber: 9, category: 'starter' },
  
  // 64追加ファイター
  { id: 'luigi', name: 'luigi', displayName: 'ルイージ', series: 'Super Mario', fighterNumber: 10, category: 'unlockable' },
  { id: 'ness', name: 'ness', displayName: 'ネス', series: 'EarthBound', fighterNumber: 11, category: 'unlockable' },
  { id: 'captain_falcon', name: 'captain_falcon', displayName: 'キャプテン・ファルコン', series: 'F-Zero', fighterNumber: 12, category: 'unlockable' },
  { id: 'jigglypuff', name: 'jigglypuff', displayName: 'プリン', series: 'Pokémon', fighterNumber: 13, category: 'unlockable' },
  
  // DX追加ファイター
  { id: 'peach', name: 'peach', displayName: 'ピーチ', series: 'Super Mario', fighterNumber: 14, category: 'unlockable' },
  { id: 'daisy', name: 'daisy', displayName: 'デイジー', series: 'Super Mario', fighterNumber: 15, category: 'unlockable', echoFighter: 'peach' },
  { id: 'bowser', name: 'bowser', displayName: 'クッパ', series: 'Super Mario', fighterNumber: 16, category: 'unlockable' },
  { id: 'ice_climbers', name: 'ice_climbers', displayName: 'アイスクライマー', series: 'Ice Climber', fighterNumber: 17, category: 'unlockable' },
  { id: 'sheik', name: 'sheik', displayName: 'シーク', series: 'The Legend of Zelda', fighterNumber: 18, category: 'unlockable' },
  { id: 'zelda', name: 'zelda', displayName: 'ゼルダ', series: 'The Legend of Zelda', fighterNumber: 19, category: 'unlockable' },
  { id: 'dr_mario', name: 'dr_mario', displayName: 'Dr.マリオ', series: 'Super Mario', fighterNumber: 20, category: 'unlockable' },
  { id: 'pichu', name: 'pichu', displayName: 'ピチュー', series: 'Pokémon', fighterNumber: 21, category: 'unlockable' },
  { id: 'falco', name: 'falco', displayName: 'ファルコ', series: 'Star Fox', fighterNumber: 22, category: 'unlockable' },
  { id: 'marth', name: 'marth', displayName: 'マルス', series: 'Fire Emblem', fighterNumber: 23, category: 'unlockable' },
  { id: 'lucina', name: 'lucina', displayName: 'ルキナ', series: 'Fire Emblem', fighterNumber: 24, category: 'unlockable', echoFighter: 'marth' },
  { id: 'young_link', name: 'young_link', displayName: 'こどもリンク', series: 'The Legend of Zelda', fighterNumber: 25, category: 'unlockable' },
  { id: 'ganondorf', name: 'ganondorf', displayName: 'ガノンドロフ', series: 'The Legend of Zelda', fighterNumber: 26, category: 'unlockable' },
  { id: 'mewtwo', name: 'mewtwo', displayName: 'ミュウツー', series: 'Pokémon', fighterNumber: 27, category: 'unlockable' },
  { id: 'roy', name: 'roy', displayName: 'ロイ', series: 'Fire Emblem', fighterNumber: 28, category: 'unlockable' },
  { id: 'chrom', name: 'chrom', displayName: 'クロム', series: 'Fire Emblem', fighterNumber: 29, category: 'unlockable', echoFighter: 'roy' },
  { id: 'mr_game_and_watch', name: 'mr_game_and_watch', displayName: 'Mr.ゲーム&ウォッチ', series: 'Game & Watch', fighterNumber: 30, category: 'unlockable' },
  
  // X追加ファイター
  { id: 'meta_knight', name: 'meta_knight', displayName: 'メタナイト', series: 'Kirby', fighterNumber: 31, category: 'unlockable' },
  { id: 'pit', name: 'pit', displayName: 'ピット', series: 'Kid Icarus', fighterNumber: 32, category: 'unlockable' },
  { id: 'dark_pit', name: 'dark_pit', displayName: 'ブラックピット', series: 'Kid Icarus', fighterNumber: 33, category: 'unlockable', echoFighter: 'pit' },
  { id: 'zero_suit_samus', name: 'zero_suit_samus', displayName: 'ゼロスーツサムス', series: 'Metroid', fighterNumber: 34, category: 'unlockable' },
  { id: 'wario', name: 'wario', displayName: 'ワリオ', series: 'Wario', fighterNumber: 35, category: 'unlockable' },
  { id: 'snake', name: 'snake', displayName: 'スネーク', series: 'Metal Gear', fighterNumber: 36, category: 'unlockable' },
  { id: 'ike', name: 'ike', displayName: 'アイク', series: 'Fire Emblem', fighterNumber: 37, category: 'unlockable' },
  { id: 'pokemon_trainer', name: 'pokemon_trainer', displayName: 'ポケモントレーナー', series: 'Pokémon', fighterNumber: 38, category: 'unlockable' },
  { id: 'squirtle', name: 'squirtle', displayName: 'ゼニガメ', series: 'Pokémon', fighterNumber: 39, category: 'unlockable' },
  { id: 'ivysaur', name: 'ivysaur', displayName: 'フシギソウ', series: 'Pokémon', fighterNumber: 40, category: 'unlockable' },
  { id: 'charizard', name: 'charizard', displayName: 'リザードン', series: 'Pokémon', fighterNumber: 41, category: 'unlockable' },
  { id: 'diddy_kong', name: 'diddy_kong', displayName: 'ディディーコング', series: 'Donkey Kong', fighterNumber: 42, category: 'unlockable' },
  { id: 'lucas', name: 'lucas', displayName: 'リュカ', series: 'EarthBound', fighterNumber: 43, category: 'unlockable' },
  { id: 'sonic', name: 'sonic', displayName: 'ソニック', series: 'Sonic the Hedgehog', fighterNumber: 44, category: 'unlockable' },
  { id: 'king_dedede', name: 'king_dedede', displayName: 'デデデ大王', series: 'Kirby', fighterNumber: 45, category: 'unlockable' },
  { id: 'olimar', name: 'olimar', displayName: 'ピクミン&オリマー', series: 'Pikmin', fighterNumber: 46, category: 'unlockable' },
  { id: 'lucario', name: 'lucario', displayName: 'ルカリオ', series: 'Pokémon', fighterNumber: 47, category: 'unlockable' },
  { id: 'rob', name: 'rob', displayName: 'ロボット', series: 'Robot', fighterNumber: 48, category: 'unlockable' },
  { id: 'toon_link', name: 'toon_link', displayName: 'トゥーンリンク', series: 'The Legend of Zelda', fighterNumber: 49, category: 'unlockable' },
  { id: 'wolf', name: 'wolf', displayName: 'ウルフ', series: 'Star Fox', fighterNumber: 50, category: 'unlockable' },
  
  // 3DS/Wii U追加ファイター
  { id: 'villager', name: 'villager', displayName: 'むらびと', series: 'Animal Crossing', fighterNumber: 51, category: 'unlockable' },
  { id: 'mega_man', name: 'mega_man', displayName: 'ロックマン', series: 'Mega Man', fighterNumber: 52, category: 'unlockable' },
  { id: 'wii_fit_trainer', name: 'wii_fit_trainer', displayName: 'Wii Fit トレーナー', series: 'Wii Fit', fighterNumber: 53, category: 'unlockable' },
  { id: 'rosalina', name: 'rosalina', displayName: 'ロゼッタ&チコ', series: 'Super Mario', fighterNumber: 54, category: 'unlockable' },
  { id: 'little_mac', name: 'little_mac', displayName: 'リトル・マック', series: 'Punch-Out!!', fighterNumber: 55, category: 'unlockable' },
  { id: 'greninja', name: 'greninja', displayName: 'ゲッコウガ', series: 'Pokémon', fighterNumber: 56, category: 'unlockable' },
  { id: 'mii_brawler', name: 'mii_brawler', displayName: 'Mii格闘タイプ', series: 'Mii', fighterNumber: 57, category: 'unlockable' },
  { id: 'mii_swordfighter', name: 'mii_swordfighter', displayName: 'Mii剣術タイプ', series: 'Mii', fighterNumber: 58, category: 'unlockable' },
  { id: 'mii_gunner', name: 'mii_gunner', displayName: 'Mii射撃タイプ', series: 'Mii', fighterNumber: 59, category: 'unlockable' },
  { id: 'palutena', name: 'palutena', displayName: 'パルテナ', series: 'Kid Icarus', fighterNumber: 60, category: 'unlockable' },
  { id: 'pac_man', name: 'pac_man', displayName: 'パックマン', series: 'Pac-Man', fighterNumber: 61, category: 'unlockable' },
  { id: 'robin', name: 'robin', displayName: 'ルフレ', series: 'Fire Emblem', fighterNumber: 62, category: 'unlockable' },
  { id: 'shulk', name: 'shulk', displayName: 'シュルク', series: 'Xenoblade Chronicles', fighterNumber: 63, category: 'unlockable' },
  { id: 'bowser_jr', name: 'bowser_jr', displayName: 'クッパJr.', series: 'Super Mario', fighterNumber: 64, category: 'unlockable' },
  { id: 'duck_hunt', name: 'duck_hunt', displayName: 'ダックハント', series: 'Duck Hunt', fighterNumber: 65, category: 'unlockable' },
  { id: 'ryu', name: 'ryu', displayName: 'リュウ', series: 'Street Fighter', fighterNumber: 66, category: 'unlockable' },
  { id: 'ken', name: 'ken', displayName: 'ケン', series: 'Street Fighter', fighterNumber: 67, category: 'unlockable', echoFighter: 'ryu' },
  { id: 'cloud', name: 'cloud', displayName: 'クラウド', series: 'Final Fantasy', fighterNumber: 68, category: 'unlockable' },
  { id: 'corrin', name: 'corrin', displayName: 'カムイ', series: 'Fire Emblem', fighterNumber: 69, category: 'unlockable' },
  { id: 'bayonetta', name: 'bayonetta', displayName: 'ベヨネッタ', series: 'Bayonetta', fighterNumber: 70, category: 'unlockable' },
  
  // Ultimate新規ファイター
  { id: 'inkling', name: 'inkling', displayName: 'インクリング', series: 'Splatoon', fighterNumber: 71, category: 'unlockable' },
  { id: 'ridley', name: 'ridley', displayName: 'リドリー', series: 'Metroid', fighterNumber: 72, category: 'unlockable' },
  { id: 'simon', name: 'simon', displayName: 'シモン', series: 'Castlevania', fighterNumber: 73, category: 'unlockable' },
  { id: 'richter', name: 'richter', displayName: 'リヒター', series: 'Castlevania', fighterNumber: 74, category: 'unlockable', echoFighter: 'simon' },
  { id: 'king_k_rool', name: 'king_k_rool', displayName: 'キングクルール', series: 'Donkey Kong', fighterNumber: 75, category: 'unlockable' },
  { id: 'isabelle', name: 'isabelle', displayName: 'しずえ', series: 'Animal Crossing', fighterNumber: 76, category: 'unlockable' },
  
  // ファイターパス Vol.1
  { id: 'piranha_plant', name: 'piranha_plant', displayName: 'パックンフラワー', series: 'Super Mario', fighterNumber: 77, category: 'dlc', releaseDate: '2019-01-29' },
  { id: 'joker', name: 'joker', displayName: 'ジョーカー', series: 'Persona', fighterNumber: 78, category: 'dlc', releaseDate: '2019-04-17', dlcPack: 'Fighter Pass Vol. 1' },
  { id: 'hero', name: 'hero', displayName: '勇者', series: 'Dragon Quest', fighterNumber: 79, category: 'dlc', releaseDate: '2019-07-30', dlcPack: 'Fighter Pass Vol. 1' },
  { id: 'banjo_kazooie', name: 'banjo_kazooie', displayName: 'バンジョー&カズーイ', series: 'Banjo-Kazooie', fighterNumber: 80, category: 'dlc', releaseDate: '2019-09-04', dlcPack: 'Fighter Pass Vol. 1' },
  { id: 'terry', name: 'terry', displayName: 'テリー', series: 'Fatal Fury', fighterNumber: 81, category: 'dlc', releaseDate: '2019-11-06', dlcPack: 'Fighter Pass Vol. 1' },
  { id: 'byleth', name: 'byleth', displayName: 'ベレト/ベレス', series: 'Fire Emblem', fighterNumber: 82, category: 'dlc', releaseDate: '2020-01-28', dlcPack: 'Fighter Pass Vol. 1' },
  
  // ファイターパス Vol.2
  { id: 'min_min', name: 'min_min', displayName: 'ミェンミェン', series: 'ARMS', fighterNumber: 83, category: 'dlc', releaseDate: '2020-06-29', dlcPack: 'Fighter Pass Vol. 2' },
  { id: 'steve', name: 'steve', displayName: 'スティーブ/アレックス', series: 'Minecraft', fighterNumber: 84, category: 'dlc', releaseDate: '2020-10-13', dlcPack: 'Fighter Pass Vol. 2' },
  { id: 'sephiroth', name: 'sephiroth', displayName: 'セフィロス', series: 'Final Fantasy', fighterNumber: 85, category: 'dlc', releaseDate: '2020-12-22', dlcPack: 'Fighter Pass Vol. 2' },
  { id: 'pyra_mythra', name: 'pyra_mythra', displayName: 'ホムラ/ヒカリ', series: 'Xenoblade Chronicles', fighterNumber: 86, category: 'dlc', releaseDate: '2021-03-04', dlcPack: 'Fighter Pass Vol. 2' },
  { id: 'kazuya', name: 'kazuya', displayName: 'カズヤ', series: 'Tekken', fighterNumber: 87, category: 'dlc', releaseDate: '2021-06-29', dlcPack: 'Fighter Pass Vol. 2' },
  { id: 'sora', name: 'sora', displayName: 'ソラ', series: 'Kingdom Hearts', fighterNumber: 88, category: 'dlc', releaseDate: '2021-10-18', dlcPack: 'Fighter Pass Vol. 2' }
];

/**
 * カテゴリ別のキャラクター取得
 */
export function getCharactersByCategory(category: CharacterInfo['category']): CharacterInfo[] {
  return ALL_CHARACTERS.filter(char => char.category === category);
}

/**
 * シリーズ別のキャラクター取得
 */
export function getCharactersBySeries(series: string): CharacterInfo[] {
  return ALL_CHARACTERS.filter(char => char.series === series);
}

/**
 * エコーファイターの関係取得
 */
export function getEchoFighters(): Array<{ original: CharacterInfo; echo: CharacterInfo }> {
  const echoRelationships: Array<{ original: CharacterInfo; echo: CharacterInfo }> = [];
  
  ALL_CHARACTERS.forEach(char => {
    if (char.echoFighter) {
      const original = ALL_CHARACTERS.find(c => c.id === char.echoFighter);
      if (original) {
        echoRelationships.push({ original, echo: char });
      }
    }
  });
  
  return echoRelationships;
}

/**
 * キャラクター情報の取得
 */
export function getCharacterInfo(characterId: string): CharacterInfo | undefined {
  return ALL_CHARACTERS.find(char => char.id === characterId);
}

/**
 * 全キャラクターIDのリスト
 */
export function getAllCharacterIds(): string[] {
  return ALL_CHARACTERS.map(char => char.id);
}

/**
 * 基本ファイターの数（DLC以外）
 */
export function getBaseRosterCount(): number {
  return ALL_CHARACTERS.filter(char => char.category !== 'dlc').length;
}

/**
 * DLCファイターの数
 */
export function getDLCCount(): number {
  return ALL_CHARACTERS.filter(char => char.category === 'dlc').length;
}

/**
 * シリーズごとのファイター数統計
 */
export function getSeriesStatistics(): Record<string, number> {
  const seriesCount: Record<string, number> = {};
  
  ALL_CHARACTERS.forEach(char => {
    seriesCount[char.series] = (seriesCount[char.series] || 0) + 1;
  });
  
  return seriesCount;
}