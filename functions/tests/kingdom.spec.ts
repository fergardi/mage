import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { createKingdom, KingdomType, chargeMana, taxGold, exploreLands, balanceSupply, balancePower, balanceBonus, SupplyType, BonusType, payMaintenance } from '../index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'kingdom';

describe.skip('KINGDOM', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeEach(() => {
    batch = admin.firestore().batch();
  })

  afterAll(() => {
    tester.cleanup();
  });

  it('should CREATE the KINGDOM', async () => {
    await createKingdom(KINGDOM, KingdomType.BLACK, KINGDOM, 0, 0);
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(true);
  });

  it('should CHARGE the MANA', async () => {
    const result = await chargeMana(KINGDOM, 1);
    expect(result.mana).toBe(500);
  });

  it('should TAX the GOLD', async () => {
    const result = await taxGold(KINGDOM, 1);
    expect(result.gold).toBe(0);
  });

  it('should EXPLORE the LANDS', async () => {
    const result = await exploreLands(KINGDOM, 1);
    expect(result.lands).toBe(32);
  });

  it('should BALANCE the SUPPLY', async () => {
    jest.spyOn(batch, 'update');
    await balanceSupply(KINGDOM, SupplyType.GEM, 10, batch);
    expect(batch.update).toHaveBeenCalled();
  });

  it('should BALANCE the POWER', async () => {
    jest.spyOn(batch, 'update');
    await balancePower(KINGDOM, 1000, batch);
    expect(batch.update).toHaveBeenCalled();
  });

  it('should BALANCE the BONUS', async () => {
    jest.spyOn(batch, 'update');
    await balanceBonus(KINGDOM, BonusType.EXPLORE, 10, batch);
    expect(batch.update).toHaveBeenCalled();
    await balanceBonus(KINGDOM, BonusType.BUILD, 10, batch);
    expect(batch.update).toHaveBeenCalled();
    await balanceBonus(KINGDOM, BonusType.RESEARCH, 10, batch);
    expect(batch.update).toHaveBeenCalled();
  });

  it('should PAY the MAINTENANCES', async () => {
    jest.spyOn(batch, 'update');
    await payMaintenance(KINGDOM, 1, batch);
    expect(batch.update).toHaveBeenCalled();
  });

  it('should DELETE the KINGDOM', async () => {
    const artifacts = await admin.firestore().collection(`kingdoms/${KINGDOM}/artifacts`).listDocuments();
    artifacts.forEach(artifact => batch.delete(artifact));
    const contracts = await admin.firestore().collection(`kingdoms/${KINGDOM}/contracts`).listDocuments();
    contracts.forEach(contract => batch.delete(contract));
    const buildings = await admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).listDocuments();
    buildings.forEach(building => batch.delete(building));
    const troops = await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).listDocuments();
    troops.forEach(troop => batch.delete(troop));
    const supplies = await admin.firestore().collection(`kingdoms/${KINGDOM}/supplies`).listDocuments();
    supplies.forEach(supply => batch.delete(supply));
    const charms = await admin.firestore().collection(`kingdoms/${KINGDOM}/charms`).listDocuments();
    charms.forEach(charm => batch.delete(charm));
    const letters = await admin.firestore().collection(`kingdoms/${KINGDOM}/letters`).listDocuments();
    letters.forEach(letter => batch.delete(letter));
    batch.delete(admin.firestore().doc(`kingdoms/${KINGDOM}`));
    await batch.commit();
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(false);
  });

});
