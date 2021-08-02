import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { createKingdom, KingdomType, addArtifact, buyEmporium, assignArtifact, activateArtifact } from '../index';
import { deleteKingdom } from '../fixtures';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'artifact';
const COLOR = KingdomType.WHITE;
const ITEM = 'treasure-chest';

describe('ARTIFACT', () => {
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

  it('should ADD the ARTIFACT', async () => {
    const item = (await admin.firestore().doc(`items/${ITEM}`).get()).data();
    await addArtifact(KINGDOM, item, 1, batch);
    await batch.commit();
    const artifact1 = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/artifacts`).where('id', '==', item?.id).limit(1)).get()).docs[0];
    expect(artifact1.exists).toBe(true);
    expect(artifact1.data().quantity).toBe(1);
    batch = admin.firestore().batch();
    await addArtifact(KINGDOM, item, 1, batch);
    await batch.commit();
    const artifact2 = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/artifacts`).where('id', '==', item?.id).limit(1)).get()).docs[0];
    expect(artifact2.exists).toBe(true);
    expect(artifact2.data().quantity).toBe(2);
  });

  it('should BUY the EMPORIUM', async () => {
    expect((await buyEmporium(KINGDOM, ITEM) as any).item).toBe('item.treasure-chest.name');
  });

  it('should ASSIGN the ARTIFACT', async () => {
    const artifactBefore = (await admin.firestore().collection(`kingdoms/${KINGDOM}/artifacts`).where('id', '==', ITEM).limit(1).get()).docs[0];
    expect(artifactBefore.data().assignment).toBe(0);
    await assignArtifact(KINGDOM, artifactBefore.id, 2);
    const artifactAfter = (await admin.firestore().collection(`kingdoms/${KINGDOM}/artifacts`).where('id', '==', ITEM).limit(1).get()).docs[0];
    expect(artifactAfter.data().assignment).toBe(2);
  });

  it('should ACTIVATE the ARTIFACT for RESOURCE', async () => {
    const artifact = (await admin.firestore().collection(`kingdoms/${KINGDOM}/artifacts`).where('id', '==', ITEM).limit(1).get()).docs[0];
    expect((await activateArtifact(KINGDOM, artifact.id, KINGDOM) as any).resource).toBe('resource.gold.name');
  });

  it('should DELETE the KINGDOM', async () => {
    await deleteKingdom(KINGDOM, admin.firestore());
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(false);
  });

});
