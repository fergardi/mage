import 'jest';
import { tester } from './config';
import * as backend from '../src/index';
import { KingdomType, RewardType, SupplyType } from '../src/config';

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

  it.each([
    [1, 'despair', RewardType.SUPPLY, SupplyType.GEM],
    [1, 'despair', RewardType.SUPPLY, SupplyType.GOLD],
    [1, 'despair', RewardType.SUPPLY, SupplyType.POPULATION],
    [1, 'despair', RewardType.SUPPLY, SupplyType.LAND],
    [1, 'despair', RewardType.SUPPLY, SupplyType.TURN],
    [1, 'despair', RewardType.SUPPLY, SupplyType.MANA],
    [10, 'death', RewardType.ARTIFACT, null],
    [100, 'pestilence', RewardType.CONTRACT, null],
    [1000, 'war', RewardType.CHARM, null],
    [1000, 'war', RewardType.ENCHANTMENT, null],
    [10000, 'void', RewardType.TROOP, null],
    [100000, 'famine', RewardType.BUILDING, null],
  ])('should OFFER "%s" to the GOD "%s" and RECEIVE "%s" as a REWARD', async (offer, god, reward, supply) => {
    let addGenericSpy;
    switch (reward) {
      case RewardType.CHARM:
        jest.spyOn(backend, 'randomType').mockReturnValueOnce(reward);
        addGenericSpy = jest.spyOn(backend, 'addCharm');
        break;
      case RewardType.ENCHANTMENT:
        jest.spyOn(backend, 'randomType').mockReturnValueOnce(reward);
        addGenericSpy = jest.spyOn(backend, 'addEnchantment');
        break;
      case RewardType.ARTIFACT:
        jest.spyOn(backend, 'randomType').mockReturnValueOnce(reward);
        addGenericSpy = jest.spyOn(backend, 'addArtifact');
        break;
      case RewardType.CONTRACT:
        jest.spyOn(backend, 'randomType').mockReturnValueOnce(reward);
        addGenericSpy = jest.spyOn(backend, 'addContract');
        break;
      case RewardType.TROOP:
        jest.spyOn(backend, 'randomType').mockReturnValueOnce(reward);
        addGenericSpy = jest.spyOn(backend, 'addTroop');
        break;
      case RewardType.BUILDING:
        jest.spyOn(backend, 'randomType').mockReturnValueOnce(reward);
        addGenericSpy = jest.spyOn(backend, 'addBuilding');
        break;
      case RewardType.SUPPLY:
        jest.spyOn(backend, 'randomType').mockReturnValueOnce(reward).mockReturnValueOnce(supply);
        addGenericSpy = jest.spyOn(backend, 'addSupply');
        break;
    }
    expect((await backend.offerGod(KINGDOM, god, offer))).toBeInstanceOf(Object);
    expect(addGenericSpy).toHaveBeenCalled();
  });

});
