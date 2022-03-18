import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType } from '../src/config';

const KINGDOM = 'TEST_CONTRACT';
const HERO = 'dragon-rider';

describe('Contracts', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM, KingdomType.RED, KINGDOM, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM);
    tester.cleanup();
  });

  it('should ADD the CONTRACT', async () => {
    const contract = (await admin.firestore().doc(`heroes/${HERO}`).get()).data();
    jest.spyOn(batch, 'create');
    await backend.addContract(KINGDOM, contract, 1, batch);
    expect(batch.create).toHaveBeenCalled();
    await batch.commit();
    batch = admin.firestore().batch();
    jest.spyOn(batch, 'update');
    await backend.addContract(KINGDOM, contract, 1, batch);
    expect(batch.update).toHaveBeenCalled();
    await batch.commit();
  });

  it('should REMOVE the CONTRACT', async () => {
    const contract = (await admin.firestore().collection(`kingdoms/${KINGDOM}/contracts`).where('id', '==', HERO).limit(1).get()).docs[0];
    expect(contract.data().level).toBe(2);
    jest.spyOn(batch, 'delete');
    await backend.removeContract(KINGDOM, contract.id, batch);
    expect(batch.delete).toHaveBeenCalled();
    await batch.commit();
  });

  it('should ADD the CONTRACT', async () => {
    const contract = (await admin.firestore().doc(`heroes/${HERO}`).get()).data();
    jest.spyOn(batch, 'create');
    await backend.addContract(KINGDOM, contract, 1, batch);
    expect(batch.create).toHaveBeenCalled();
    await batch.commit();
  });

  it('should ASSIGN the CONTRACT', async () => {
    const contractBefore = (await admin.firestore().collection(`kingdoms/${KINGDOM}/contracts`).where('id', '==', HERO).limit(1).get()).docs[0];
    expect(contractBefore.data().assignment).toBe(0);
    await backend.assignContract(KINGDOM, contractBefore.id, 2);
    const contractAfter = (await admin.firestore().collection(`kingdoms/${KINGDOM}/contracts`).where('id', '==', HERO).limit(1).get()).docs[0];
    expect(contractAfter.data().assignment).toBe(2);
  });

  it('should DISCHARGE the CONTRACT', async () => {
    const contract = (await admin.firestore().collection(`kingdoms/${KINGDOM}/contracts`).where('id', '==', HERO).limit(1).get()).docs[0];
    expect(contract.data().level).toBe(1);
    await backend.dischargeContract(KINGDOM, contract.id);
  });

});
