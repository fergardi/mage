import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { createKingdom, KingdomType, LocationType, checkQuest, adventureQuest, AssignmentType } from '../index';
import { deleteKingdom } from '../fixtures';
// tslint:disable-next-line: no-duplicate-imports
import * as backend from '../index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'QUEST';
const COLOR = KingdomType.BLUE;

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

  it('should CHECK the QUEST', async () => {
    await checkQuest(undefined, 0.1, 0.1, LocationType.GRAVEYARD, 'test1');
    const graveyard = (await admin.firestore().collection(`quests`).where('name', '==', 'test1').get()).docs[0];
    expect(graveyard.exists).toBe(true);
  });

  it('should ADVENTURE the QUEST', async () => {
    const troop = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).limit(1).get()).docs[0];
    await admin.firestore().doc(`kingdoms/${KINGDOM}/troops/${troop.id}`).update({ quantity: 999999999, assignment: AssignmentType.ATTACK });
    const quest = (await admin.firestore().collection(`quests`).where('name', '==', 'test1').limit(1).get()).docs[0];
    const resolveBattleSpy = jest.spyOn(backend, 'resolveBattle');
    const addSupplySpy = jest.spyOn(backend, 'addSupply');
    const addArtifactSpy = jest.spyOn(backend, 'addArtifact');
    const checkQuestSpy = jest.spyOn(backend, 'checkQuest');
    const addLetterSpy = jest.spyOn(backend, 'addLetter');
    await adventureQuest(KINGDOM, quest.id);
    expect(resolveBattleSpy).toHaveBeenCalled();
    expect(addSupplySpy).toHaveBeenCalled();
    expect(addArtifactSpy).toHaveBeenCalled();
    expect(checkQuestSpy).toHaveBeenCalled();
    expect(addLetterSpy).toHaveBeenCalled();
  });

  it('should DELETE the QUESTS', async () => {
    const quests = (await admin.firestore().collection(`quests`).where('name', '>=', 'test').get()).docs;
    for (const quest of quests) {
      const contracts = await admin.firestore().collection(`quests/${quest.id}/contracts`).listDocuments();
      contracts.map(contract => batch.delete(contract));
      const troops = await admin.firestore().collection(`quests/${quest.id}/troops`).listDocuments();
      troops.map(troop => batch.delete(troop));
      const artifacts = await admin.firestore().collection(`quests/${quest.id}/artifacts`).listDocuments();
      artifacts.map(artifact => batch.delete(artifact));
      batch.delete(quest.ref);
    }
    await batch.commit();
  });

  it('should DELETE the KINGDOM', async () => {
    await deleteKingdom(KINGDOM, admin.firestore());
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(false);
  });

});
