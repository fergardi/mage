import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { createKingdom, KingdomType, addLetter, sendLetter, readLetter, removeLetters } from '../index';
import { deleteKingdom } from '../fixtures';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'artifact';
const COLOR = KingdomType.GREEN;
const SUBJECT = 'lorem ipsum';
const MESSAGE = 'lorem ipsum dolor sit amet';

describe('LETTER', () => {
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

  it('should ADD the LETTER', async () => {
    await addLetter(KINGDOM, SUBJECT, MESSAGE, null, batch, null);
    await batch.commit();
    const letter = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/letters`).orderBy('timestamp', 'asc').limit(1)).get()).docs[0];
    expect(letter.exists).toBe(true);
    expect(letter.data().subject).toBe(SUBJECT);
    expect(letter.data().message).toBe(MESSAGE);
  });

  it('should SEND the LETTER', async () => {
    await sendLetter(KINGDOM, SUBJECT, MESSAGE, KINGDOM);
    const letter = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/letters`).orderBy('timestamp', 'asc').limit(1)).get()).docs[0];
    expect(letter.exists).toBe(true);
    expect(letter.data().subject).toBe(SUBJECT);
    expect(letter.data().message).toBe(MESSAGE);
  });

  it('should READ the LETTER', async () => {
    const letterBefore = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/letters`).orderBy('timestamp', 'asc').limit(1)).get()).docs[0];
    expect(letterBefore.data().read).toBe(false);
    await readLetter(KINGDOM, letterBefore.id);
    const letterAfter = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/letters`).orderBy('timestamp', 'asc').limit(1)).get()).docs[0];
    expect(letterAfter.data().read).toBe(true);
  });

  it('should REMOVE the LETTERS', async () => {
    const lettersBefore = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/letters`).get())).docs;
    expect(lettersBefore.length).toBeGreaterThan(0);
    await removeLetters(KINGDOM, lettersBefore.map(letter => letter.id));
    const lettersAfter = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/letters`).get())).docs;
    expect(lettersAfter.length).toBe(0);
  });

  it('should DELETE the KINGDOM', async () => {
    await deleteKingdom(KINGDOM, admin.firestore());
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(false);
  });

});
