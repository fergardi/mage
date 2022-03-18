import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType, SupplyType, BonusType } from '../src/config';

const KINGDOM = 'TEST_SUPPLY';

describe('Supplies', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM, KingdomType.BLACK, KINGDOM, 0, 0);
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
    await backend.balanceSupply(KINGDOM, SupplyType.GEM, 10, batch);
    expect(batch.update).toHaveBeenCalled();
  });

  it('should BALANCE the POWER', async () => {
    jest.spyOn(batch, 'update');
    await backend.balancePower(KINGDOM, 1000, batch);
    expect(batch.update).toHaveBeenCalled();
  });

  it('should BALANCE the BONUS', async () => {
    jest.spyOn(batch, 'update');
    await backend.balanceBonus(KINGDOM, BonusType.EXPLORE, 10, batch);
    expect(batch.update).toHaveBeenCalled();
    await backend.balanceBonus(KINGDOM, BonusType.BUILD, 10, batch);
    expect(batch.update).toHaveBeenCalled();
    await backend.balanceBonus(KINGDOM, BonusType.RESEARCH, 10, batch);
    expect(batch.update).toHaveBeenCalled();
  });

  it('should PAY the MAINTENANCES', async () => {
    jest.spyOn(batch, 'update');
    await backend.payMaintenance(KINGDOM, 1, batch);
    expect(batch.update).toHaveBeenCalled();
  });

});
