import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { createKingdom, KingdomType } from '../index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'contract';
// const SPELL = 'animate-skeleton';

describe('CHARM', () => {
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

  // TODO

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
    batch.delete(admin.firestore().doc(`kingdoms/${KINGDOM}`));
    await batch.commit();
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(false);
  });

});
