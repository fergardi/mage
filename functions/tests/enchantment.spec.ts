import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType } from '../src/config';

const KINGDOM = 'TEST_ENCHANTMENT';
const OWN_ENCHANTMENT = 'climate-control';
const FORFEIT_ENCHANTMENT = 'meteor-storm';

describe('Enchantments', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM, KingdomType.WHITE, KINGDOM, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM);
    tester.cleanup();
  });

  it('should ADD the ENCHANTMENT', async () => {
    const turns = 300;
    const spell = (await admin.firestore().doc(`spells/${OWN_ENCHANTMENT}`).get()).data();
    const balanceSupplySpy = jest.spyOn(backend, 'balanceSupply');
    const balanceBonusSpy = jest.spyOn(backend, 'balanceBonus');
    await backend.addEnchantment(KINGDOM, spell, KINGDOM, turns, batch);
    await batch.commit();
    expect(balanceSupplySpy).toHaveBeenCalledTimes(6);
    expect(balanceBonusSpy).toHaveBeenCalledTimes(3);
    const enchantment = (await admin.firestore().collection(`kingdoms/${KINGDOM}/enchantments`).where('id', '==', OWN_ENCHANTMENT).limit(1).get()).docs[0];
    expect(enchantment.exists).toBe(true);
    expect(enchantment.data().turns).toBe(turns);
    const incantation = (await admin.firestore().collection(`kingdoms/${KINGDOM}/incantations`).where('id', '==', OWN_ENCHANTMENT).limit(1).get()).docs[0];
    expect(incantation.exists).toBe(true);
    expect(incantation.data().turns).toBe(turns);
  });

  it('should REMOVE the ENCHANTMENT', async () => {
    const balanceSupplySpy = jest.spyOn(backend, 'balanceSupply');
    const balanceBonusSpy = jest.spyOn(backend, 'balanceBonus');
    const enchantmentBefore = (await admin.firestore().collection(`kingdoms/${KINGDOM}/enchantments`).where('id', '==', OWN_ENCHANTMENT).limit(1).get()).docs[0];
    expect(enchantmentBefore.exists).toBe(true);
    await backend.removeEnchantment(KINGDOM, enchantmentBefore.id, batch);
    await batch.commit();
    expect(balanceSupplySpy).toHaveBeenCalledTimes(6);
    expect(balanceBonusSpy).toHaveBeenCalledTimes(3);
    const enchantmentAfter = (await admin.firestore().collection(`kingdoms/${KINGDOM}/enchantments`).where('id', '==', OWN_ENCHANTMENT).limit(1).get()).docs[0];
    expect(enchantmentAfter).not.toBeDefined();
  });

  it('should BREAK the ENCHANTMENT', async () => {
    const turns = 300;
    const balanceSupplySpy = jest.spyOn(backend, 'balanceSupply');
    const balanceBonusSpy = jest.spyOn(backend, 'balanceBonus');
    const spell = (await admin.firestore().doc(`spells/${FORFEIT_ENCHANTMENT}`).get()).data();
    await backend.addEnchantment(KINGDOM, spell, KINGDOM, turns, batch);
    await batch.commit();
    const incantation = (await admin.firestore().collection(`kingdoms/${KINGDOM}/incantations`).where('id', '==', FORFEIT_ENCHANTMENT).limit(1).get()).docs[0];
    expect((await backend.breakEnchantment(KINGDOM, incantation.id) as any).success).toBe(true);
    expect(balanceSupplySpy).toHaveBeenCalledTimes(12);
    expect(balanceBonusSpy).toHaveBeenCalledTimes(6);
  });

});
