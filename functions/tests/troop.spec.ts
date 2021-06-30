import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { createKingdom, KingdomType, addTroop, removeTroop, recruitUnit, disbandTroop, assignArmy } from '../index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'troop';
const UNIT = 'archer';
const UNIT_UNRECRUITABLE = 'vampire';
const UNIT_UNDISBANDABLE = 'devil';

describe.skip('TROOP', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeEach(() => {
    batch = admin.firestore().batch();
  })

  afterAll(() => {
    tester.cleanup();
  });

  it('should CREATE the KINGDOM', async () => {
    await createKingdom(KINGDOM, KingdomType.GREEN, KINGDOM, 0, 0);
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(true);
  });

  it('should ADD the TROOP', async () => {
    const troop = (await admin.firestore().doc(`units/${UNIT}`).get()).data();
    jest.spyOn(batch, 'create');
    await addTroop(KINGDOM, troop, 100, batch);
    expect(batch.create).toHaveBeenCalled();
    await batch.commit();
    batch = admin.firestore().batch();
    jest.spyOn(batch, 'update');
    await addTroop(KINGDOM, troop, 100, batch);
    expect(batch.update).toHaveBeenCalled();
    await batch.commit();
  });

  it('should NOT ADD the TROOP', () => {
    expect(async () => await recruitUnit(KINGDOM, UNIT_UNRECRUITABLE, 100)).rejects.toThrowError();
  });

  it('should REMOVE the TROOP', async () => {
    const troop = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).where('id', '==', UNIT).limit(1).get()).docs[0];
    expect(troop.data().quantity).toBe(200);
    jest.spyOn(batch, 'update');
    await removeTroop(KINGDOM, troop.id, 100, batch);
    expect(batch.update).toHaveBeenCalled();
    await batch.commit();
    batch = admin.firestore().batch();
    jest.spyOn(batch, 'delete');
    await removeTroop(KINGDOM, troop.id, 100, batch);
    expect(batch.delete).toHaveBeenCalled();
    await batch.commit();
  });

  it('should RECRUIT the TROOP', async () => {
    const result = await recruitUnit(KINGDOM, UNIT, 100);
    expect(result.quantity).toBe(100);
  });

  it('should ASSIGN the ARMY', async () => {
    const troop = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).where('id', '==', UNIT).limit(1).get()).docs[0];
    const troopBefore = troop.data();
    expect(troopBefore.assignment).toBe(0);
    expect(troopBefore.sort).toBe(undefined);
    troopBefore.troopId = troop.id;
    troopBefore.assignment = 2;
    troopBefore.sort = 1;
    await assignArmy(KINGDOM, [troopBefore]);
    const troopAfter = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).where('id', '==', UNIT).limit(1).get()).docs[0].data();
    expect(troopAfter.assignment).toBe(2);
    expect(troopAfter.sort).toBe(1);
  });

  it('should DISBAND the TROOP', async () => {
    const troop = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).where('id', '==', UNIT).limit(1).get()).docs[0];
    const result = await disbandTroop(KINGDOM, troop.id, 100);
    expect(result?.quantity).toBe(100);
  });

  it('should ADD the TROOP', async () => {
    const troop = (await admin.firestore().doc(`units/${UNIT_UNDISBANDABLE}`).get()).data();
    jest.spyOn(batch, 'create');
    await addTroop(KINGDOM, troop, 100, batch);
    expect(batch.create).toHaveBeenCalled();
    await batch.commit();
  });

  it('should NOT DISBAND the TROOP', async () => {
    const troop = (await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).where('id', '==', UNIT_UNDISBANDABLE).limit(1).get()).docs[0];
    expect(async () => await disbandTroop(KINGDOM, troop.id, 100)).rejects.toThrowError();
  });

  it('should DELETE the KINGDOM', async () => {
    const artifacts = await admin.firestore().collection(`kingdoms/${KINGDOM}/artifacts`).listDocuments();
    artifacts.forEach(artifact => batch.delete(artifact));
    const contracts = await admin.firestore().collection(`kingdoms/${KINGDOM}/contracts`).listDocuments();
    contracts.forEach(contract => batch.delete(contract));
    const buildings = await admin.firestore().collection(`kingdoms/${KINGDOM}/buildings`).listDocuments();
    buildings.forEach(building => batch.delete(building));
    const troops = await admin.firestore().collection(`kingdoms/${KINGDOM}/troops`).listDocuments();
    troops.forEach(troop => batch.delete(troop));
    const supplies = await admin.firestore().collection(`kingdoms/${KINGDOM}/supplies`).listDocuments();
    supplies.forEach(supply => batch.delete(supply));
    const charms = await admin.firestore().collection(`kingdoms/${KINGDOM}/charms`).listDocuments();
    charms.forEach(charm => batch.delete(charm));
    const letters = await admin.firestore().collection(`kingdoms/${KINGDOM}/letters`).listDocuments();
    letters.forEach(letter => batch.delete(letter));
    batch.delete(admin.firestore().doc(`kingdoms/${KINGDOM}`));
    await batch.commit();
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(false);
  });

});
