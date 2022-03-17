import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType } from '../src/config';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-b1c51.firebaseio.com',
  projectId: 'mage-b1c51',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM_SOURCE = 'TEST_SPELL_SOURCE';
const KINGDOM_TARGET = 'TEST_SPELL_TARGET';
const SPELL_UNIT = 'animate-skeleton';
const SPELL_ITEM = 'locate-artifact';
const SPELL_ENCHANTMENT = 'meteor-storm';
const SPELL_DISENCHANTMENT = 'serenity';
const SPELL_ESPIONAGE = 'spy';

describe(KINGDOM_SOURCE + ' -> ' + KINGDOM_TARGET, () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM_SOURCE, KingdomType.WHITE, KINGDOM_SOURCE, 0, 0);
    await backend.createKingdom(KINGDOM_TARGET, KingdomType.RED, KINGDOM_TARGET, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM_SOURCE);
    await backend.deleteKingdom(KINGDOM_TARGET);
    tester.cleanup();
  });

  it('should CONJURE the SPELL for TROOP', async () => {
    const spell = (await admin.firestore().doc(`spells/${SPELL_UNIT}`).get()).data();
    const addTroopSpy = jest.spyOn(backend, 'addTroop');
    const conjured: any = await backend.conjureSpell(KINGDOM_SOURCE, spell, KINGDOM_TARGET, batch);
    expect(conjured.unit).toBe('unit.skeleton.name');
    expect(conjured.size).toBeGreaterThan(0);
    expect(addTroopSpy).toHaveBeenCalled();
  });

  it('should CONJURE the SPELL for ITEM', async () => {
    const spell = (await admin.firestore().doc(`spells/${SPELL_ITEM}`).get()).data();
    const addArtifactSpy = jest.spyOn(backend, 'addArtifact');
    const conjured: any = await backend.conjureSpell(KINGDOM_SOURCE, spell, KINGDOM_TARGET, batch);
    expect(conjured.item).toContain('item.');
    expect(conjured.quantity).toBeGreaterThan(0);
    expect(addArtifactSpy).toHaveBeenCalled();
  });

  it('should CONJURE the SPELL for ENCHANTMENT', async () => {
    const spell = (await admin.firestore().doc(`spells/${SPELL_ENCHANTMENT}`).get()).data();
    const addEnchantmentSpy = jest.spyOn(backend, 'addEnchantment');
    const conjured: any = await backend.conjureSpell(KINGDOM_SOURCE, spell, KINGDOM_TARGET, batch);
    expect(conjured.enchantment).toContain('spell.meteor-storm.name');
    expect(conjured.turns).toBeGreaterThan(0);
    expect(addEnchantmentSpy).toHaveBeenCalled();
  });

  it('should CONJURE the SPELL for DISENCHANTMENT', async () => {
    const spell = (await admin.firestore().doc(`spells/${SPELL_DISENCHANTMENT}`).get()).data();
    const addEnchantmentSpy = jest.spyOn(backend, 'addEnchantment');
    const conjured: any = await backend.conjureSpell(KINGDOM_SOURCE, spell, KINGDOM_TARGET, batch);
    expect(conjured.enchantments).toBeGreaterThanOrEqual(0);
    expect(addEnchantmentSpy).toHaveBeenCalled();
  });

  it('should CONJURE the SPELL for SPIONAGE', async () => {
    const spell = (await admin.firestore().doc(`spells/${SPELL_ESPIONAGE}`).get()).data();
    const spyKingdomSpy = jest.spyOn(backend, 'spyKingdom');
    const conjured: any = await backend.conjureSpell(KINGDOM_SOURCE, spell, KINGDOM_TARGET, batch);
    expect(conjured.timestamp).toBeGreaterThan(0);
    expect(spyKingdomSpy).toHaveBeenCalled();
  });
  
});
