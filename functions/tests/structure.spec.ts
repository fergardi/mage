import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType } from '../src/config';

const KINGDOM = 'TEST_STRUCTURE';
const STRUCTURE = 'farm';

describe('Structures', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM, KingdomType.WHITE, KINGDOM, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM);
    tester.cleanup();
  });

  it('should ADD the BUILDING', async () => {
    const quantity = 100;
    const structureBefore = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', STRUCTURE).limit(1)).get()).docs[0];
    expect(structureBefore.exists).toBe(true);
    expect(structureBefore.data().quantity).toBeGreaterThan(0);
    await backend.addBuilding(KINGDOM, STRUCTURE, quantity, batch);
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
    expect((await backend.buildStructure(KINGDOM, structureBefore?.id, quantity) as any).quantity).toBe(quantity);
    const structureAfter = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', STRUCTURE).limit(1)).get()).docs[0];
    expect(structureAfter.exists).toBe(true);
    expect(structureAfter.data().quantity).toBe(structureBefore.data().quantity + quantity);
  });

  it('should DEMOLISH the STRUCTURE', async () => {
    const quantity = 100;
    const structureBefore = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', STRUCTURE).limit(1)).get()).docs[0];
    expect(structureBefore.exists).toBe(true);
    expect(structureBefore.data().quantity).toBeGreaterThan(0);
    expect((await backend.demolishStructure(KINGDOM, structureBefore?.id, quantity) as any).quantity).toBe(quantity);
    const structureAfter = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', STRUCTURE).limit(1)).get()).docs[0];
    expect(structureAfter.exists).toBe(true);
    expect(structureAfter.data().quantity).toBe(structureBefore.data().quantity - quantity);
  });

});
