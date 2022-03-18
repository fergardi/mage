import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as moment from 'moment';
import * as backend from '../src/index';
import { KingdomType, BID_RATIO, AUCTION_TIME_OUTBID } from '../src/config';

const KINGDOM = 'TEST_AUCTION';

describe('Auctions', () => {
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
    const auction1 = (await admin.firestore().collection(`auctions`).get()).docs[0];
    expect(auction1.exists).toBe(true);
    const outdatedAuction = auction1.data();
    const bid = Math.ceil(outdatedAuction.gold * BID_RATIO);
    const gold = (await admin.firestore().collection(`kingdoms/${KINGDOM}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
    await admin.firestore().doc(`kingdoms/${KINGDOM}/supplies/${gold.id}`).update({ quantity: 999999999 });
    const bidAuction = await backend.bidAuction(KINGDOM, auction1.id, bid);
    expect(bidAuction.gold).toBe(bid);
    const auction2 = (await admin.firestore().collection(`auctions`).get()).docs[0];
    expect(auction2.exists).toBe(true);
    const updatedAuction = auction2.data();
    expect(updatedAuction.auctioned - outdatedAuction.auctioned).toBe(AUCTION_TIME_OUTBID);
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
