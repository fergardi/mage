import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as moment from 'moment';
import * as backend from '../src/index';
import { KingdomType, BID_RATIO } from '../src/config';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'AUCTION';

describe(KINGDOM, () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM, KingdomType.RED, KINGDOM, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM);
    tester.cleanup();
  });

  it('should BID the AUCTION', async () => {
    const auction = (await admin.firestore().collection(`auctions`).get()).docs[0];
    expect(auction.exists).toBe(true);
    const bid = Math.ceil(auction.data().gold * BID_RATIO);
    const gold = (await admin.firestore().collection(`kingdoms/${KINGDOM}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
    await admin.firestore().doc(`kingdoms/${KINGDOM}/supplies/${gold.id}`).update({ quantity: 999999999 });
    expect((await backend.bidAuction(KINGDOM, auction.id, bid)).gold).toBe(bid);
  });

  it('should REFRESH the AUCTIONS', async () => {
    const auctions = await admin.firestore().collection(`auctions`).listDocuments();
    expect(auctions.length).toBe(5);
    auctions.forEach(auction => batch.update(auction, { kingdom: KINGDOM, auctioned: moment(admin.firestore.Timestamp.now().toMillis()).add(-1, 'months') }));
    await batch.commit();
    const addArtifactSpy = jest.spyOn(backend, 'addArtifact');
    const addCharmSpy = jest.spyOn(backend, 'addCharm');
    const addContractSpy = jest.spyOn(backend, 'addContract');
    const addTroopSpy = jest.spyOn(backend, 'addTroop');
    const addLetterSpy = jest.spyOn(backend, 'addLetter');
    const startAuctionSpy = jest.spyOn(backend, 'startAuction');
    await backend.refreshAuctions();
    expect(addArtifactSpy).toHaveBeenCalledTimes(2);
    expect(addCharmSpy).toHaveBeenCalledTimes(1);
    expect(addContractSpy).toHaveBeenCalledTimes(1);
    expect(addTroopSpy).toHaveBeenCalledTimes(1);
    expect(addLetterSpy).toHaveBeenCalledTimes(5);
    expect(startAuctionSpy).toHaveBeenCalledTimes(5);
  });

});
