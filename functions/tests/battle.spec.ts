import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import { applyArtifacts, applyContracts, applyCharms, applyWave, resolveBattle, applySkills, applyDamage, applyCasualties, applyGuilds, updatePerk, applyTrees } from '../src/index';
import { BattleReport, CategoryType, BattleType } from '../src/config';

const ITEMS_QUANTITY: number = 1;
const UNITS_QUANTITY: number = 100;
const HERO_LEVEL: number = 10;

describe('Battles', () => {
  // report
  let report: BattleReport;
  // troops
  let attackerUnits: any[];
  let defenderUnits: any[];
  let attackerTroops: any[];
  let defenderTroops: any[];
  // artifacts
  let attackerItems: any[];
  let defenderItems: any[];
  let attackerArtifacts: any[];
  let defenderArtifacts: any[];
  // charms
  let attackerSpells: any[];
  let defenderSpells: any[];
  let attackerCharms: any[];
  let defenderCharms: any[];
  // contracts
  let attackerHeroes: any[];
  let defenderHeroes: any[];
  let attackerContracts: any[];
  let defenderContracts: any[];
  // guilds
  let attackerGuild: any;
  let defenderGuild: any;
  // trees
  let attackerTree: any;
  let defenderTree: any;
  // data
  const prepareTest = async () => {
    // troops
    for (const unit of attackerUnits) {
      attackerTroops.push({
        unit: (await admin.firestore().doc(`units/${unit}`).get()).data(),
        quantity: UNITS_QUANTITY,
      });
    }
    for (const unit of defenderUnits) {
      defenderTroops.push({
        unit: (await admin.firestore().doc(`units/${unit}`).get()).data(),
        quantity: UNITS_QUANTITY,
      });
    }
    // artifacts
    for (const item of attackerItems) {
      attackerArtifacts.push({
        item: (await admin.firestore().doc(`items/${item}`).get()).data(),
        quantity: ITEMS_QUANTITY,
      });
    }
    for (const item of defenderItems) {
      defenderArtifacts.push({
        item: (await admin.firestore().doc(`items/${item}`).get()).data(),
        quantity: ITEMS_QUANTITY,
      });
    }
    // charms
    for (const spell of attackerSpells) {
      attackerCharms.push({
        spell: (await admin.firestore().doc(`spells/${spell}`).get()).data(),
      });
    }
    for (const spell of defenderSpells) {
      defenderCharms.push({
        spell: (await admin.firestore().doc(`spells/${spell}`).get()).data(),
      });
    }
    // contracts
    for (const hero of attackerHeroes) {
      attackerContracts.push({
        hero: (await admin.firestore().doc(`heroes/${hero}`).get()).data(),
        level: HERO_LEVEL,
      });
    }
    for (const hero of defenderHeroes) {
      defenderContracts.push({
        hero: (await admin.firestore().doc(`heroes/${hero}`).get()).data(),
        level: HERO_LEVEL,
      });
    }
    // guild
    attackerGuild = (await admin.firestore().doc(`guilds/${attackerGuild}`).get()).data();
    defenderGuild = (await admin.firestore().doc(`guilds/${defenderGuild}`).get()).data();
    // tree
    attackerTree = (await admin.firestore().doc(`perks/strategy`).get()).data();
    defenderTree = (await admin.firestore().doc(`perks/strategy`).get()).data();
  };

  beforeEach(() => {
    // report
    report = {
      attackerPowerLost: 0,
      defenderPowerLost: 0,
      victory: false,
      logs: [],
    };
    // arrays
    attackerUnits = [];
    defenderUnits = [];
    attackerTroops = [];
    defenderTroops = [];
    attackerItems = [];
    defenderItems = [];
    attackerArtifacts = [];
    defenderArtifacts = [];
    attackerSpells = [];
    defenderSpells = [];
    attackerCharms = [];
    defenderCharms = [];
    attackerHeroes = [];
    defenderHeroes = [];
    attackerContracts = [];
    defenderContracts = [];
  });

  afterAll(() => {
    tester.cleanup();
  });

  it('should APPLY a GUILD which BONUSES a TROOP', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerGuild = 'assassin';
    defenderGuild = 'warrior';
    await prepareTest();
    expect(attackerTroops[0].unit.attackBonus).toEqual(undefined);
    expect(defenderTroops[0].unit.defenseBonus).toEqual(undefined);
    applyGuilds(attackerTroops, attackerGuild, defenderTroops, defenderGuild);
    expect(attackerTroops[0].unit.attackBonus).toEqual(10);
    expect(defenderTroops[0].unit.defenseBonus).toEqual(10);
  });

  it('should APPLY a TREE which BONUSES a TROOP', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    await prepareTest();
    updatePerk(attackerTree, 'metallurgy', 1);
    updatePerk(defenderTree, 'forge', 3);
    expect(attackerTroops[0].unit.attackBonus).toEqual(undefined);
    expect(defenderTroops[0].unit.defenseBonus).toEqual(undefined);
    applyTrees(attackerTroops, attackerTree, defenderTroops, defenderTree);
    expect(attackerTroops[0].unit.attackBonus).toEqual(5);
    expect(defenderTroops[0].unit.defenseBonus).toEqual(15);
  });

  it.each([
    ['agility-potion', 'haste'],
    ['defense-potion', 'scales'],
    ['strength-potion', 'strength'],
    ['spider-web', 'slowness'],
    ['crown-thorns', 'weakness'],
    ['fairy-wings', 'flight'],
    ['vampire-teeth', 'leech'],
  ])('should APPLY the ARTIFACT "%s" which ADDS the SKILL "%s"', async (item, skill) => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerItems = [item];
    defenderItems = [item];
    await prepareTest();
    expect(attackerTroops[0].unit.skills).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ id: skill }),
    ]));
    expect(defenderTroops[0].unit.skills).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ id: skill }),
    ]));
    applyArtifacts(attackerTroops, attackerArtifacts, defenderTroops, defenderArtifacts, report);
    expect(attackerTroops[0].unit.skills).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: skill }),
    ]));
    expect(defenderTroops[0].unit.skills).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: skill }),
    ]));
  });

  it.each([
    ['fire-scroll', 'fire'],
    ['cold-scroll', 'cold'],
    ['light-scroll', 'holy'],
    ['earth-scroll', 'poison'],
    ['lightning-scroll', 'lightning'],
  ])('should APPLY an ARTIFACT "%s" which ADDS the RESISTANCE "%s"', async (item, resistance) => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerItems = [item];
    defenderItems = [item];
    await prepareTest();
    expect(attackerTroops[0].unit.resistances).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ id: resistance }),
    ]));
    expect(defenderTroops[0].unit.resistances).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ id: resistance }),
    ]));
    applyArtifacts(attackerTroops, attackerArtifacts, defenderTroops, defenderArtifacts, report);
    expect(attackerTroops[0].unit.resistances).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: resistance }),
    ]));
    expect(defenderTroops[0].unit.resistances).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: resistance }),
    ]));
  });

  it.each([
    'holy-grenade',
    'powder-barrel',
    'vial-venom',
    'ancient-rune',
    'ice-stone',
  ])('should APPLY an ARTIFACT "%s" which DAMAGES a TROOP', async (item) => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerItems = [item];
    defenderItems = [item];
    await prepareTest();
    expect(attackerTroops[0].quantity).toEqual(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toEqual(UNITS_QUANTITY);
    applyArtifacts(attackerTroops, attackerArtifacts, defenderTroops, defenderArtifacts, report);
    expect(attackerTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
  });

  it.each([
    ['dragon-rider', 'red-dragon'],
    ['demon-prince', 'minotaur'],
    ['orc-king', 'orc'],
    ['commander', 'knight'],
    ['beast-master', 'griffon'],
    ['golem-golem', 'iron-golem'],
    ['elementalist', 'air-elemental'],
    ['necrophage', 'skeleton'],
  ])('should APPLY the CONTRACT "%s" which BONUSES the UNIT "%s"', async (hero, unit) => {
    attackerUnits = [unit];
    defenderUnits = [unit];
    attackerHeroes = [hero];
    defenderHeroes = [hero];
    await prepareTest();
    expect(attackerTroops[0].unit.attackBonus).toEqual(undefined);
    expect(attackerTroops[0].unit.defenseBonus).toEqual(undefined);
    expect(attackerTroops[0].unit.healthBonus).toEqual(undefined);
    expect(defenderTroops[0].unit.attackBonus).toEqual(undefined);
    expect(defenderTroops[0].unit.defenseBonus).toEqual(undefined);
    expect(defenderTroops[0].unit.healthBonus).toEqual(undefined);
    applyContracts(attackerTroops, attackerContracts, defenderTroops, defenderContracts, report);
    expect(attackerTroops[0].unit.attackBonus).toBeGreaterThanOrEqual(0);
    expect(attackerTroops[0].unit.defenseBonus).toBeGreaterThanOrEqual(0);
    expect(attackerTroops[0].unit.healthBonus).toBeGreaterThanOrEqual(0);
    expect(defenderTroops[0].unit.attackBonus).toBeGreaterThanOrEqual(0);
    expect(defenderTroops[0].unit.defenseBonus).toBeGreaterThanOrEqual(0);
    expect(defenderTroops[0].unit.healthBonus).toBeGreaterThanOrEqual(0);
  });

  it.each([
    'pyromancer',
    'colossus',
    'swamp-thing',
    'illusionist',
    'soul-reaper',
  ])('should APPLY the CONTRACT "%s" which DAMAGES a TROOP', async (hero) => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerHeroes = [hero];
    defenderHeroes = [hero];
    await prepareTest();
    expect(attackerTroops[0].quantity).toEqual(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toEqual(UNITS_QUANTITY);
    applyContracts(attackerTroops, attackerContracts, defenderTroops, defenderContracts, report);
    expect(attackerTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
  });

  it.each([
    ['vampirism', ['leech', 'flight']],
    ['terror', ['fear']],
    ['necromancy', ['regeneration']],
    ['full-moon', ['strength', 'haste']],
    ['witchcraft', ['seduction', 'slowness']],
    ['curse', ['weakness']],
    ['succubus-kiss', ['seduction']],
    ['flame-shield', ['scales', 'slowness']],
    ['flame-blade', ['strength', 'slowness']],
    ['flame-arrow', ['haste', 'weakness']],
    ['fatigue', ['weakness', 'slowness']],
    ['frenzy', ['strength', 'weakness', 'leech']],
    ['levitation', ['flight']],
    ['fog', ['slowness', 'weakness']],
    ['hallucination', ['seduction', 'fear']],
    ['invisibility', ['strength', 'haste']],
    ['celerity', ['haste']],
    ['accuracy', ['strength']],
    ['ambush', ['haste']],
    ['invigorate', ['regeneration', 'scales', 'strength']],
    ['blaze', ['weakness', 'fear']],
    ['miracle', ['regeneration', 'flight', 'scales', 'strength', 'haste']],
    ['resurrection', ['regeneration']],
    ['healing', ['regeneration']],
    ['cure', ['regeneration']],
    ['shield-light', ['scales']],
    ['sword-light', ['strength']],
  ])('should APPLY the CHARM "%s" which ADDS the SKILL(s) %o', async (spell, skills) => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerSpells = [spell];
    defenderSpells = [spell];
    await prepareTest();
    expect(attackerTroops[0].unit.skills).toEqual(expect.not.arrayContaining(skills.map(skill => expect.objectContaining({ id: skill }))));
    expect(defenderTroops[0].unit.skills).toEqual(expect.not.arrayContaining(skills.map(skill => expect.objectContaining({ id: skill }))));
    applyCharms(attackerTroops, attackerCharms, defenderTroops, defenderCharms, report);
    expect(attackerTroops[0].unit.skills).toEqual(expect.arrayContaining(skills.map(skill => expect.objectContaining({ id: skill }))));
    expect(defenderTroops[0].unit.skills).toEqual(expect.arrayContaining(skills.map(skill => expect.objectContaining({ id: skill }))));
  });

  it.each([
    ['corruption', ['regeneration'], 'phoenix'],
    ['battle-chant', ['scales', 'strength'], 'iron-golem'],
    ['gravity', ['flight'], 'vampire'],
    ['hurricane', ['flight'], 'devil'],
    ['calm', ['weakness', 'slowness', 'fear', 'seduction'], 'cyclop'],
    ['calm', ['weakness', 'slowness', 'fear', 'seduction'], 'ogre'],
    ['calm', ['weakness', 'slowness', 'fear', 'seduction'], 'sheep'],
    ['calm', ['weakness', 'slowness', 'fear', 'seduction'], 'djinni'],
  ])('should APPLY the CHARM "%s" which REMOVES the SKILL(s) "%o" from the TROOP "%s"', async (spell, skills, unit) => {
    attackerUnits = [unit];
    defenderUnits = [unit];
    attackerSpells = [spell];
    defenderSpells = [spell];
    await prepareTest();
    //expect(attackerTroops[0].unit.skills).toContainEqual(expect.arrayContaining(skills.map(skill => expect.objectContaining({ id: skill }))));
    //expect(defenderTroops[0].unit.skills).toContainEqual(expect.arrayContaining(skills.map(skill => expect.objectContaining({ id: skill }))));
    applyCharms(attackerTroops, attackerCharms, defenderTroops, defenderCharms, report);
    expect(attackerTroops[0].unit.skills).toEqual(expect.not.arrayContaining(skills.map(skill => expect.objectContaining({ id: skill }))));
    expect(defenderTroops[0].unit.skills).toEqual(expect.not.arrayContaining(skills.map(skill => expect.objectContaining({ id: skill }))));
  });

  it.each([
    'chain-lightning',
    'fireball',
    'inferno',
    'freeze',
    'venom',
    'exorcism',
  ])('should APPLY the CHARM "%s" which DAMAGES a TROOP', async (spell) => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerSpells = [spell];
    defenderSpells = [spell];
    await prepareTest();
    expect(attackerTroops[0].quantity).toBe(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBe(UNITS_QUANTITY);
    applyCharms(attackerTroops, attackerCharms, defenderTroops, defenderCharms, report);
    expect(attackerTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
  });

  it('should APPLY a BONUS from SKILL to a TROOP', async () => {
    attackerUnits = ['iron-golem'];
    defenderUnits = [];
    await prepareTest();
    expect(attackerTroops[0].unit.attackBonus).toBe(undefined);
    expect(attackerTroops[0].unit.defenseBonus).toBe(undefined);
    expect(attackerTroops[0].unit.initiativeBonus).toBe(undefined);
    applySkills(attackerTroops, defenderTroops);
    expect(attackerTroops[0].unit.attackBonus).toBe(25);
    expect(attackerTroops[0].unit.defenseBonus).toBe(25);
    expect(attackerTroops[0].unit.initiativeBonus).toBe(-1);
  });

  it('should APPLY a BONUS from RESISTANCE to a TROOP', async () => {
    attackerUnits = ['iron-golem'];
    defenderUnits = [];
    await prepareTest();
    expect(attackerTroops[0].unit.meleeResistance).toBe(undefined);
    expect(attackerTroops[0].unit.rangedResistance).toBe(undefined);
    expect(attackerTroops[0].unit.magicResistance).toBe(undefined);
    expect(attackerTroops[0].unit.psychicResistance).toBe(undefined);
    expect(attackerTroops[0].unit.breathResistance).toBe(undefined);
    expect(attackerTroops[0].unit.fireResistance).toBe(undefined);
    expect(attackerTroops[0].unit.coldResistance).toBe(undefined);
    expect(attackerTroops[0].unit.holyResistance).toBe(undefined);
    expect(attackerTroops[0].unit.lightningResistance).toBe(undefined);
    expect(attackerTroops[0].unit.poisonResistance).toBe(undefined);
    applySkills(attackerTroops, defenderTroops);
    expect(attackerTroops[0].unit.meleeResistance).toBe(75);
    expect(attackerTroops[0].unit.rangedResistance).toBe(75);
    expect(attackerTroops[0].unit.magicResistance).toBe(75);
    expect(attackerTroops[0].unit.psychicResistance).toBe(75);
    expect(attackerTroops[0].unit.breathResistance).toBe(75);
    expect(attackerTroops[0].unit.fireResistance).toBe(75);
    expect(attackerTroops[0].unit.coldResistance).toBe(75);
    expect(attackerTroops[0].unit.holyResistance).toBe(75);
    expect(attackerTroops[0].unit.lightningResistance).toBe(75);
    expect(attackerTroops[0].unit.poisonResistance).toBe(75);
  });

  it('should DAMAGE a TROOP with OPPOSITES factions', async () => {
    attackerUnits = ['skeleton', 'orc', 'siren', 'paladin', 'elf', 'fanatic'];
    defenderUnits = ['skeleton', 'skeleton', 'skeleton', 'skeleton', 'skeleton', 'skeleton'];
    await prepareTest();
    for (let i = 0; i < attackerUnits.length; i++) {
      attackerTroops[i].unit.initiativeBonus = 0;
      attackerTroops[i].unit.attackWave = attackerTroops[i].unit.attack;
      attackerTroops[i].unit.defenseWave = attackerTroops[i].unit.defense;
      attackerTroops[i].unit.healthWave = attackerTroops[i].unit.health;
      defenderTroops[i].unit.initiativeBonus = 0;
      defenderTroops[i].unit.attackWave = defenderTroops[i].unit.attack;
      defenderTroops[i].unit.defenseWave = defenderTroops[i].unit.defense;
      defenderTroops[i].unit.healthWave = defenderTroops[i].unit.health;
    }
    // equal faction
    expect(attackerTroops[0].unit.attackWave).toBe(100);
    applyDamage(attackerTroops[0], defenderTroops[0], attackerTroops[0].unit.categories[0]);
    expect(attackerTroops[0].unit.attackWave).toBe(100);
    // adjacent faction
    expect(attackerTroops[1].unit.attackWave).toBe(100);
    applyDamage(attackerTroops[1], defenderTroops[1], attackerTroops[1].unit.categories[0]);
    expect(attackerTroops[1].unit.attackWave).toBe(100);
    // adjacent faction
    expect(attackerTroops[2].unit.attackWave).toBe(300);
    applyDamage(attackerTroops[2], defenderTroops[2], attackerTroops[2].unit.categories[0]);
    expect(attackerTroops[2].unit.attackWave).toBe(300);
    // opposite faction
    expect(attackerTroops[3].unit.attackWave).toBe(360);
    applyDamage(attackerTroops[3], defenderTroops[3], attackerTroops[3].unit.categories[0]);
    expect(attackerTroops[3].unit.attackWave).toBe(720);
    // opposite faction
    expect(attackerTroops[4].unit.attackWave).toBe(125);
    applyDamage(attackerTroops[4], defenderTroops[4], attackerTroops[4].unit.categories[0]);
    expect(attackerTroops[4].unit.attackWave).toBe(250);
    // neutral faction
    expect(attackerTroops[5].unit.attackWave).toBe(130);
    applyDamage(attackerTroops[5], defenderTroops[5], attackerTroops[5].unit.categories[0]);
    expect(attackerTroops[5].unit.attackWave).toBe(130);
  });

  it('should DAMAGE a TROOP with CATEGORIES', async () => {
    attackerUnits = ['iron-golem'];
    defenderUnits = ['skeleton'];
    await prepareTest();
    attackerTroops[0].unit.initiativeBonus = 0;
    attackerTroops[0].unit.attackWave = attackerTroops[0].unit.attack;
    attackerTroops[0].unit.defenseWave = attackerTroops[0].unit.defense;
    attackerTroops[0].unit.healthWave = attackerTroops[0].unit.health;
    defenderTroops[0].unit.initiativeBonus = 0;
    defenderTroops[0].unit.attackWave = defenderTroops[0].unit.attack;
    defenderTroops[0].unit.defenseWave = defenderTroops[0].unit.defense;
    defenderTroops[0].unit.healthWave = defenderTroops[0].unit.health;
    // melee
    expect(attackerTroops[0].unit.attackWave).toBe(20000);
    applyDamage(attackerTroops[0], defenderTroops[0], attackerTroops[0].unit.resistances.find((category: any) => category.id === CategoryType.MELEE));
    expect(attackerTroops[0].unit.attackWave).toBe(20000);
    // psychic
    expect(attackerTroops[0].unit.attackWave).toBe(20000);
    applyDamage(attackerTroops[0], defenderTroops[0], attackerTroops[0].unit.resistances.find((category: any) => category.id === CategoryType.PSYCHIC));
    expect(attackerTroops[0].unit.attackWave).toBe(20000);
    // ranged
    expect(attackerTroops[0].unit.attackWave).toBe(20000);
    applyDamage(attackerTroops[0], defenderTroops[0], attackerTroops[0].unit.resistances.find((category: any) => category.id === CategoryType.RANGED));
    expect(attackerTroops[0].unit.attackWave).toBe(20000);
    // magic
    expect(attackerTroops[0].unit.attackWave).toBe(20000);
    applyDamage(attackerTroops[0], defenderTroops[0], attackerTroops[0].unit.resistances.find((category: any) => category.id === CategoryType.MAGIC));
    expect(attackerTroops[0].unit.attackWave).toBe(20000);
    // fire
    expect(attackerTroops[0].unit.attackWave).toBe(20000);
    applyDamage(attackerTroops[0], defenderTroops[0], attackerTroops[0].unit.resistances.find((category: any) => category.id === CategoryType.FIRE));
    expect(attackerTroops[0].unit.attackWave).toBe(22000);
    // cold
    expect(defenderTroops[0].unit.attackWave).toBe(100);
    applyDamage(attackerTroops[0], defenderTroops[0], attackerTroops[0].unit.resistances.find((category: any) => category.id === CategoryType.COLD));
    expect(defenderTroops[0].unit.attackWave).toBe(90);
    // poison
    expect(defenderTroops[0].unit.healthWave).toBe(70);
    applyDamage(attackerTroops[0], defenderTroops[0], attackerTroops[0].unit.resistances.find((category: any) => category.id === CategoryType.POISON));
    expect(defenderTroops[0].unit.healthWave).toBe(63);
    // lidhtgning
    expect(defenderTroops[0].unit.initiativeBonus).toBe(0);
    applyDamage(attackerTroops[0], defenderTroops[0], attackerTroops[0].unit.resistances.find((category: any) => category.id === CategoryType.LIGHTNING));
    expect(defenderTroops[0].unit.initiativeBonus).toBe(-1);
    // holy
    expect(attackerTroops[0].unit.healthWave).toBe(10000);
    applyDamage(attackerTroops[0], defenderTroops[0], attackerTroops[0].unit.resistances.find((category: any) => category.id === CategoryType.HOLY));
    expect(attackerTroops[0].unit.healthWave).toBe(11000);
  });

  it('should KILL a TROOP with DIFFERENT CATEGORY vs RESISTANCE', async () => {
    attackerUnits = ['golden-dragon'];
    defenderUnits = ['golden-dragon'];
    await prepareTest();
    expect(attackerTroops[0].unit.categories).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: CategoryType.MELEE }),
    ]));
    expect(defenderTroops[0].unit.resistances).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ id: CategoryType.MELEE }),
    ]));
    attackerTroops[0].unit.attackWave = attackerTroops[0].unit.attack;
    attackerTroops[0].unit.defenseWave = attackerTroops[0].unit.defense;
    attackerTroops[0].unit.healthWave = attackerTroops[0].unit.health;
    defenderTroops[0].unit.attackWave = defenderTroops[0].unit.attack;
    defenderTroops[0].unit.defenseWave = defenderTroops[0].unit.defense;
    defenderTroops[0].unit.healthWave = defenderTroops[0].unit.health;
    const attackerCategory = attackerTroops[0].unit.categories.find((category: any) => category.id === CategoryType.MELEE);
    const damage = applyDamage(attackerTroops[0], defenderTroops[0], attackerCategory);
    expect(damage).toBe(250000);
    const casualties = applyCasualties(attackerTroops[0], defenderTroops[0], damage);
    expect(casualties).toBe(62);
  });

  it('should NOT KILL a TROOP with SAME CATEGORY vs RESISTANCE', async () => {
    attackerUnits = ['golden-dragon'];
    defenderUnits = ['golden-dragon'];
    await prepareTest();
    expect(attackerTroops[0].unit.categories).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: CategoryType.POISON }),
    ]));
    expect(defenderTroops[0].unit.resistances).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: CategoryType.POISON }),
    ]));
    attackerTroops[0].unit.attackWave = attackerTroops[0].unit.attack;
    attackerTroops[0].unit.defenseWave = attackerTroops[0].unit.defense;
    attackerTroops[0].unit.healthWave = attackerTroops[0].unit.health;
    defenderTroops[0].unit.attackWave = defenderTroops[0].unit.attack;
    defenderTroops[0].unit.defenseWave = defenderTroops[0].unit.defense;
    defenderTroops[0].unit.healthWave = defenderTroops[0].unit.health;
    const attackerCategory = attackerTroops[0].unit.categories.find((category: any) => category.id === CategoryType.POISON);
    const damage = applyDamage(attackerTroops[0], defenderTroops[0], attackerCategory);
    expect(damage).toBe(62500);
    const casualties = applyCasualties(attackerTroops[0], defenderTroops[0], damage);
    expect(casualties).toBe(0);
  });

  it('should APPLY a WAVE versus TROOPS in ADVENTURE', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    await prepareTest();
    expect(attackerTroops[0].quantity).toBe(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBe(UNITS_QUANTITY);
    applyWave(attackerTroops[0], defenderTroops[0], report, BattleType.ADVENTURE); // favors attacker in case of initiative tie
    expect(attackerTroops[0].quantity).toBe(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
  });

  it('should APPLY a WAVE versus TROOPS in SIEGE', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    await prepareTest();
    expect(attackerTroops[0].quantity).toBe(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBe(UNITS_QUANTITY);
    applyWave(attackerTroops[0], defenderTroops[0], report, BattleType.SIEGE); // favors defender in case of initiative tie
    expect(attackerTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBe(UNITS_QUANTITY);
  });

  it.each([
    'necromancy',
    'resurrection',
    'healing',
    'cure',
  ])('should APPLY the REVIVAL %s to a TROOP', async (spell) => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerSpells = [spell];
    defenderSpells = [spell];
    attackerHeroes = ['necromancer'];
    defenderHeroes = ['necromancer'];
    await prepareTest();
    expect(attackerTroops[0].quantity).toBe(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBe(UNITS_QUANTITY);
    await resolveBattle(null, null, attackerContracts, attackerTroops, attackerArtifacts, attackerCharms, null, null, defenderContracts, defenderTroops, defenderArtifacts, defenderCharms, BattleType.ADVENTURE, report);
    expect(attackerTroops[0].unit.skills[0].id).toBe('regeneration');
    expect(attackerTroops[0].unit.resurrectionBonus).toBe(35); // 25% + 10%
    expect(attackerTroops[0].casualties).toBe(0);
    expect(attackerTroops[0].quantity).toBe(100);
    expect(defenderTroops[0].unit.skills[0].id).toBe('regeneration');
    expect(defenderTroops[0].unit.resurrectionBonus).toBe(35); // 25% + 10%
    expect(defenderTroops[0].casualties).toBe(72);
    expect(defenderTroops[0].quantity).not.toBe(28); // 100 - 72 = 28
    expect(defenderTroops[0].quantity).toBe(54); // 28 + (72 * 35 / 100) = 54
  });

  it('should WIN an ADVENTURE', async () => {
    attackerUnits = ['skeleton', 'zombie'];
    defenderUnits = ['orc'];
    await prepareTest();
    await resolveBattle(null, null, attackerContracts, attackerTroops, attackerArtifacts, attackerCharms, null, null, defenderContracts, defenderTroops, defenderArtifacts, defenderCharms, BattleType.ADVENTURE, report);
    expect(attackerTroops.length).toBe(2);
    expect(defenderTroops.length).toBe(0);
    expect(report.attackerPowerLost).toBe(0);
    expect(report.defenderPowerLost).toBeGreaterThan(0);
    expect(report.victory).toEqual(true);
  });

  it('should LOSE an ADVENTURE', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['golden-dragon'];
    await prepareTest();
    await resolveBattle(null, null, attackerContracts, attackerTroops, attackerArtifacts, attackerCharms, null, null, defenderContracts, defenderTroops, defenderArtifacts, defenderCharms, BattleType.ADVENTURE, report);
    expect(attackerTroops.length).toBe(0);
    expect(defenderTroops.length).toBe(1);
    expect(report.attackerPowerLost).toBeGreaterThan(0);
    expect(report.defenderPowerLost).toBe(0);
    expect(report.victory).toEqual(false);
  });

  it('should WIN a PILLAGE', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = [];
    await prepareTest();
    await resolveBattle(null, null, attackerContracts, attackerTroops, attackerArtifacts, attackerCharms, null, null, defenderContracts, defenderTroops, defenderArtifacts, defenderCharms, BattleType.PILLAGE, report);
    expect(attackerTroops.length).toBe(1);
    expect(defenderTroops.length).toBe(0);
    expect(report.attackerPowerLost).toBe(0);
    expect(report.defenderPowerLost).toBe(0);
    expect(report.victory).toEqual(true);
  });

});
