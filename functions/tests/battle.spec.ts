import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { applyArtifacts, applyContracts, applyCharms, applyWave, BattleType, BattleReport, resolveBattle, applyBonuses, applyDamage, CategoryType, applyCasualties } from '../index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const ITEMS_QUANTITY: number = 1;
const UNITS_QUANTITY: number = 100;
const HERO_LEVEL: number = 10;

describe('BATTLE', () => {
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
  }

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

  it('should APPLY an ARTIFACT which ADDS a SKILL', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerItems = ['agility-potion', 'spider-web'];
    defenderItems = ['fairy-wings'];
    await prepareTest();
    expect(attackerTroops[0].unit.skills).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ id: 'haste' }),
      expect.objectContaining({ id: 'slowness' }),
    ]));
    expect(defenderTroops[0].unit.skills).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ id: 'flight' }),
    ]));
    applyArtifacts(attackerTroops, attackerArtifacts, defenderTroops, defenderArtifacts, report);
    expect(attackerTroops[0].unit.skills).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'haste' }),
    ]));
    expect(defenderTroops[0].unit.skills).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'flight' }),
      expect.objectContaining({ id: 'slowness' }),
    ]));
  });

  it('should APPLY an ARTIFACT which ADDS a RESISTANCE', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerItems = ['light-scroll', 'fire-scroll', 'earth-scroll'];
    defenderItems = ['lightning-scroll', 'cold-scroll'];
    await prepareTest();
    expect(attackerTroops[0].unit.resistances).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ id: 'fire' }),
      expect.objectContaining({ id: 'holy' }),
      expect.objectContaining({ id: 'poison' }),
    ]));
    expect(defenderTroops[0].unit.resistances).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ id: 'lightning' }),
      expect.objectContaining({ id: 'cold' }),
    ]));
    applyArtifacts(attackerTroops, attackerArtifacts, defenderTroops, defenderArtifacts, report);
    expect(attackerTroops[0].unit.resistances).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'fire' }),
      expect.objectContaining({ id: 'holy' }),
      expect.objectContaining({ id: 'poison' }),
    ]));
    expect(defenderTroops[0].unit.resistances).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'lightning' }),
      expect.objectContaining({ id: 'cold' }),
    ]));
  });

  it('should APPLY an ARTIFACT which DAMAGES a TROOP', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerItems = ['holy-grenade'];
    defenderItems = ['vial-venom'];
    await prepareTest();
    expect(attackerTroops[0].quantity).toEqual(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toEqual(UNITS_QUANTITY);
    applyArtifacts(attackerTroops, attackerArtifacts, defenderTroops, defenderArtifacts, report);
    expect(attackerTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
  });

  it('should APPLY a CONTRACT which BONUSES a TROOP', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerHeroes = ['necrophage'];
    defenderHeroes = ['orc-king'];
    await prepareTest();
    expect(attackerTroops[0].unit.attack).toEqual(100);
    expect(attackerTroops[0].unit.attackBonus).toEqual(undefined);
    expect(attackerTroops[0].unit.defenseBonus).toEqual(undefined);
    expect(attackerTroops[0].unit.healthBonus).toEqual(undefined);
    expect(defenderTroops[0].unit.attack).toEqual(100);
    expect(defenderTroops[0].unit.attackBonus).toEqual(undefined);
    expect(defenderTroops[0].unit.defenseBonus).toEqual(undefined);
    expect(defenderTroops[0].unit.healthBonus).toEqual(undefined);
    applyContracts(attackerTroops, attackerContracts, defenderTroops, defenderContracts, report);
    expect(attackerTroops[0].unit.attack).toEqual(100);
    expect(attackerTroops[0].unit.attackBonus).toEqual(attackerContracts[0].hero.attackBonus * attackerContracts[0].level);
    expect(attackerTroops[0].unit.defenseBonus).toEqual(attackerContracts[0].hero.defenseBonus * attackerContracts[0].level);
    expect(attackerTroops[0].unit.healthBonus).toEqual(attackerContracts[0].hero.healthBonus * attackerContracts[0].level);
    expect(defenderTroops[0].unit.attack).toEqual(100);
    expect(defenderTroops[0].unit.attackBonus).toEqual(defenderContracts[0].hero.attackBonus * defenderContracts[0].level);
    expect(defenderTroops[0].unit.defenseBonus).toEqual(defenderContracts[0].hero.defenseBonus * defenderContracts[0].level);
    expect(defenderTroops[0].unit.healthBonus).toEqual(defenderContracts[0].hero.healthBonus * defenderContracts[0].level);
  });

  it('should APPLY a CONTRACT which DAMAGES a TROOP', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerHeroes = ['pyromancer'];
    defenderHeroes = ['colossus'];
    await prepareTest();
    expect(attackerTroops[0].quantity).toEqual(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toEqual(UNITS_QUANTITY);
    applyContracts(attackerTroops, attackerContracts, defenderTroops, defenderContracts, report);
    expect(attackerTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
  });

  it('should APPLY a CHARM which ADDS a SKILL', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerSpells = ['shield-light'];
    defenderSpells = ['vampirism'];
    await prepareTest();
    expect(attackerTroops[0].unit.skills).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ id: 'scales' }),
    ]));
    expect(defenderTroops[0].unit.skills).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ id: 'leech' }),
      expect.objectContaining({ id: 'flight' }),
    ]));
    applyCharms(attackerTroops, attackerCharms, defenderTroops, defenderCharms, report);
    expect(attackerTroops[0].unit.skills).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'scales' }),
    ]));
    expect(defenderTroops[0].unit.skills).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'leech' }),
      expect.objectContaining({ id: 'flight' }),
    ]));
  });

  it('should APPLY a CHARM which REMOVES a SKILL', async () => {
    attackerUnits = ['golden-dragon'];
    defenderUnits = ['phoenix'];
    attackerSpells = ['corruption'];
    defenderSpells = ['gravity'];
    await prepareTest();
    expect(attackerTroops[0].unit.skills).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'flight' }),
    ]));
    expect(defenderTroops[0].unit.skills).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'regeneration' }),
    ]));
    applyCharms(attackerTroops, attackerCharms, defenderTroops, defenderCharms, report);
    expect(attackerTroops[0].unit.skills).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ id: 'flight' }),
    ]));
    expect(defenderTroops[0].unit.skills).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ id: 'regeneration' }),
    ]));
  });

  it('should APPLY a CHARM which DAMAGES a TROOP', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    attackerSpells = ['chain-lightning'];
    defenderSpells = ['fireball'];
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
    applyBonuses(attackerTroops, defenderTroops);
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
    applyBonuses(attackerTroops, defenderTroops);
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
    applyWave(attackerTroops[0], defenderTroops[0], report, BattleType.ADVENTURE); // favors attacker in case of initiative draw
    expect(attackerTroops[0].quantity).toBe(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
  });

  it('should APPLY a WAVE versus TROOPS in SIEGE', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    await prepareTest();
    expect(attackerTroops[0].quantity).toBe(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBe(UNITS_QUANTITY);
    applyWave(attackerTroops[0], defenderTroops[0], report, BattleType.SIEGE); // favors defender in case of initiative draw
    expect(attackerTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBe(UNITS_QUANTITY);
  });

  it('should WIN an ADVENTURE', async () => {
    attackerUnits = ['skeleton', 'zombie'];
    defenderUnits = ['orc'];
    await prepareTest();
    await resolveBattle(attackerContracts, attackerTroops, attackerArtifacts, attackerCharms, defenderContracts, defenderTroops, defenderArtifacts, defenderCharms, BattleType.ADVENTURE, report);
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
    await resolveBattle(attackerContracts, attackerTroops, attackerArtifacts, attackerCharms, defenderContracts, defenderTroops, defenderArtifacts, defenderCharms, BattleType.ADVENTURE, report);
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
    await resolveBattle(attackerContracts, attackerTroops, attackerArtifacts, attackerCharms, defenderContracts, defenderTroops, defenderArtifacts, defenderCharms, BattleType.PILLAGE, report);
    expect(attackerTroops.length).toBe(1);
    expect(defenderTroops.length).toBe(0);
    expect(report.attackerPowerLost).toBe(0);
    expect(report.defenderPowerLost).toBe(0);
    expect(report.victory).toEqual(true);
  });

});
