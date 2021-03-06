import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { createKingdom, KingdomType, addContract, removeContract, dischargeContract, assignContract } from '../index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'contract';
const HERO = 'dragon-rider';

describe.skip('CONTRACT', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeEach(() => {
    batch = admin.firestore().batch();
  })

  afterAll(() => {
    tester.cleanup();
  });

  it('should CREATE the KINGDOM', async () => {
    await createKingdom(KINGDOM, KingdomType.RED, KINGDOM, 0, 0);
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(true);
  });

  it('should ADD the CONTRACT', async () => {
    const contract = (await admin.firestore().doc(`heroes/${HERO}`).get()).data();
    jest.spyOn(batch, 'create');
    await addContract(KINGDOM, contract, 1, batch);
    expect(batch.create).toHaveBeenCalled();
    await batch.commit();
    batch = admin.firestore().batch();
    jest.spyOn(batch, 'update');
    await addContract(KINGDOM, contract, 1, batch);
    expect(batch.update).toHaveBeenCalled();
    await batch.commit();
  });

  it('should REMOVE the CONTRACT', async () => {
    const contract = (await admin.firestore().collection(`kingdoms/${KINGDOM}/contracts`).where('id', '==', HERO).limit(1).get()).docs[0];
    expect(contract.data().level).toBe(2);
    jest.spyOn(batch, 'delete');
    await removeContract(KINGDOM, contract.id, batch);
    expect(batch.delete).toHaveBeenCalled();
    await batch.commit();
  });

  it('should ADD the CONTRACT', async () => {
    const contract = (await admin.firestore().doc(`heroes/${HERO}`).get()).data();
    jest.spyOn(batch, 'create');
    await addContract(KINGDOM, contract, 1, batch);
    expect(batch.create).toHaveBeenCalled();
    await batch.commit();
  });

  it('should ASSIGN the CONTRACT', async () => {
    const contractBefore = (await admin.firestore().collection(`kingdoms/${KINGDOM}/contracts`).where('id', '==', HERO).limit(1).get()).docs[0];
    expect(contractBefore.data().assignment).toBe(0);
    await assignContract(KINGDOM, contractBefore.id, 2);
    const contractAfter = (await admin.firestore().collection(`kingdoms/${KINGDOM}/contracts`).where('id', '==', HERO).limit(1).get()).docs[0];
    expect(contractAfter.data().assignment).toBe(2);
  });

  it('should DISCHARGE the CONTRACT', async () => {
    const contract = (await admin.firestore().collection(`kingdoms/${KINGDOM}/contracts`).where('id', '==', HERO).limit(1).get()).docs[0];
    expect(contract.data().level).toBe(1);
    await dischargeContract(KINGDOM, contract.id);
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
