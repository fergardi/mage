import 'jest';
import { tester } from './config';
import * as backend from '../src/index';
import { KingdomType } from '../src/config';

const KINGDOM = 'TEST_GOD';

describe('Gods', () => {
  // common batch
  // let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM, KingdomType.BLACK, KINGDOM, 0, 0);
  });

  beforeEach(() => {
    // batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM);
    tester.cleanup();
  });

  it('should OFFER the GOD and RECEIVE enchantment', async () => {
    const addEnchantmentSpy = jest.spyOn(backend, 'addEnchantment');
    expect((await backend.offerGod(KINGDOM, 'famine', 100000, 'enchantment'))).toEqual(expect.objectContaining({ enchantment: expect.any(String), turns: expect.any(Number) }));
    expect(addEnchantmentSpy).toHaveBeenCalled();
  });

  it('should OFFER the GOD and RECEIVE contract', async () => {
    const addContractSpy = jest.spyOn(backend, 'addContract');
    expect((await backend.offerGod(KINGDOM, 'pestilence', 1000, 'contract'))).toEqual(expect.objectContaining({ hero: expect.any(String), level: expect.any(Number) }));
    expect(addContractSpy).toHaveBeenCalled();
  });

  it('should OFFER the GOD and RECEIVE artifact', async () => {
    const addArtifactSpy = jest.spyOn(backend, 'addArtifact');
    expect((await backend.offerGod(KINGDOM, 'death', 10, 'artifact'))).toEqual(expect.objectContaining({ item: expect.any(String), quantity: expect.any(Number) }));
    expect(addArtifactSpy).toHaveBeenCalled();
  });

  it('should OFFER the GOD and RECEIVE troop', async () => {
    const addTroopSpy = jest.spyOn(backend, 'addTroop');
    expect((await backend.offerGod(KINGDOM, 'void', 10000, 'troop'))).toEqual(expect.objectContaining({ unit: expect.any(String), quantity: expect.any(Number) }));
    expect(addTroopSpy).toHaveBeenCalled();
  });

  it('should OFFER the GOD and RECEIVE supply', async () => {
    const addSupplySpy = jest.spyOn(backend, 'addSupply');
    expect((await backend.offerGod(KINGDOM, 'war', 100, 'supply'))).toBeInstanceOf(Object);
    expect(addSupplySpy).toHaveBeenCalled();
  });

  it('should OFFER the GOD and RECEIVE building', async () => {
    const addBuildingSpy = jest.spyOn(backend, 'addBuilding');
    expect((await backend.offerGod(KINGDOM, 'famine', 100000, 'building'))).toEqual(expect.objectContaining({ building: expect.any(String), number: expect.any(Number) }));
    expect(addBuildingSpy).toHaveBeenCalled();
  });

  it('should OFFER the GOD and RECEIVE charm', async () => {
    const addCharmSpy = jest.spyOn(backend, 'addCharm');
    expect((await backend.offerGod(KINGDOM, 'famine', 100000, 'charm'))).toEqual(expect.objectContaining({ spell: expect.any(String), turns: expect.any(Number) }));
    expect(addCharmSpy).toHaveBeenCalled();
  });

});
