import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType } from '../src/config';

const KINGDOM_SOURCE = 'TEST_SPELL_SOURCE';
const KINGDOM_TARGET = 'TEST_SPELL_TARGET';

describe('Spells', () => {
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

  it.each([
    'animate-skeleton',
    'animate-zombie',
    'animate-ghoul',
    'night-living-dead',
    'summon-wraith',
    'summon-lich',
    'summon-vampire',
    'call-berserker',
    'call-orc',
    'summon-minotaur',
    'summon-ogre',
    'summon-lizardman',
    'call-cyclop',
    'call-frost-giant',
    'call-cave-troll',
    'call-yeti',
    'summon-mage',
    'summon-medusa',
    'summon-djinni',
    'conjure-elemental',
    'beast-council',
    'summon-spider',
    'call-carnivorous-plant',
    'call-centaur',
    'call-elf',
    'summon-werebear',
    'summon-druid',
    'call-pegasus',
    'call-knight',
    'call-templar',
    'prayer',
    'summon-angel',
    'summon-titan',
    'summon-monk',
  ])('should CONJURE the SPELL %s for TROOP', async (id) => {
    const spell = (await admin.firestore().doc(`spells/${id}`).get()).data();
    const addTroopSpy = jest.spyOn(backend, 'addTroop');
    const conjured: any = await backend.conjureSpell(KINGDOM_SOURCE, spell, KINGDOM_TARGET, batch);
    expect(conjured.unit).toContain('unit.');
    expect(conjured.size).toBeGreaterThan(0);
    expect(addTroopSpy).toHaveBeenCalled();
  });

  it.each([
    //'destroy-artifact',
    'steal-artifact',
    'locate-artifact',
  ])('should CONJURE the SPELL %s for ITEM', async (id) => {
    const spell = (await admin.firestore().doc(`spells/${id}`).get()).data();
    const addArtifactSpy = jest.spyOn(backend, 'addArtifact');
    const conjured: any = await backend.conjureSpell(KINGDOM_SOURCE, spell, KINGDOM_TARGET, batch);
    expect(conjured.item).toContain('item.');
    expect(conjured.quantity).toBeGreaterThan(0);
    expect(addArtifactSpy).toHaveBeenCalled();
  });

  it.each([
    'death-decay',
    'shroud-darkness',
    'soul-pact',
    'plague',
    'blood-ritual',
    'meteor-storm',
    'fire-wall',
    'concentration',
    'confuse',
    'ice-wall',
    'laziness',
    'druidism',
    'climate-control',
    'locust-swarm',
    'natures-favor',
    //'serenity',
    'sunray',
    'divine-protection',
    'peace-prosperity',
  ])('should CONJURE the SPELL %s for ENCHANTMENT', async (id) => {
    const spell = (await admin.firestore().doc(`spells/${id}`).get()).data();
    const addEnchantmentSpy = jest.spyOn(backend, 'addEnchantment');
    const conjured: any = await backend.conjureSpell(KINGDOM_SOURCE, spell, KINGDOM_TARGET, batch);
    expect(conjured.enchantment).toContain('spell.');
    expect(conjured.turns).toBeGreaterThan(0);
    expect(addEnchantmentSpy).toHaveBeenCalled();
  });

  it.each([
    'serenity',
  ])('should CONJURE the SPELL %s for DISENCHANTMENT', async (id) => {
    const spell = (await admin.firestore().doc(`spells/${id}`).get()).data();
    const addEnchantmentSpy = jest.spyOn(backend, 'addEnchantment');
    const conjured: any = await backend.conjureSpell(KINGDOM_SOURCE, spell, KINGDOM_TARGET, batch);
    expect(conjured.enchantments).toBeGreaterThanOrEqual(0);
    expect(addEnchantmentSpy).toHaveBeenCalled();
  });

  it.each([
    'spy',
  ])('should CONJURE the SPELL %s for ESPIONAGE', async (id) => {
    const spell = (await admin.firestore().doc(`spells/${id}`).get()).data();
    const spyKingdomSpy = jest.spyOn(backend, 'spyKingdom');
    const conjured: any = await backend.conjureSpell(KINGDOM_SOURCE, spell, KINGDOM_TARGET, batch);
    expect(conjured.timestamp).toBeGreaterThan(0);
    expect(spyKingdomSpy).toHaveBeenCalled();
  });
  
});
