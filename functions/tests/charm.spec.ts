import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType } from '../src/config';

const KINGDOM = 'TEST_CHARM';
const SPELL = 'animate-skeleton';

describe('Charms', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM, KingdomType.BLUE, KINGDOM, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM);
    tester.cleanup();
  });

  it('should ADD the CHARM', async () => {
    const spell = (await admin.firestore().doc(`spells/${SPELL}`).get()).data();
    jest.spyOn(batch, 'create');
    await backend.addCharm(KINGDOM, spell, 200, batch);
    expect(batch.create).toHaveBeenCalled();
    await batch.commit();
    batch = admin.firestore().batch();
    jest.spyOn(batch, 'update');
    await backend.addCharm(KINGDOM, spell, 200, batch);
    expect(batch.update).toHaveBeenCalled();
    await batch.commit();
  });

  it('should RESEARCH the CHARM', async () => {
    const charmBefore = (await admin.firestore().collection(`kingdoms/${KINGDOM}/charms`).where('id', '==', SPELL).limit(1).get()).docs[0];
    expect(charmBefore.exists).toBe(true);
    expect(charmBefore.data().turns).toBe(400);
    expect(charmBefore.data().completed).toBe(false);
    await backend.researchCharm(KINGDOM, charmBefore.id, 100);
    const charmAfter = (await admin.firestore().collection(`kingdoms/${KINGDOM}/charms`).where('id', '==', SPELL).limit(1).get()).docs[0];
    expect(charmAfter.exists).toBe(true);
    expect(charmAfter.data().turns).toBe(500);
    expect(charmAfter.data().completed).toBe(true);
  });

  it('should ASSIGN the CHARM', async () => {
    const charmBefore = (await admin.firestore().collection(`kingdoms/${KINGDOM}/charms`).where('id', '==', SPELL).limit(1).get()).docs[0];
    expect(charmBefore.exists).toBe(true);
    expect(charmBefore.data().assignment).toBe(0);
    await backend.assignCharm(KINGDOM, charmBefore.id, 2);
    const charmAfter = (await admin.firestore().collection(`kingdoms/${KINGDOM}/charms`).where('id', '==', SPELL).limit(1).get()).docs[0];
    expect(charmAfter.exists).toBe(true);
    expect(charmAfter.data().assignment).toBe(2);
  });

  it('should CONJURE the CHARM', async () => {
    const charm = (await admin.firestore().collection(`kingdoms/${KINGDOM}/charms`).where('id', '==', SPELL).limit(1).get()).docs[0];
    const addTroopSpy = jest.spyOn(backend, 'addTroop');
    const conjured: any = await backend.conjureCharm(KINGDOM, charm.id, KINGDOM);
    expect(conjured.unit).toBe('unit.skeleton.name');
    expect(conjured.size).toBeGreaterThan(0);
    expect(addTroopSpy).toHaveBeenCalled();
  });
  
});
