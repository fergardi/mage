import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType } from '../src/config';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-b1c51.firebaseio.com',
  projectId: 'mage-b1c51',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM_SOURCE = 'TEST_ITEM_SOURCE';
const KINGDOM_TARGET = 'TEST_ITEM_TARGET';
const ITEM_NEW = 'treasure-chest';

describe(KINGDOM_SOURCE + ' -> ' + KINGDOM_TARGET, () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM_SOURCE, KingdomType.BLUE, KINGDOM_SOURCE, 0, 0);
    await backend.createKingdom(KINGDOM_TARGET, KingdomType.GREEN, KINGDOM_TARGET, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM_SOURCE);
    await backend.deleteKingdom(KINGDOM_TARGET);
    tester.cleanup();
  });

  it('should ACTIVATE the ITEM for RESOURCE', async () => {
    const item = (await admin.firestore().doc(`items/${ITEM_NEW}`).get()).data();
    const result = await backend.activateItem(KINGDOM_SOURCE, item, KINGDOM_TARGET, batch);
    expect(result.resource).toBe('resource.gold.name');
  });

});
