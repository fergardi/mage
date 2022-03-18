import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType } from '../src/config';

const KINGDOM = 'TEST_ARTIFACT';
const ITEM = 'treasure-chest';

describe('Artifacts', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM, KingdomType.WHITE, KINGDOM, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM);
    tester.cleanup();
  });

  it('should ADD the ARTIFACT', async () => {
    const item = (await admin.firestore().doc(`items/${ITEM}`).get()).data();
    await backend.addArtifact(KINGDOM, item, 1, batch);
    await batch.commit();
    const artifact1 = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/artifacts`).where('id', '==', item?.id).limit(1)).get()).docs[0];
    expect(artifact1.exists).toBe(true);
    expect(artifact1.data().quantity).toBeGreaterThan(0);
    batch = admin.firestore().batch();
    await backend.addArtifact(KINGDOM, item, 1, batch);
    await batch.commit();
    const artifact2 = (await (admin.firestore().collection(`kingdoms/${KINGDOM}/artifacts`).where('id', '==', item?.id).limit(1)).get()).docs[0];
    expect(artifact2.exists).toBe(true);
    expect(artifact2.data().quantity).toBeGreaterThan(1);
  });

  it('should BUY the EMPORIUM', async () => {
    expect((await backend.buyEmporium(KINGDOM, ITEM) as any).item).toBe('item.treasure-chest.name');
  });

  it('should ASSIGN the ARTIFACT', async () => {
    const artifactBefore = (await admin.firestore().collection(`kingdoms/${KINGDOM}/artifacts`).where('id', '==', ITEM).limit(1).get()).docs[0];
    expect(artifactBefore.data().assignment).toBe(0);
    await backend.assignArtifact(KINGDOM, artifactBefore.id, 2);
    const artifactAfter = (await admin.firestore().collection(`kingdoms/${KINGDOM}/artifacts`).where('id', '==', ITEM).limit(1).get()).docs[0];
    expect(artifactAfter.data().assignment).toBe(2);
  });

  it('should ACTIVATE the ARTIFACT', async () => {
    const artifact = (await admin.firestore().collection(`kingdoms/${KINGDOM}/artifacts`).where('id', '==', ITEM).limit(1).get()).docs[0];
    expect((await backend.activateArtifact(KINGDOM, artifact.id, KINGDOM) as any).resource).toBe('resource.gold.name');
  });

});
