'use strict';

//========================================================================================
/*                                                                                      *
 *                                       DEFAULTS                                       *
 *                                                                                      */
//========================================================================================

export const MAX_TURNS: number = 300;
export const MIN_LANDS: number = 1;
export const MAX_LANDS: number = 3500;
export const BATTLE_TURNS: number = 2;
export const BATTLE_ROUNDS: number = 5;
export const BATTLE_POWER: number = 20;
// export const PROTECTION_TIME: number = 60;
export const VISITATION_TIME: number = 60;
export const AUCTION_TIME: number = 60;
export const AUCTION_TIME_OUTBID: number = 3600;
export const BID_RATIO: number = 1.10;
export const OUTBID_RATIO: number = 0.90;
export const GUILD_TIME: number = 60;
export const CLAN_COST: number = 1000000;
export const FACTION_MULTIPLIER: number = 2;
export const MAP_RADIUS: number = 10000;
export const ATTACK_RATIO: number = 0.05;
export const PILLAGE_RATIO: number = 0.10;
export const SIEGE_RATIO: number = 0.15;
export const QUEST_GEMS: number = 1;

//========================================================================================
/*                                                                                      *
 *                                      INTERFACES                                      *
 *                                                                                      */
//========================================================================================

export type BattleReport = {
  attackerPowerLost: number;
  defenderPowerLost: number;
  victory: boolean;
  logs: any[];
};

export type RequestResponse = {
  // TODO
};

//========================================================================================
/*                                                                                      *
 *                                         TYPES                                        *
 *                                                                                      */
//========================================================================================

export enum KingdomType {
  RED = 'red',
  GREEN = 'green',
  BLACK = 'black',
  BLUE = 'blue',
  WHITE = 'white',
  GREY = 'grey',
}

export enum BonusType {
  EXPLORE = 'explore',
  RESEARCH = 'research',
  BUILD = 'build',
}

export enum TargetType {
  ATTACKER = 'attacker',
  DEFENDER = 'defender',
}

export enum BattleType {
  SIEGE = 'siege',
  PILLAGE = 'pillage',
  ATTACK = 'attack',
  ADVENTURE = 'adventure',
}

export enum StoreType {
  INN = 'inn',
  MERCENARY = 'mercenary',
  SORCERER = 'sorcerer',
  MERCHANT = 'merchant',
}

export enum CategoryType {
  MELEE = 'melee',
  RANGED = 'ranged',
  MAGIC = 'magic',
  PSYCHIC = 'psychic',
  BREATH = 'breath',
  FIRE = 'fire',
  POISON = 'poison',
  COLD = 'cold',
  LIGHTNING = 'lightning',
  HOLY = 'holy',
}

export enum LocationType {
  CAVE = 'cave',
  GRAVEYARD = 'graveyard',
  DUNGEON = 'dungeon',
  MINE = 'mine',
  FOREST = 'forest',
  CATHEDRAL = 'cathedral',
  MOUNTAIN = 'mountain',
  VOLCANO = 'volcano',
  LAKE = 'lake',
  NEST = 'nest',
  CASTLE = 'castle',
  BARRACK = 'barrack',
  ISLAND = 'island',
  MONOLITH = 'monolith',
  RUIN = 'ruin',
  SHIP = 'ship',
  TOWN = 'town',
  SHRINE = 'shrine',
  TOTEM = 'totem',
  PYRAMID = 'pyramid',
}

export enum AuctionType {
  ARTIFACT = 'artifact',
  CHARM = 'charm',
  CONTRACT = 'contract',
  TROOP = 'troop',
}

export enum SupplyType {
  GOLD = 'gold',
  MANA = 'mana',
  POPULATION = 'population',
  LAND = 'land',
  TURN = 'turn',
  GEM = 'gem',
}

export enum AssignmentType {
  NONE,
  ATTACK,
  DEFENSE,
}

export enum MarkerType {
  KINGDOM = 'kingdom',
  SHOP = 'shop',
  QUEST = 'quest',
}

export enum RewardType {
  ARTIFACT = 'artifact',
  CHARM = 'charm',
  ENCHANTMENT = 'enchantment',
  CONTRACT = 'contract',
  TROOP = 'troop',
  SUPPLY = 'supply',
  BUILDING = 'building',
}

export enum SpellType {
  SUMMON = 'summon',
  RESOURCE = 'resource',
  ENCHANTMENT = 'enchantment',
  ITEM = 'item',
  SPELL = 'spell',
  ESPIONAGE = 'espionage',
  BATTLE = 'battle',
  ARMAGEDDON = 'armageddon',
}

export enum ArtifactType {
  SUMMON = 'summon',
  RESOURCE = 'resource',
  ENCHANTMENT = 'enchantment',
  ITEM = 'item',
  SPELL = 'spell',
  ESPIONAGE = 'espionage',
  BATTLE = 'battle',
}
