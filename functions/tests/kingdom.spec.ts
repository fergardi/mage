import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType } from '../src/config';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'KINGDOM';

describe(KINGDOM, () => {
  // common batch
  // let batch: FirebaseFirestore.WriteBatch;

  beforeEach(() => {
    // batch = admin.firestore().batch();
  });

  afterAll(async () => {
    tester.cleanup();
  });

  it('should CREATE the KINGDOM', async () => {
    await backend.createKingdom(KINGDOM, KingdomType.RED, KINGDOM, 0, 0);
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(true);
  });

  it('should PLAN the TREE', async () => {
    const treeBefore = (await admin.firestore().doc(`kingdoms/${KINGDOM}`).get()).data()?.tree;
    expect(treeBefore.level).toBe(0);
    const tree = {
      agriculture: 0,
      alchemy: 0,
      architecture: 1,
      cartography: 0,
      culture: 0,
      forge: 0,
      masonry: 0,
      medicine: 0,
      metalurgy: 0,
      mysticism: 0,
      science: 0,
      strategy: 1,
      teology: 0,
    };
    await backend.plantTree(KINGDOM, tree, 0);
    const treeAfter = (await admin.firestore().doc(`kingdoms/${KINGDOM}`).get()).data()?.tree;
    expect(treeAfter.level).toBe(1);
  });

  it('should DELETE the KINGDOM', async () => {
    await backend.deleteKingdom(KINGDOM);
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(false);
  });

});
