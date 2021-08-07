import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { createKingdom, KingdomType, addCharm, researchCharm, assignCharm, conjureCharm } from '../index';
import { deleteKingdom } from '../fixtures';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'CHARM';
const COLOR = KingdomType.BLUE;
const SPELL = 'animate-skeleton';

describe.skip(KINGDOM, () => {
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

  it('should ADD the CHARM', async () => {
    const spell = (await admin.firestore().doc(`spells/${SPELL}`).get()).data();
    jest.spyOn(batch, 'create');
    await addCharm(KINGDOM, spell, 200, batch);
    expect(batch.create).toHaveBeenCalled();
    await batch.commit();
    batch = admin.firestore().batch();
    jest.spyOn(batch, 'update');
    await addCharm(KINGDOM, spell, 200, batch);
    expect(batch.update).toHaveBeenCalled();
    await batch.commit();
  });

  it('should RESEARCH the CHARM', async () => {
    const charmBefore = (await admin.firestore().collection(`kingdoms/${KINGDOM}/charms`).where('id', '==', SPELL).limit(1).get()).docs[0];
    expect(charmBefore.data().turns).toBe(400);
    expect(charmBefore.data().completed).toBe(false);
    await researchCharm(KINGDOM, charmBefore.id, 100);
    const charmAfter = (await admin.firestore().collection(`kingdoms/${KINGDOM}/charms`).where('id', '==', SPELL).limit(1).get()).docs[0];
    expect(charmAfter.data().turns).toBe(500);
    expect(charmAfter.data().completed).toBe(true);
  });

  it('should ASSIGN the CHARM', async () => {
    const charmBefore = (await admin.firestore().collection(`kingdoms/${KINGDOM}/charms`).where('id', '==', SPELL).limit(1).get()).docs[0];
    expect(charmBefore.data().assignment).toBe(0);
    await assignCharm(KINGDOM, charmBefore.id, 2);
    const charmAfter = (await admin.firestore().collection(`kingdoms/${KINGDOM}/charms`).where('id', '==', SPELL).limit(1).get()).docs[0];
    expect(charmAfter.data().assignment).toBe(2);
  });

  it('should CONJURE the CHARM for SUMMON', async () => {
    const charm = (await admin.firestore().collection(`kingdoms/${KINGDOM}/charms`).where('id', '==', SPELL).limit(1).get()).docs[0];
    expect((await conjureCharm(KINGDOM, charm.id, KINGDOM) as any).unit).toBe('unit.skeleton.name');
  });

  it('should DELETE the KINGDOM', async () => {
    await deleteKingdom(KINGDOM, admin.firestore());
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(false);
  });

});
