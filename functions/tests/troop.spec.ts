import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType } from '../src/config';

const KINGDOM = 'TEST_TROOP';
const UNIT = 'archer';
const UNIT_UNDISBANDABLE = 'devil';

describe('Troops', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM, KingdomType.GREEN, KINGDOM, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM);
    tester.cleanup();
  });

  it.each([
    'cavalry',
    'fanatic',
    'pikeman',
    'fighter',
    'archer',
  ])('should RECRUIT the TROOP %s', async (unit) => {
    const quantity = 100;
    const result = await backend.recruitUnit(KINGDOM, unit, quantity);
    expect(result.quantity).toBe(quantity);
  });

  it.each([
    'lightning-elemental',
    'wraith',
    'bone-dragon',
    'nightmare',
    'ghoul',
    'lich',
    'skeleton',
    'vampire',
    'werewolf',
    'zombie',
    'blue-dragon',
    'siren',
    'djinni',
    'frost-giant',
    'ice-elemental',
    'cave-troll',
    'medusa',
    'leviathan',
    'mage',
    'yeti',
    'lizardman',
    'spider',
    'centaur',
    'elf',
    'golden-dragon',
    'werebear',
    'druid',
    'carnivorous-plant',
    'earth-elemental',
    'hydra',
    'cyclop',
    'minotaur',
    'devil',
    'fire-elemental',
    'berserker',
    'ogre',
    'orc',
    'phoenix',
    'red-dragon',
    'griffon',
    'behemoth',
    'white-dragon',
    'angel',
    'knight',
    'light-elemental',
    'titan',
    'monk',
    'templar',
    'pegasus',
    'paladin',
    'sheep',
    'trained-elephant',
    'iron-golem',
    'stone-golem',
    'meat-golem',
    'wood-golem',
    'crystal-golem',
    'baby-dragon',
    'air-elemental',
    'water-elemental',
  ])('should NOT RECTRUIT the TROOP %s', async (unit) => {
    await expect(backend.recruitUnit(KINGDOM, unit, 1)).rejects.toThrowError();
  });

  it('should ADD the TROOP', async () => {
    const quantity = 100;
    const unit = (await admin.firestore().doc(`units/${UNIT}`).get()).data();
    await backend.addTroop(KINGDOM, unit, quantity, batch);
    await batch.commit();
    const troop = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).where('id', '==', UNIT).limit(1).get()).docs[0].data();
    expect(troop.quantity).toBe(200);
  });

  it('should ASSIGN the ARMY', async () => {
    const troop = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).where('id', '==', UNIT).limit(1).get()).docs[0];
    const troopBefore = troop.data();
    expect(troopBefore.assignment).toBe(0);
    expect(troopBefore.sort).toBe(0);
    troopBefore.troopId = troop.id;
    troopBefore.assignment = 2;
    troopBefore.sort = 1;
    await backend.assignArmy(KINGDOM, [troopBefore]);
    const troopAfter = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).where('id', '==', UNIT).limit(1).get()).docs[0].data();
    expect(troopAfter.assignment).toBe(2);
    expect(troopAfter.sort).toBe(1);
  });

  it('should DISBAND the TROOP', async () => {
    const troop = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).where('id', '==', UNIT).limit(1).get()).docs[0];
    const result = await backend.disbandTroop(KINGDOM, troop.id, 100);
    expect(result.quantity).toBe(100);
  });

  it('should NOT DISBAND the TROOP', async () => {
    const troopBefore = (await admin.firestore().doc(`units/${UNIT_UNDISBANDABLE}`).get()).data();
    await backend.addTroop(KINGDOM, troopBefore, 100, batch);
    await batch.commit();
    const troop = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).where('id', '==', UNIT_UNDISBANDABLE).limit(1).get()).docs[0];
    await expect(backend.disbandTroop(KINGDOM, troop.id, 100)).rejects.toThrowError();
  });

  it('should REMOVE the TROOP', async () => {
    const troop = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).where('id', '==', UNIT).limit(1).get()).docs[0];
    expect(troop.data().quantity).toBe(100);
    jest.spyOn(batch, 'update');
    await backend.removeTroop(KINGDOM, troop.id, 50, batch);
    expect(batch.update).toHaveBeenCalled();
    await batch.commit();
    batch = admin.firestore().batch();
    jest.spyOn(batch, 'delete');
    await backend.removeTroop(KINGDOM, troop.id, 50, batch);
    expect(batch.delete).toHaveBeenCalled();
    await batch.commit();
  });

});
