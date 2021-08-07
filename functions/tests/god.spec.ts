import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { createKingdom, KingdomType, offerGod } from '../index';
import { deleteKingdom } from '../fixtures';
// tslint:disable-next-line: no-duplicate-imports
import * as backend from '../index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'GOD';
const COLOR = KingdomType.BLACK;

describe.skip(KINGDOM, () => {
  // common batch
  // let batch: FirebaseFirestore.WriteBatch;

  beforeEach(() => {
    // batch = admin.firestore().batch();
  });

  afterAll(() => {
    tester.cleanup();
  });

  it('should CREATE the KINGDOM', async () => {
    await createKingdom(KINGDOM, COLOR, KINGDOM, 0, 0);
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(true);
  });

  it('should OFFER the GOD and RECEIVE enchantment', async () => {
    const addEnchantmentSpy = jest.spyOn(backend, 'addEnchantment');
    expect((await offerGod(KINGDOM, 'famine', 100000, 'enchantment'))).toEqual(expect.objectContaining({ enchantment: expect.any(String), turns: expect.any(Number) }));
    expect(addEnchantmentSpy).toHaveBeenCalled();
  });

  it('should OFFER the GOD and RECEIVE contract', async () => {
    const addContractSpy = jest.spyOn(backend, 'addContract');
    expect((await offerGod(KINGDOM, 'pestilence', 1000, 'contract'))).toEqual(expect.objectContaining({ hero: expect.any(String), level: expect.any(Number) }));
    expect(addContractSpy).toHaveBeenCalled();
  });

  it('should OFFER the GOD and RECEIVE artifact', async () => {
    const addArtifactSpy = jest.spyOn(backend, 'addArtifact');
    expect((await offerGod(KINGDOM, 'death', 10, 'artifact'))).toEqual(expect.objectContaining({ item: expect.any(String), quantity: expect.any(Number) }));
    expect(addArtifactSpy).toHaveBeenCalled();
  });

  it('should OFFER the GOD and RECEIVE troop', async () => {
    const addTroopSpy = jest.spyOn(backend, 'addTroop');
    expect((await offerGod(KINGDOM, 'void', 10000, 'troop'))).toEqual(expect.objectContaining({ unit: expect.any(String), quantity: expect.any(Number) }));
    expect(addTroopSpy).toHaveBeenCalled();
  });

  it('should OFFER the GOD and RECEIVE supply', async () => {
    const addSupplySpy = jest.spyOn(backend, 'addSupply');
    expect((await offerGod(KINGDOM, 'war', 100, 'supply'))).toBeInstanceOf(Object);
    expect(addSupplySpy).toHaveBeenCalled();
  });

  it('should OFFER the GOD and RECEIVE building', async () => {
    const addBuildingSpy = jest.spyOn(backend, 'addBuilding');
    expect((await offerGod(KINGDOM, 'famine', 100000, 'building'))).toEqual(expect.objectContaining({ building: expect.any(String), number: expect.any(Number) }));
    expect(addBuildingSpy).toHaveBeenCalled();
  });

  it('should OFFER the GOD and RECEIVE charm', async () => {
    const addCharmSpy = jest.spyOn(backend, 'addCharm');
    expect((await offerGod(KINGDOM, 'famine', 100000, 'charm'))).toEqual(expect.objectContaining({ spell: expect.any(String), turns: expect.any(Number) }));
    expect(addCharmSpy).toHaveBeenCalled();
  });

  it('should DELETE the KINGDOM', async () => {
    await deleteKingdom(KINGDOM, admin.firestore());
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(false);
  });

});
