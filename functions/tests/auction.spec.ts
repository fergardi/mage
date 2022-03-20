import 'jest';
import { tester } from './config';
import * as admin from 'firebase-admin';
import * as moment from 'moment';
import * as backend from '../src/index';
import { KingdomType, BID_RATIO, AUCTION_TIME_OUTBID } from '../src/config';

const KINGDOM_BIDDER = 'TEST_AUCTION_BIDDER';
const KINGDOM_OUTBIDDER = 'TEST_AUCTION_OUTBIDDER';

describe('Auctions', () => {
  // common batch
  let batch: FirebaseFirestore.WriteBatch;

  beforeAll(async () => {
    await backend.createKingdom(KINGDOM_BIDDER, KingdomType.BLUE, KINGDOM_BIDDER, 0, 0);
    await backend.createKingdom(KINGDOM_OUTBIDDER, KingdomType.RED, KINGDOM_OUTBIDDER, 0, 0);
  });

  beforeEach(() => {
    batch = admin.firestore().batch();
  });

  afterAll(async () => {
    await backend.deleteKingdom(KINGDOM_BIDDER);
    await backend.deleteKingdom(KINGDOM_OUTBIDDER);
    tester.cleanup();
  });

  it('should OUTBID the AUCTION', async () => {
    const auctionBefore = (await admin.firestore().collection(`auctions`).get()).docs[0];
    expect(auctionBefore.exists).toBe(true);
    const auctionBeforeData = auctionBefore.data();
    const bid = Math.ceil(auctionBeforeData.gold * BID_RATIO);
    const gold = (await admin.firestore().collection(`kingdoms/${KINGDOM_OUTBIDDER}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
    await admin.firestore().doc(`kingdoms/${KINGDOM_OUTBIDDER}/supplies/${gold.id}`).update({ quantity: 999999999 });
    await admin.firestore().doc(`auctions/${auctionBefore.id}`).update({ kingdom: KINGDOM_BIDDER });
    const bidAuction = await backend.bidAuction(KINGDOM_OUTBIDDER, auctionBefore.id, bid);
    expect(bidAuction.gold).toBe(bid);
    const auctionAfter = (await admin.firestore().collection(`auctions`).get()).docs[0];
    expect(auctionAfter.exists).toBe(true);
    const auctionAfterData = auctionAfter.data();
    expect(auctionAfterData.gold).toBe(bid);
    expect(auctionAfterData.auctioned - auctionBeforeData.auctioned).toBe(AUCTION_TIME_OUTBID);
  });

  it('should REFRESH the AUCTIONS', async () => {
    const auctions = await admin.firestore().collection(`auctions`).listDocuments();
    expect(auctions.length).toBe(5);
    auctions.forEach(auction => batch.update(auction, { kingdom: KINGDOM_BIDDER, auctioned: moment(admin.firestore.Timestamp.now().toMillis()).add(-1, 'months') }));
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
