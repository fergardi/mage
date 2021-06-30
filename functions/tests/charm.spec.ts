import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { createKingdom, KingdomType, addCharm, researchCharm, assignCharm, conjureCharm } from '../index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'charm';
const SPELL = 'animate-skeleton';

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
    await createKingdom(KINGDOM, KingdomType.BLUE, KINGDOM, 0, 0);
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

  it('should CONJURE the CHARM', async () => {
    const charm = (await admin.firestore().collection(`kingdoms/${KINGDOM}/charms`).where('id', '==', SPELL).limit(1).get()).docs[0];
    await conjureCharm(KINGDOM, charm.id, KINGDOM);
    // TODO
  })

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
