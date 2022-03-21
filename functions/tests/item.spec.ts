import 'jest';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { tester } from './config';
import { KingdomType } from '../src/config';

const KINGDOM_SOURCE = 'TEST_ITEM_SOURCE';
const KINGDOM_TARGET = 'TEST_ITEM_TARGET';

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

  it.each([
    'necronomicon',
    'enchanted-lamp',
    'demon-horn',
    'lightning-orb',
    'dragon-egg',
    'cold-orb',
    'earth-orb',
    'fire-orb',
    'light-orb',
    'animal-fang',
    'bone-necklace',
    'golem-book',
    'magic-beans',
    'snake-eye',
    'valhalla-horn',
  ])('should ACTIVATE the ITEM %s for TROOP', async (id) => {
    const item = (await admin.firestore().doc(`items/${id}`).get()).data();
    const addTroopSpy = jest.spyOn(backend, 'addTroop');
    const activated = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(activated.unit).toContain('unit.');
    expect(activated.size).toBeGreaterThan(0);
    expect(addTroopSpy).toHaveBeenCalled();
  });

  it.each([
    'treasure-chest',
    //'mana-potion',
    'love-potion',
    'voodoo-doll',
    'letter-thieves',
    'magic-compass',
    //'mana-vortex',
    'rotten-food',
  ])('should ACTIVATE the ITEM %s for RESOURCE', async (id) => {
    const item = (await admin.firestore().doc(`items/${id}`).get()).data();
    const addSupplySpy = jest.spyOn(backend, 'addSupply');
    const activated = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(activated.resource).toContain('resource.');
    expect(activated.amount).not.toBe(0);
    expect(addSupplySpy).toHaveBeenCalled();
  });

  it.each([
    'treasure-map',
  ])('should ACTIVATE the ITEM %s for ITEM', async (id) => {
    const item = (await admin.firestore().doc(`items/${id}`).get()).data();
    const addArtifactSpy = jest.spyOn(backend, 'addArtifact');
    const activated: any = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(activated.item).toContain('item.');
    expect(activated.quantity).toBeGreaterThan(0);
    expect(addArtifactSpy).toHaveBeenCalled();
  });

  it.each([
    'cursed-skull',
    'cursed-mask',
    'cursed-idol',
    'lucky-coin',
    'lucky-horseshoe',
    'lucky-paw',
    //'rattle',
  ])('should ACTIVATE the ITEM %s for ENCHANTMENT', async (id) => {
    const item = (await admin.firestore().doc(`items/${id}`).get()).data();
    const addEnchantmentSpy = jest.spyOn(backend, 'addEnchantment');
    const activated: any = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(activated.enchantment).toContain('spell.');
    expect(activated.turns).toBeGreaterThan(0);
    expect(addEnchantmentSpy).toHaveBeenCalled();
  });

  it.each([
    'rattle',
  ])('should ACTIVATE the ITEM %s for DISENCHANTMENT', async (id) => {
    const item = (await admin.firestore().doc(`items/${id}`).get()).data();
    const addEnchantmentSpy = jest.spyOn(backend, 'addEnchantment');
    const activated: any = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(activated.enchantments).toBeGreaterThanOrEqual(0);
    expect(addEnchantmentSpy).toHaveBeenCalled();
  });

  it.each([
    'crystal-ball',
  ])('should ACTIVATE the ITEM %s for ESPIONAGE', async (id) => {
    const item = (await admin.firestore().doc(`items/${id}`).get()).data();
    const spyKingdomSpy = jest.spyOn(backend, 'spyKingdom');
    const activated: any = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(activated.timestamp).toBeGreaterThan(0);
    expect(spyKingdomSpy).toHaveBeenCalled();
  });

  it.each([
    'wisdom-tome',
  ])('should ACTIVATE the ITEM %s for SPELL', async (id) => {
    const item = (await admin.firestore().doc(`items/${id}`).get()).data();
    const addCharmSpy = jest.spyOn(backend, 'addCharm');
    const activated: any = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(activated.spell).toContain('spell.');
    expect(addCharmSpy).toHaveBeenCalled();
  });

});
