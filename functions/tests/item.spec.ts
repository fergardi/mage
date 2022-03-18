import 'jest';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { tester } from './config';
import { KingdomType } from '../src/config';

const KINGDOM_SOURCE = 'TEST_ITEM_SOURCE';
const KINGDOM_TARGET = 'TEST_ITEM_TARGET';
const ITEM_RESOURCE = 'treasure-chest';
const ITEM_UNIT = 'cold-orb';
const ITEM_ITEM = 'treasure-map';
const ITEM_ENCHANTMENT = 'cursed-skull';
const ITEM_DISENCHANTMENT = 'rattle';
const ITEM_ESPIONAGE = 'crystal-ball';
const ITEM_SPELL = 'wisdom-tome';

describe('Items', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM_SOURCE, KingdomType.BLUE, KINGDOM_SOURCE, 0, 0);
    await backend.createKingdom(KINGDOM_TARGET, KingdomType.GREEN, KINGDOM_TARGET, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM_SOURCE);
    await backend.deleteKingdom(KINGDOM_TARGET);
    tester.cleanup();
  });

  it('should ACTIVATE the ITEM for TROOP', async () => {
    const item = (await admin.firestore().doc(`items/${ITEM_UNIT}`).get()).data();
    const addTroopSpy = jest.spyOn(backend, 'addTroop');
    const result = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(result.unit).toBe('unit.ice-elemental.name');
    expect(result.size).toBeGreaterThan(0);
    expect(addTroopSpy).toHaveBeenCalled();
  });

  it('should ACTIVATE the ITEM for RESOURCE', async () => {
    const item = (await admin.firestore().doc(`items/${ITEM_RESOURCE}`).get()).data();
    const addSupplySpy = jest.spyOn(backend, 'addSupply');
    const result = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(result.resource).toBe('resource.gold.name');
    expect(result.amount).toBeGreaterThan(0);
    expect(addSupplySpy).toHaveBeenCalled();
  });

  it('should ACTIVATE the ITEM for ITEM', async () => {
    const item = (await admin.firestore().doc(`items/${ITEM_ITEM}`).get()).data();
    const addArtifactSpy = jest.spyOn(backend, 'addArtifact');
    const conjured: any = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(conjured.item).toContain('item.');
    expect(conjured.quantity).toBeGreaterThan(0);
    expect(addArtifactSpy).toHaveBeenCalled();
  });

  it('should ACTIVATE the ITEM for ENCHANTMENT', async () => {
    const item = (await admin.firestore().doc(`items/${ITEM_ENCHANTMENT}`).get()).data();
    const addEnchantmentSpy = jest.spyOn(backend, 'addEnchantment');
    const conjured: any = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(conjured.enchantment).toContain('spell.');
    expect(conjured.turns).toBeGreaterThan(0);
    expect(addEnchantmentSpy).toHaveBeenCalled();
  });

  it('should ACTIVATE the ITEM for DISENCHANTMENT', async () => {
    const item = (await admin.firestore().doc(`items/${ITEM_DISENCHANTMENT}`).get()).data();
    const addEnchantmentSpy = jest.spyOn(backend, 'addEnchantment');
    const conjured: any = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(conjured.enchantments).toBeGreaterThanOrEqual(0);
    expect(addEnchantmentSpy).toHaveBeenCalled();
  });

  it('should ACTIVATE the ITEM for ESPIONAGE', async () => {
    const item = (await admin.firestore().doc(`items/${ITEM_ESPIONAGE}`).get()).data();
    const spyKingdomSpy = jest.spyOn(backend, 'spyKingdom');
    const conjured: any = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(conjured.timestamp).toBeGreaterThan(0);
    expect(spyKingdomSpy).toHaveBeenCalled();
  });

  it('should ACTIVATE the ITEM for SPELL', async () => {
    const item = (await admin.firestore().doc(`items/${ITEM_SPELL}`).get()).data();
    const addCharmSpy = jest.spyOn(backend, 'addCharm');
    const conjured: any = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(conjured.spell).toContain('spell.');
    expect(addCharmSpy).toHaveBeenCalled();
  });

});
