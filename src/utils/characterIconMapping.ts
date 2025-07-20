/**
 * キャラクターIDとアイコンファイル名のマッピング
 * DLCキャラクターはアイコンがない場合があるため、フォールバック処理が必要
 */

export const CHARACTER_ICON_MAPPING: Record<string, string> = {
  // オリジナル8ファイター
  'mario': 'mario.png',
  'donkey_kong': 'donkey_kong.png',
  'link': 'link.png',
  'samus': 'samus.png',
  'dark_samus': 'dark_samus.png',
  'yoshi': 'yoshi.png',
  'kirby': 'kirby.png',
  'fox': 'fox.png',
  'pikachu': 'pikachu.png',
  
  // 64追加ファイター
  'luigi': 'luigi.png',
  'ness': 'ness.png',
  'captain_falcon': 'captain_falcon.png',
  'jigglypuff': 'jigglypuff.png',
  
  // DX追加ファイター
  'peach': 'peach.png',
  'daisy': 'daisy.png',
  'bowser': 'bowser.png',
  'ice_climbers': 'ice_climbers.png',
  'sheik': 'sheik.png',
  'zelda': 'zelda.png',
  'dr_mario': 'dr_mario.png',
  'pichu': 'pichu.png',
  'falco': 'falco.png',
  'marth': 'marth.png',
  'lucina': 'lucina.png',
  'young_link': 'young_link.png',
  'ganondorf': 'ganondorf.png',
  'mewtwo': 'mewtwo.png',
  'roy': 'roy.png',
  'chrom': 'chrom.png',
  'mr_game_and_watch': 'mr_game_and_watch.png',
  
  // X追加ファイター
  'meta_knight': 'meta_knight.png',
  'pit': 'pit.png',
  'dark_pit': 'dark_pit.png',
  'zero_suit_samus': 'zero_suit_samus.png',
  'wario': 'wario.png',
  'snake': 'snake.png',
  'ike': 'ike.png',
  'squirtle': 'squirtle.png',
  'ivysaur': 'ivysaur.png',
  'charizard': 'charizard.png',
  'diddy_kong': 'diddy_kong.png',
  'lucas': 'lucas.png',
  'sonic': 'sonic.png',
  'king_dedede': 'king_dedede.png',
  'olimar': 'olimar.png',
  'lucario': 'lucario.png',
  'rob': 'rob.png',
  'toon_link': 'toon_link.png',
  'wolf': 'wolf.png',
  
  // 3DS/Wii U追加ファイター
  'villager': 'villager.png',
  'mega_man': 'mega_man.png',
  'wii_fit_trainer': 'wii_fit_trainer.png',
  'rosalina': 'rosalina_and_luma.png', // ファイル名が異なる
  'little_mac': 'little_mac.png',
  'greninja': 'greninja.png',
  'mii_brawler': 'mii_brawler.png',
  'mii_swordfighter': 'mii_swordfighter.png',
  'mii_gunner': 'mii_gunner.png',
  'palutena': 'palutena.png',
  'pac_man': 'pac_man.png',
  'robin': 'robin.png',
  'shulk': 'shulk.png',
  'bowser_jr': 'bowser_jr.png',
  'duck_hunt': 'duck_hunt.png',
  'ryu': 'ryu.png',
  'ken': 'ken.png',
  'cloud': 'cloud.png',
  'corrin': 'corrin.png',
  'bayonetta': 'bayonetta.png',
  
  // Ultimate新規ファイター
  'inkling': 'inkling.png',
  'ridley': 'ridley.png',
  'simon': 'simon.png',
  'richter': 'richter.png',
  'king_k_rool': 'king_k_rool.png',
  'isabelle': 'isabelle.png',
  'incineroar': 'incineroar.png',
  
  // DLCファイター
  'piranha_plant': 'piranha_plant.png',
  'joker': 'joker.png',
  'hero': 'hero.png',
  'banjo_kazooie': 'banjo_kazooie.png',
  'terry': 'terry.png',
  'byleth': 'byleth.png',
  'min_min': 'min_min.png',
  'steve': 'steve.png',
  'sephiroth': 'sephiroth.png',
  'pyra_mythra': 'pyra_mythra.png',
  'kazuya': 'kazuya.png',
  'sora': 'sora.png',
};

/**
 * キャラクターIDからアイコンURLを取得
 * @param characterId キャラクターID
 * @returns アイコンのURL、DLCで未実装の場合はプレースホルダー
 */
export function getCharacterIconUrl(characterId: string): string | null {
  const iconFileName = CHARACTER_ICON_MAPPING[characterId];
  
  if (iconFileName === undefined) {
    // マッピングに存在しないキャラクター
    return null;
  }
  
  if (iconFileName === null) {
    // DLCキャラクターでアイコンが未実装
    return '/lagscope/icons/fighters/dlc_placeholder.svg';
  }
  
  return `/lagscope/icons/fighters/${iconFileName}`;
}

/**
 * キャラクターアイコンが存在するかどうかを確認
 * @param characterId キャラクターID
 * @returns アイコンが存在する場合はtrue
 */
export function hasCharacterIcon(characterId: string): boolean {
  return CHARACTER_ICON_MAPPING[characterId] !== null && CHARACTER_ICON_MAPPING[characterId] !== undefined;
}