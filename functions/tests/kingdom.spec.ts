import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import {
  createKingdom,
  KingdomType,
  chargeMana,
  taxGold,
  exploreLands,
  balanceSupply,
  balancePower,
  balanceBonus,
  SupplyType,
  BonusType,
  payMaintenance,
  addTroop,
  // disbandTroop,
  // removeTroop,
} from '../index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const USERNAME = 'test';

describe('KINGDOM', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeEach(() => {
    batch = admin.firestore().batch();
  })

  afterAll(() => {
    tester.cleanup();
  });

  it('should DELETE the KINGDOM', async () => {
    try {
      const artifacts = await admin.firestore().collection(`kingdoms/${USERNAME}/artifacts`).listDocuments();
      artifacts.forEach(artifact => batch.delete(artifact));
      const contracts = await admin.firestore().collection(`kingdoms/${USERNAME}/contracts`).listDocuments();
      contracts.forEach(contract => batch.delete(contract));
      const buildings = await admin.firestore().collection(`kingdoms/${USERNAME}/buildings`).listDocuments();
      buildings.forEach(building => batch.delete(building));
      const troops = await admin.firestore().collection(`kingdoms/${USERNAME}/troops`).listDocuments();
      troops.forEach(troop => batch.delete(troop));
      const supplies = await admin.firestore().collection(`kingdoms/${USERNAME}/supplies`).listDocuments();
      supplies.forEach(supply => batch.delete(supply));
      batch.delete(admin.firestore().doc(`kingdoms/${USERNAME}`));
      await batch.commit();
    } catch (error) {
      console.info(error);
    }
  });

  it('should CREATE the KINGDOM', async () => {
    await createKingdom(USERNAME, KingdomType.BLACK, USERNAME, 0, 0);
    expect((await admin.firestore().doc(`kingdoms/${USERNAME}`).get()).exists).toBe(true);
  });

  it('should CHARGE the MANA', async () => {
    const result = await chargeMana(USERNAME, 1);
    expect(result.mana).toBe(500);
  });

  it('should TAX the GOLD', async () => {
    const result = await taxGold(USERNAME, 1);
    expect(result.gold).toBe(0);
  });

  it('should EXPLORE the LANDS', async () => {
    const result = await exploreLands(USERNAME, 1);
    expect(result.lands).toBe(32);
  });

  it('should BALANCE the SUPPLY', async () => {
    jest.spyOn(batch, 'update');
    await balanceSupply('test', SupplyType.GEM, 10, batch);
    expect(batch.update).toHaveBeenCalled();
  });

  it('should BALANCE the POWER', async () => {
    jest.spyOn(batch, 'update');
    await balancePower('test', 1000, batch);
    expect(batch.update).toHaveBeenCalled();
  });

  it('should BALANCE the BONUS', async () => {
    jest.spyOn(batch, 'update');
    await balanceBonus('test', BonusType.EXPLORE, 10, batch);
    expect(batch.update).toHaveBeenCalled();
    await balanceBonus('test', BonusType.BUILD, 10, batch);
    expect(batch.update).toHaveBeenCalled();
    await balanceBonus('test', BonusType.RESEARCH, 10, batch);
    expect(batch.update).toHaveBeenCalled();
  });

  it('should PAY the MAINTENANCES', async () => {
    jest.spyOn(batch, 'update');
    await payMaintenance('test', 1, batch);
    expect(batch.update).toHaveBeenCalled();
  });

  it('should ADD the TROOP', async () => {
    jest.spyOn(batch, 'create');
    await addTroop(USERNAME, { id: 'skeleton' }, 100, batch);
    expect(batch.create).toHaveBeenCalled();
    jest.spyOn(batch, 'update');
    await addTroop(USERNAME, { id: 'skeleton' }, 100, batch);
    expect(batch.update).toHaveBeenCalled();
  });

});
