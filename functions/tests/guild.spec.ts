import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType } from '../src/config';

const KINGDOM = 'TEST_GUILD';
const GUILD = 'mage';

describe('Guilds', () => {
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
