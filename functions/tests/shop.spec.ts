import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as backend from '../src/index';
import { KingdomType, StoreType } from '../src/config';

const KINGDOM = 'TEST_SHOP';
const SHOP = 'TEST_';

describe('Shops', () => {
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

  it.each([
    StoreType.INN,
    StoreType.MERCENARY,
    StoreType.MERCHANT,
    StoreType.SORCERER,
  ])('should CHECK the SHOP %s', async (type) => {
    await backend.checkShop(undefined, Math.random(), Math.random(), type, SHOP+type);
    const shop = (await admin.firestore().collection(`shops`).where('name', '==', SHOP+type).get()).docs[0];
    expect(shop.exists).toBe(true);
  });

  it('should TRADE the DEAL and UPDATE', async () => {
    const gold = (await admin.firestore().collection(`kingdoms/${KINGDOM}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
    await admin.firestore().doc(`kingdoms/${KINGDOM}/supplies/${gold.id}`).update({ quantity: 999999999 });
    const shops = (await admin.firestore().collection(`shops`).where('name', '>=', SHOP).get()).docs;
    expect(shops.length).toBe(4);
    const tradeDealSpy = jest.spyOn(backend, 'tradeDeal');
    const addLetterSpy = jest.spyOn(backend, 'addLetter');
    const checkShopSpy = jest.spyOn(backend, 'checkShop');
    for (const shop of shops) { // async
      switch ((shop.data() as any).type as StoreType) {
        case StoreType.INN:
          const contracts = await admin.firestore().collection(`shops/${shop.id}/contracts`).listDocuments();
          for (const contract of contracts) { // async
            await backend.tradeDeal(KINGDOM, shop.id,'contracts', contract.id);
          }
          break;
        case StoreType.MERCENARY:
          const troops = await admin.firestore().collection(`shops/${shop.id}/troops`).listDocuments();
          for (const troop of troops) { // async
            await backend.tradeDeal(KINGDOM, shop.id, 'troops', troop.id);
          }
          break;
        case StoreType.MERCHANT:
          const artifacts = await admin.firestore().collection(`shops/${shop.id}/artifacts`).listDocuments();
          for (const artifact of artifacts) { // async
            await backend.tradeDeal(KINGDOM, shop.id, 'artifacts', artifact.id);
          }
          break;
        case StoreType.SORCERER:
          const charms = await admin.firestore().collection(`shops/${shop.id}/charms`).listDocuments();
          for (const charm of charms) { // async
            await backend.tradeDeal(KINGDOM, shop.id, 'charms', charm.id);
          }
          break;
      }
    }
    expect(tradeDealSpy).toHaveBeenCalledTimes(4);
    expect(addLetterSpy).toHaveBeenCalledTimes(4);
    expect(checkShopSpy).toHaveBeenCalledTimes(4);
  });

  it('should DELETE the SHOPS', async () => {
    const shops = (await admin.firestore().collection(`shops`).where('name', '>=', SHOP).get()).docs;
    expect(shops.length).toBe(4);
    for (const shop of shops) {
      switch ((shop.data() as any).type as StoreType) {
        case StoreType.INN:
          const contracts = await admin.firestore().collection(`shops/${shop.id}/contracts`).listDocuments();
          contracts.map(contract => batch.delete(contract));
          break;
        case StoreType.MERCENARY:
          const troops = await admin.firestore().collection(`shops/${shop.id}/troops`).listDocuments();
          troops.map(troop => batch.delete(troop));
          break;
        case StoreType.MERCHANT:
          const artifacts = await admin.firestore().collection(`shops/${shop.id}/artifacts`).listDocuments();
          artifacts.map(artifact => batch.delete(artifact));
          break;
        case StoreType.SORCERER:
          const charms = await admin.firestore().collection(`shops/${shop.id}/charms`).listDocuments();
          charms.map(charm => batch.delete(charm));
          break;
      }
      batch.delete(shop.ref);
    }
    await batch.commit();
  });

});
