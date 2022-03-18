import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType } from '../src/config';

const KINGDOM = 'TEST_TROOP';
const UNIT = 'archer';
const UNIT_UNRECRUITABLE = 'vampire';
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

  it('should ADD the TROOP', async () => {
    const troop = (await admin.firestore().doc(`units/${UNIT}`).get()).data();
    jest.spyOn(batch, 'create');
    await backend.addTroop(KINGDOM, troop, 100, batch);
    expect(batch.create).toHaveBeenCalled();
    await batch.commit();
    batch = admin.firestore().batch();
    jest.spyOn(batch, 'update');
    await backend.addTroop(KINGDOM, troop, 100, batch);
    expect(batch.update).toHaveBeenCalled();
    await batch.commit();
  });

  it('should NOT ADD the TROOP', async () => {
    await expect(backend.recruitUnit(KINGDOM, UNIT_UNRECRUITABLE, 100)).rejects.toThrowError();
  });

  it('should REMOVE the TROOP', async () => {
    const troop = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).where('id', '==', UNIT).limit(1).get()).docs[0];
    expect(troop.data().quantity).toBe(200);
    jest.spyOn(batch, 'update');
    await backend.removeTroop(KINGDOM, troop.id, 100, batch);
    expect(batch.update).toHaveBeenCalled();
    await batch.commit();
    batch = admin.firestore().batch();
    jest.spyOn(batch, 'delete');
    await backend.removeTroop(KINGDOM, troop.id, 100, batch);
    expect(batch.delete).toHaveBeenCalled();
    await batch.commit();
  });

  it('should RECRUIT the TROOP', async () => {
    const result = await backend.recruitUnit(KINGDOM, UNIT, 100);
    expect(result.quantity).toBe(100);
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
    expect(result?.quantity).toBe(100);
  });

  it('should ADD the TROOP', async () => {
    const troop = (await admin.firestore().doc(`units/${UNIT_UNDISBANDABLE}`).get()).data();
    jest.spyOn(batch, 'create');
    await backend.addTroop(KINGDOM, troop, 100, batch);
    expect(batch.create).toHaveBeenCalled();
    await batch.commit();
  });

  it('should NOT DISBAND the TROOP', async () => {
    const troop = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).where('id', '==', UNIT_UNDISBANDABLE).limit(1).get()).docs[0];
    await expect(backend.disbandTroop(KINGDOM, troop.id, 100)).rejects.toThrowError();
  });

});
