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
const CLAN = 'test';

describe(KINGDOM, () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM, KingdomType.BLACK, KINGDOM, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM);
    tester.cleanup();
  });

  it('should FOUNDATE the CLAN', async () => {
    const kingdomBefore = (await admin.firestore().doc(`kingdoms/${KINGDOM}`).get()).data();
    expect(kingdomBefore?.clan).toBe(null);
    await backend.foundateClan(KINGDOM, CLAN, '', '');
    const clan = (await admin.firestore().collection(`clans`).where('name', '==', CLAN).limit(1).get()).docs[0];
    expect(clan.exists).toBe(true);
    expect(clan.data().name).toBe(CLAN);
    const kingdomAfter = (await admin.firestore().doc(`kingdoms/${KINGDOM}`).get()).data();
    expect(kingdomAfter?.clan).not.toBe(null);
    expect(kingdomAfter?.clan.fid).toBe(clan.id);
  });

  it('should LEAVE the CLAN', async () => {
    const clan = (await admin.firestore().collection(`clans`).where('name', '==', CLAN).limit(1).get()).docs[0];
    const kingdomBefore = (await admin.firestore().doc(`kingdoms/${KINGDOM}`).get()).data();
    expect(kingdomBefore?.clan).not.toBe(null);
    expect(kingdomBefore?.clan.fid).toBe(clan.id);
    await backend.leaveClan(KINGDOM, clan.id);
    const kingdomAfter = (await admin.firestore().doc(`kingdoms/${KINGDOM}`).get()).data();
    expect(kingdomAfter?.clan).toBe(null);
  });

  it('should JOIN the CLAN', async () => {
    const clan = (await admin.firestore().collection(`clans`).where('name', '==', CLAN).limit(1).get()).docs[0];
    await backend.joinClan(KINGDOM, clan.id);
    const kingdomAfter = (await admin.firestore().doc(`kingdoms/${KINGDOM}`).get()).data();
    expect(kingdomAfter?.clan).not.toBe(null);
    expect(kingdomAfter?.clan.fid).toBe(clan.id);
  });

  it('should REMOVE the CLAN', async () => {
    const clan = (await admin.firestore().collection(`clans`).where('name', '==', CLAN).limit(1).get()).docs[0];
    const members = (await admin.firestore().collection(`clans/${clan.id}/members`).get());
    members.forEach(member => batch.delete(member.ref));
    batch.delete(clan.ref);
    await batch.commit();
  });

});
