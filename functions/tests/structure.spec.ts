import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType } from '../src/config';

const KINGDOM = 'TEST_STRUCTURE';

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

  it.each([
    'barrier',
    'farm',
    'fortress',
    'academy',
    'node',
    'village',
    'workshop',
  ])('should ADD the BUILDING %s', async (structure) => {
    const quantity = 1;
    const structureBefore = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', structure).limit(1)).get()).docs[0].data();
    expect(structureBefore.quantity).toBeGreaterThanOrEqual(0);
    await backend.addBuilding(KINGDOM, structure, quantity, batch);
    await batch.commit();
    const structureAfter = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', structure).limit(1)).get()).docs[0].data();
    expect(structureAfter.quantity).toBe(structureBefore.quantity + quantity);
  });

  it.each([
    'barrier',
    'farm',
    'fortress',
    'academy',
    'node',
    'village',
    'workshop',
  ])('should BUILD the STRUCTURE %s', async (structure) => {
    const quantity = 1;
    const structureBefore = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', structure).limit(1)).get()).docs[0];
    const structureBeforeData = structureBefore.data();
    expect(structureBeforeData.quantity).toBeGreaterThanOrEqual(0);
    expect((await backend.buildStructure(KINGDOM, structureBefore.id, quantity)).quantity).toBe(quantity);
    const structureAfter = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', structure).limit(1)).get()).docs[0];
    const structureAfterData = structureAfter.data();
    expect(structureAfterData.quantity).toBe(structureBeforeData.quantity + quantity);
  });

  it.each([
    //'barrier',
    'farm',
    //'fortress',
    //'academy',
    'node',
    'village',
    //'workshop',
  ])('should DEMOLISH the STRUCTURE %s', async (structure) => {
    const quantity = 1;
    const structureBefore = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', structure).limit(1)).get()).docs[0];
    const structureBeforeData = structureBefore.data();
    expect(structureBeforeData.quantity).toBeGreaterThanOrEqual(0);
    expect((await backend.demolishStructure(KINGDOM, structureBefore?.id, quantity)).quantity).toBe(quantity);
    const structureAfter = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).where('id', '==', structure).limit(1)).get()).docs[0];
    const structureAfterData = structureAfter.data();
    expect(structureAfterData.quantity).toBe(structureBeforeData.quantity - quantity);
  });

});
