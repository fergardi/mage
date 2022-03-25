import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType, LocationType, AssignmentType } from '../src/config';

const KINGDOM = 'TEST_QUEST';
const QUEST = 'TEST_';

describe('Quests', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM, KingdomType.BLUE, KINGDOM, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM);
    tester.cleanup();
  });

  it.each([
    LocationType.CAVE,
    LocationType.GRAVEYARD,
    LocationType.DUNGEON,
    LocationType.MINE,
    LocationType.FOREST,
    LocationType.CATHEDRAL,
    LocationType.MOUNTAIN,
    LocationType.VOLCANO,
    LocationType.LAKE,
    LocationType.NEST,
    LocationType.CASTLE,
    LocationType.BARRACK,
    LocationType.ISLAND,
    LocationType.MONOLITH,
    LocationType.RUIN,
    LocationType.SHIP,
    LocationType.TOWN,
    LocationType.SHRINE,
    LocationType.TOTEM,
    LocationType.PYRAMID,
  ])('should CHECK the QUEST %s', async (type) => {
    await backend.checkQuest(undefined, Math.random(), Math.random(), type, QUEST+type);
    const quest = (await admin.firestore().collection(`quests`).where('name', '==', QUEST+type).get()).docs[0];
    expect(quest.exists).toBe(true);
  });

  it.each([
    LocationType.GRAVEYARD,
  ])('should ADVENTURE the QUEST %s', async (type) => {
    const troop = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).limit(1).get()).docs[0];
    await admin.firestore().doc(`kingdoms/${KINGDOM}/troops/${troop.id}`).update({ quantity: 999999999, assignment: AssignmentType.ATTACK });
    const quest = (await admin.firestore().collection(`quests`).where('name', '==', QUEST+type).limit(1).get()).docs[0];
    const resolveBattleSpy = jest.spyOn(backend, 'resolveBattle');
    const addSupplySpy = jest.spyOn(backend, 'addSupply');
    const addArtifactSpy = jest.spyOn(backend, 'addArtifact');
    const checkQuestSpy = jest.spyOn(backend, 'checkQuest');
    const addLetterSpy = jest.spyOn(backend, 'addLetter');
    await backend.adventureQuest(KINGDOM, quest.id);
    expect(resolveBattleSpy).toHaveBeenCalled();
    expect(addSupplySpy).toHaveBeenCalled();
    expect(addArtifactSpy).toHaveBeenCalled();
    expect(checkQuestSpy).toHaveBeenCalled();
    expect(addLetterSpy).toHaveBeenCalled();
  });

  it('should DELETE the QUESTS', async () => {
    const quests = (await admin.firestore().collection(`quests`).where('name', '>=', QUEST).get()).docs;
    expect(quests.length).toBe(20);
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

});
