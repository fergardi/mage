import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { createKingdom, KingdomType, addBuilding, buildStructure, demolishStructure } from '../index';
import { deleteKingdom } from '../fixtures';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'structure';
const COLOR = KingdomType.WHITE;
const STRUCTURE = 'farm';

describe('STRUCTURE', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(() => {
    tester.cleanup();
  });

  it('should CREATE the KINGDOM', async () => {
    await createKingdom(KINGDOM, COLOR, KINGDOM, 0, 0);
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(true);
  });

  it('should ADD the BUILDING', async () => {
    const quantity = 100;
    const structureBefore = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', STRUCTURE).limit(1)).get()).docs[0];
    expect(structureBefore.exists).toBe(true);
    expect(structureBefore.data().quantity).toBeGreaterThan(0);
    await addBuilding(KINGDOM, STRUCTURE, quantity, batch);
    await batch.commit();
    const structureAfter = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', STRUCTURE).limit(1)).get()).docs[0];
    expect(structureAfter.exists).toBe(true);
    expect(structureAfter.data().quantity).toBe(structureBefore.data().quantity + quantity);
  });

  it('should BUILD the STRUCTURE', async () => {
    const quantity = 100;
    const structureBefore = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', STRUCTURE).limit(1)).get()).docs[0];
    expect(structureBefore.exists).toBe(true);
    expect(structureBefore.data().quantity).toBeGreaterThan(0);
    expect((await buildStructure(KINGDOM, structureBefore?.id, quantity) as any).quantity).toBe(quantity);
    const structureAfter = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', STRUCTURE).limit(1)).get()).docs[0];
    expect(structureAfter.exists).toBe(true);
    expect(structureAfter.data().quantity).toBe(structureBefore.data().quantity + quantity);
  });

  it('should DEMOLISH the STRUCTURE', async () => {
    const quantity = 100;
    const structureBefore = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', STRUCTURE).limit(1)).get()).docs[0];
    expect(structureBefore.exists).toBe(true);
    expect(structureBefore.data().quantity).toBeGreaterThan(0);
    expect((await demolishStructure(KINGDOM, structureBefore?.id, quantity) as any).quantity).toBe(quantity);
    const structureAfter = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', STRUCTURE).limit(1)).get()).docs[0];
    expect(structureAfter.exists).toBe(true);
    expect(structureAfter.data().quantity).toBe(structureBefore.data().quantity - quantity);
  });

  it('should DELETE the KINGDOM', async () => {
    await deleteKingdom(KINGDOM, admin.firestore());
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(false);
  });

});
