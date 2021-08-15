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

const KINGDOM = 'CLAN';
const GUILD = 'mage';

describe(KINGDOM, () => {
  // common batch
  // let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM, KingdomType.GREEN, KINGDOM, 0, 0);
  });

  beforeEach(() => {
    // batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM);
    tester.cleanup();
  });

  it('should FAVOR the GUILD', async () => {
    const kingdomBefore = (await admin.firestore().doc(`kingdoms/${KINGDOM}`).get()).data();
    expect(kingdomBefore?.guild).not.toBe(null);
    await backend.favorGuild(KINGDOM, GUILD);
    const kingdomAfter = (await admin.firestore().doc(`kingdoms/${KINGDOM}`).get()).data();
    expect(kingdomAfter?.guild).not.toBe(null);
    expect(kingdomAfter?.guild.id).toBe(GUILD);
  });

});
