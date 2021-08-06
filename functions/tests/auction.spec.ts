import 'jest';
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { createKingdom, KingdomType, refreshAuctions } from '../index';
import { deleteKingdom } from '../fixtures';
// tslint:disable-next-line: no-duplicate-imports
import * as backend from '../index';
import * as moment from 'moment';

const config: admin.AppOptions = {
  databaseURL: 'https://mage-c4259.firebaseio.com',
  projectId: 'mage-c4259',
  credential: admin.credential.cert(require('../credentials/test.json')),
};
const tester = functions(config);

const KINGDOM = 'AUCTION';
const COLOR = KingdomType.RED;

describe(KINGDOM, () => {
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

  it('should REFRESH the AUCTIONS', async () => {
    const auctions = await admin.firestore().collection(`auctions`).listDocuments();
    auctions.forEach(auction => batch.update(auction, { kingdom: KINGDOM, auctioned: moment(admin.firestore.Timestamp.now().toMillis()).add(-1, 'months') }));
    await batch.commit();
    const addArtifactSpy = jest.spyOn(backend, 'addArtifact');
    const addCharmSpy = jest.spyOn(backend, 'addCharm');
    const addContractSpy = jest.spyOn(backend, 'addContract');
    const addTroopSpy = jest.spyOn(backend, 'addTroop');
    const addLetterSpy = jest.spyOn(backend, 'addLetter');
    const startAuctionSpy = jest.spyOn(backend, 'startAuction');
    await refreshAuctions();
    expect(addArtifactSpy).toHaveBeenCalledTimes(2);
    expect(addCharmSpy).toHaveBeenCalledTimes(1);
    expect(addContractSpy).toHaveBeenCalledTimes(1);
    expect(addTroopSpy).toHaveBeenCalledTimes(1);
    expect(addLetterSpy).toHaveBeenCalledTimes(5);
    expect(startAuctionSpy).toHaveBeenCalledTimes(5);
  });

  it('should BID the AUCTION', async () => {
    // TODO
    // await bidAuction();
  });

  it('should DELETE the KINGDOM', async () => {
    await deleteKingdom(KINGDOM, admin.firestore());
    const kingdom = await admin.firestore().doc(`kingdoms/${KINGDOM}`).get();
    expect(kingdom.exists).toBe(false);
  });

});
