import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as backend from '../index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'SUPPLY';

describe(KINGDOM, () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM, backend.KingdomType.BLACK, KINGDOM, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM);
    tester.cleanup();
  });

  it('should CHARGE the MANA', async () => {
    const result = await backend.chargeMana(KINGDOM, 1);
    expect(result.mana).toBe(500);
  });

  it('should TAX the GOLD', async () => {
    const result = await backend.taxGold(KINGDOM, 1);
    expect(result.gold).toBe(0);
  });

  it('should EXPLORE the LANDS', async () => {
    const result = await backend.exploreLands(KINGDOM, 1);
    expect(result.lands).toBe(32);
  });

  it('should BALANCE the SUPPLY', async () => {
    jest.spyOn(batch, 'update');
    await backend.balanceSupply(KINGDOM, backend.SupplyType.GEM, 10, batch);
    expect(batch.update).toHaveBeenCalled();
  });

  it('should BALANCE the POWER', async () => {
    jest.spyOn(batch, 'update');
    await backend.balancePower(KINGDOM, 1000, batch);
    expect(batch.update).toHaveBeenCalled();
  });

  it('should BALANCE the BONUS', async () => {
    jest.spyOn(batch, 'update');
    await backend.balanceBonus(KINGDOM, backend.BonusType.EXPLORE, 10, batch);
    expect(batch.update).toHaveBeenCalled();
    await backend.balanceBonus(KINGDOM, backend.BonusType.BUILD, 10, batch);
    expect(batch.update).toHaveBeenCalled();
    await backend.balanceBonus(KINGDOM, backend.BonusType.RESEARCH, 10, batch);
    expect(batch.update).toHaveBeenCalled();
  });

  it('should PAY the MAINTENANCES', async () => {
    jest.spyOn(batch, 'update');
    await backend.payMaintenance(KINGDOM, 1, batch);
    expect(batch.update).toHaveBeenCalled();
  });

});
