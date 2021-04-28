import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { applyArtifacts, applyContracts, applyCharms, applyWave, BattleType, resolveBattle } from './index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('./credentials/test.json')),
};
const tester = functions(config);

const ITEMS_QUANTITY: number = 1;
const UNITS_QUANTITY: number = 100;
const HERO_LEVEL: number = 10;

describe('API', () => {
  // logs
  let logs: any[];
  // balance
  let balance: any;
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
    // logs
    logs = [];
    // balance
    balance = {
      attackerPower: 0,
      defenderPower: 0,
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
    applyArtifacts(logs, attackerTroops, attackerArtifacts, defenderTroops, defenderArtifacts, balance);
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
    applyArtifacts(logs, attackerTroops, attackerArtifacts, defenderTroops, defenderArtifacts, balance);
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
    applyArtifacts(logs, attackerTroops, attackerArtifacts, defenderTroops, defenderArtifacts, balance);
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
    applyContracts(logs, attackerTroops, attackerContracts, defenderTroops, defenderContracts, balance);
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
    applyContracts(logs, attackerTroops, attackerContracts, defenderTroops, defenderContracts, balance);
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
    applyCharms(logs, attackerTroops, attackerCharms, defenderTroops, defenderCharms, balance);
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
    applyCharms(logs, attackerTroops, attackerCharms, defenderTroops, defenderCharms, balance);
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
    applyCharms(logs, attackerTroops, attackerCharms, defenderTroops, defenderCharms, balance);
    expect(attackerTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
  });

  it('should APPLY a WAVE versus TROOPS in ADVENTURE', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    await prepareTest();
    expect(attackerTroops[0].quantity).toBe(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBe(UNITS_QUANTITY);
    applyWave(logs, attackerTroops[0], defenderTroops[0], balance, BattleType.ADVENTURE); // favors attacker in case of initiative draw
    expect(attackerTroops[0].quantity).toBe(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
  });

  it('should APPLY a WAVE versus TROOPS in SIEGE', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['orc'];
    await prepareTest();
    expect(attackerTroops[0].quantity).toBe(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBe(UNITS_QUANTITY);
    applyWave(logs, attackerTroops[0], defenderTroops[0], balance, BattleType.SIEGE); // favors defender in case of initiative draw
    expect(attackerTroops[0].quantity).toBeLessThan(UNITS_QUANTITY);
    expect(defenderTroops[0].quantity).toBe(UNITS_QUANTITY);
  });

  it('should WIN an ADVENTURE', async () => {
    attackerUnits = ['skeleton', 'zombie'];
    defenderUnits = ['orc'];
    await prepareTest();
    const battle = await resolveBattle(logs, attackerContracts, attackerTroops, attackerArtifacts, attackerCharms, defenderContracts, defenderTroops, defenderArtifacts, defenderCharms, BattleType.ADVENTURE);
    const victory = attackerTroops.length > 0 && defenderTroops.length <= 0;
    expect(attackerTroops.length).toBe(2);
    expect(defenderTroops.length).toBe(0);
    expect(battle.attackerPowerLost).toBe(0);
    expect(battle.defenderPowerLost).toBeGreaterThan(0);
    expect(victory).toEqual(true);
  });

  it('should LOSE an ADVENTURE', async () => {
    attackerUnits = ['skeleton'];
    defenderUnits = ['golden-dragon'];
    await prepareTest();
    const battle = await resolveBattle(logs, attackerContracts, attackerTroops, attackerArtifacts, attackerCharms, defenderContracts, defenderTroops, defenderArtifacts, defenderCharms, BattleType.ADVENTURE);
    const victory = attackerTroops.length > 0 && defenderTroops.length <= 0;
    expect(attackerTroops.length).toBe(0);
    expect(defenderTroops.length).toBe(1);
    expect(battle.attackerPowerLost).toBeGreaterThan(0);
    expect(battle.defenderPowerLost).toBe(0);
    expect(victory).toEqual(false);
  });

});
