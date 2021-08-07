import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { createKingdom, KingdomType, StoreType, checkShop, tradeDeal } from '../index';
import { deleteKingdom } from '../fixtures';
// tslint:disable-next-line: no-duplicate-imports
import * as backend from '../index';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'SHOP';
const COLOR = KingdomType.WHITE;

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

  it('should CHECK the SHOP', async () => {
    await checkShop(undefined, 0.1, 0.1, StoreType.INN, 'test1');
    const inn = (await admin.firestore().collection(`shops`).where('name', '==', 'test1').get()).docs[0];
    expect(inn.exists).toBe(true);
    await checkShop(undefined, 0.2, 0.2, StoreType.MERCENARY, 'test2');
    const mercenary = (await admin.firestore().collection(`shops`).where('name', '==', 'test2').get()).docs[0];
    expect(mercenary.exists).toBe(true);
    await checkShop(undefined, 0.4, 0.3, StoreType.MERCHANT, 'test3');
    const merchant = (await admin.firestore().collection(`shops`).where('name', '==', 'test3').get()).docs[0];
    expect(merchant.exists).toBe(true);
    await checkShop(undefined, 0.4, 0.4, StoreType.SORCERER, 'test4');
    const sorcerer = (await admin.firestore().collection(`shops`).where('name', '==', 'test4').get()).docs[0];
    expect(sorcerer.exists).toBe(true);
  });

  it('should TRADE the DEAL and UPDATE', async () => {
    const gold = (await admin.firestore().collection(`kingdoms/${KINGDOM}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
    await admin.firestore().doc(`kingdoms/${KINGDOM}/supplies/${gold.id}`).update({ quantity: 999999999 });
    const shops = (await admin.firestore().collection(`shops`).where('name', '>=', 'test').get()).docs;
    expect(shops.length).toBe(4);
    const tradeDealSpy = jest.spyOn(backend, 'tradeDeal');
    const addLetterSpy = jest.spyOn(backend, 'addLetter');
    const checkShopSpy = jest.spyOn(backend, 'checkShop');
    for (const shop of shops) { // async
      switch ((shop.data() as any).type as StoreType) {
        case StoreType.INN:
          const contracts = await admin.firestore().collection(`shops/${shop.id}/contracts`).listDocuments();
          for (const contract of contracts) { // async
            await tradeDeal(KINGDOM, shop.id,'contracts', contract.id);
          }
          break;
        case StoreType.MERCENARY:
          const troops = await admin.firestore().collection(`shops/${shop.id}/troops`).listDocuments();
          for (const troop of troops) { // async
            await tradeDeal(KINGDOM, shop.id, 'troops', troop.id);
          }
          break;
        case StoreType.MERCHANT:
          const artifacts = await admin.firestore().collection(`shops/${shop.id}/artifacts`).listDocuments();
          for (const artifact of artifacts) { // async
            await tradeDeal(KINGDOM, shop.id, 'artifacts', artifact.id);
          }
          break;
        case StoreType.SORCERER:
          const charms = await admin.firestore().collection(`shops/${shop.id}/charms`).listDocuments();
          for (const charm of charms) { // async
            await tradeDeal(KINGDOM, shop.id, 'charms', charm.id);
          }
          break;
      }
    }
    expect(tradeDealSpy).toHaveBeenCalledTimes(4);
    expect(addLetterSpy).toHaveBeenCalledTimes(4);
    expect(checkShopSpy).toHaveBeenCalledTimes(4);
  });

  it('should DELETE the SHOPS', async () => {
    const shops = (await admin.firestore().collection(`shops`).where('name', '>=', 'test').get()).docs;
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

  it('should DELETE the KINGDOM', async () => {
    await deleteKingdom(KINGDOM, admin.firestore());
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(false);
  });

});