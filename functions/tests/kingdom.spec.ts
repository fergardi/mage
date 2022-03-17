import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType, AssignmentType, BattleType } from '../src/config';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-b1c51.firebaseio.com',
  projectId: 'mage-b1c51',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const ATTACKER = 'ATTACKER';
const DEFENDER = 'DEFENDER';
const PERK = 'masonry';

describe(ATTACKER + DEFENDER, () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(ATTACKER, KingdomType.BLACK, ATTACKER, 0, 0);
    await backend.createKingdom(DEFENDER, KingdomType.WHITE, DEFENDER, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(ATTACKER);
    await backend.deleteKingdom(DEFENDER);
    tester.cleanup();
  });

  it('should FIND the PERK', async () => {
    const tree = (await admin.firestore().doc(`kingdoms/${ATTACKER}`).get()).data()?.tree;
    const node = backend.searchPerk(tree, PERK);
    expect(node).toBeDefined();
    expect(node.id).toBe(PERK);
  });

  it('should UPDATE the PERK', async () => {
    const tree = (await admin.firestore().doc(`kingdoms/${ATTACKER}`).get()).data()?.tree;
    const node = backend.updatePerk(tree, PERK, 0);
    expect(node).toBe(true);
  });

  it('should PLANT the TREE', async () => {
    const treeBefore = (await admin.firestore().doc(`kingdoms/${ATTACKER}`).get()).data()?.tree;
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
    await backend.plantTree(ATTACKER, tree, 0);
    const treeAfter = (await admin.firestore().doc(`kingdoms/${ATTACKER}`).get()).data()?.tree;
    expect(treeAfter.level).toBe(1);
  });

  it('should BATTLE the KINGDOM with ATTACK', async () => {
    const attackerTroop = (await admin.firestore().collection(`kingdoms/${ATTACKER}/troops`).limit(1).get()).docs[0];
    await admin.firestore().doc(`kingdoms/${ATTACKER}/troops/${attackerTroop.id}`).update({ quantity: 999999999, assignment: AssignmentType.ATTACK });
    const defenderTroop = (await admin.firestore().collection(`kingdoms/${DEFENDER}/troops`).limit(1).get()).docs[0];
    await admin.firestore().doc(`kingdoms/${DEFENDER}/troops/${defenderTroop.id}`).update({ quantity: 999999999, assignment: AssignmentType.DEFENSE });
    const resolveBattleSpy = jest.spyOn(backend, 'resolveBattle');
    const addLetterSpy = jest.spyOn(backend, 'addLetter');
    await backend.battleKingdom(ATTACKER, BattleType.ATTACK, DEFENDER);
    expect(resolveBattleSpy).toHaveBeenCalled();
    expect(addLetterSpy).toHaveBeenCalled();
  });

  it('should BATTLE the KINGDOM with PILLAGE', async () => {
    const attackerTroop = (await admin.firestore().collection(`kingdoms/${ATTACKER}/troops`).limit(1).get()).docs[0];
    await admin.firestore().doc(`kingdoms/${ATTACKER}/troops/${attackerTroop.id}`).update({ quantity: 999999999, assignment: AssignmentType.ATTACK });
    const defenderTroop = (await admin.firestore().collection(`kingdoms/${DEFENDER}/troops`).limit(1).get()).docs[0];
    await admin.firestore().doc(`kingdoms/${DEFENDER}/troops/${defenderTroop.id}`).update({ quantity: 999999999, assignment: AssignmentType.DEFENSE });
    const resolveBattleSpy = jest.spyOn(backend, 'resolveBattle');
    const addLetterSpy = jest.spyOn(backend, 'addLetter');
    await backend.battleKingdom(ATTACKER, BattleType.PILLAGE, DEFENDER);
    expect(resolveBattleSpy).toHaveBeenCalled();
    expect(addLetterSpy).toHaveBeenCalled();
  });

  it('should BATTLE the KINGDOM with SIEGE', async () => {
    const attackerTroop = (await admin.firestore().collection(`kingdoms/${ATTACKER}/troops`).limit(1).get()).docs[0];
    await admin.firestore().doc(`kingdoms/${ATTACKER}/troops/${attackerTroop.id}`).update({ quantity: 999999999, assignment: AssignmentType.ATTACK });
    const defenderTroop = (await admin.firestore().collection(`kingdoms/${DEFENDER}/troops`).limit(1).get()).docs[0];
    await admin.firestore().doc(`kingdoms/${DEFENDER}/troops/${defenderTroop.id}`).update({ quantity: 999999999, assignment: AssignmentType.DEFENSE });
    const resolveBattleSpy = jest.spyOn(backend, 'resolveBattle');
    const addLetterSpy = jest.spyOn(backend, 'addLetter');
    await backend.battleKingdom(ATTACKER, BattleType.SIEGE, DEFENDER);
    expect(resolveBattleSpy).toHaveBeenCalled();
    expect(addLetterSpy).toHaveBeenCalled();
  });

  it('should SPY the KINGDOM', async () => {
    const addLetterSpy = jest.spyOn(backend, 'addLetter');
    await backend.spyKingdom(ATTACKER, DEFENDER, batch);
    await batch.commit();
    expect(addLetterSpy).toHaveBeenCalled();
  });

});
