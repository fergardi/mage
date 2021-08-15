import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType } from '../src/aux';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'CHARM';
const SPELL = 'animate-skeleton';

describe(KINGDOM, () => {
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

  it('should CONJURE the CHARM for TROOP', async () => {
    const charm = (await admin.firestore().collection(`kingdoms/${KINGDOM}/charms`).where('id', '==', SPELL).limit(1).get()).docs[0];
    const addTroopSpy = jest.spyOn(backend, 'addTroop');
    expect((await backend.conjureCharm(KINGDOM, charm.id, KINGDOM) as any).unit).toBe('unit.skeleton.name');
    expect(addTroopSpy).toHaveBeenCalled();
  });

});
