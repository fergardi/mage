'use strict';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import * as express from 'express';

const TURNS: number = 5;
const MAX_TURNS: number = 300;
const LANDS: number = 1;
const MAX_LANDS: number = 3500;

admin.initializeApp({
  credential: admin.credential.cert(require('../credentials/mage-c4259-firebase-adminsdk-ah05o-b65a21f567.json'))
});
const angularFirestore = admin.firestore();

const app = express();
app.use(cors({ origin: true }));

// export const turnsSchedule = functions.pubsub.schedule('*/5 * * * *').onRun(async context => {
//   return addTurns(TURNS);
// });

app.get('/turns', (req: any, res: any) => res.send(addTurns(TURNS)));
app.get('/kingdom/:kingdom/explore/:turns', (req: any, res: any) => res.send(exploreLands(req.params.kingdom, parseInt(req.params.turns))));
app.get('/kingdom/:kingdom/charge/:turns', (req: any, res: any) => res.send(chargeMana(req.params.kingdom, parseInt(req.params.turns))));
app.get('/kingdom/:kingdom/tax/:turns', (req: any, res: any) => res.send(taxGold(req.params.kingdom, parseInt(req.params.turns))));
app.get('/kingdom/:kingdom/army/:unit/recruit/:quantity', (req: any, res: any) => res.send(recruitUnits(req.params.kingdom, req.params.unit, parseInt(req.params.quantity))));
app.get('/kingdom/:kingdom/army/:troop/disband/:quantity', (req: any, res: any) => res.send(disbandTroops(req.params.kingdom, req.params.troop, parseInt(req.params.quantity))));
app.get('/kingdom/:kingdom/sorcery/:charm/research/:turns', (req: any, res: any) => res.send(researchCharm(req.params.kingdom, req.params.charm, parseInt(req.params.turns))));

exports.api = functions
.region('europe-west1')
.https
.onRequest(app);

const addTurns = async (turns: number) => {
  const batch = angularFirestore.batch();
  let kingdoms = await angularFirestore.collection('kingdoms').get();
  await Promise.all(kingdoms.docs.map(async kingdom => {
    let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdom.id}/supplies`).where('id', '==', 'turn').where('quantity', '<', MAX_TURNS).get();
    batch.update(angularFirestore.doc(`kingdoms/${kingdom.id}/supplies/${kingdomTurn.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(turns) });
  }));
  batch.commit();
}

const exploreLands = async (kingdom: string, turns: number) => {
  let lands = LANDS;
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdom}/supplies`).where('id', '==', 'turn').get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    let kingdomLand = await angularFirestore.collection(`kingdoms/${kingdom}/supplies`).where('id', '==', 'land').get();
    let l = kingdomLand.docs[0].data();
    for (let i = 0; i < turns; i++) {
      lands += Math.floor((MAX_LANDS - (l.max + l.balance + lands)) / 100);
    }
    const batch = angularFirestore.batch();
    batch.update(angularFirestore.doc(`kingdoms/${kingdom}/supplies/${kingdomTurn.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-turns) });
    batch.update(angularFirestore.doc(`kingdoms/${kingdom}/supplies/${kingdomLand.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(lands), max: admin.firestore.FieldValue.increment(lands) });
    batch.commit();
  }
}

const recruitUnits = async (kingdom: string, unit: string, quantity: number) => {
  let kingdomUnit = await angularFirestore.doc(`units/${unit}`).get();
  if (kingdomUnit.data()?.recruitable) {
    let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdom}/supplies`).where('id', '==', 'turn').get();
    let kingdomGold = await angularFirestore.collection(`kingdoms/${kingdom}/supplies`).where('id', '==', 'gold').get();
    // let kingdomBarrack = await angularFirestore.collection(`kingdoms/${kingdom}/buildings`).where('id', '==', 'barrack').get();
    let kingdomTroop = await angularFirestore.collection(`kingdoms/${kingdom}/troops`).where('id', '==', unit).get();
    let turns = quantity; // TODO turns
    let gold = kingdomUnit.data()?.gold * quantity;
    if (turns <= kingdomTurn.docs[0].data().quantity && gold <= kingdomGold.docs[0].data().quantity) {
      const batch = angularFirestore.batch();
      batch.update(angularFirestore.doc(`kingdoms/${kingdom}/supplies/${kingdomTurn.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-turns) });
      batch.update(angularFirestore.doc(`kingdoms/${kingdom}/supplies/${kingdomGold.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-gold) });
      // batch.update(angularFirestore.doc(`kingdoms/${kingdom}/buildings/${kingdomBarrack.docs[0].id}`), { total: admin.firestore.FieldValue.increment(quantity) });
      if (kingdomTroop.size > 0) {
        batch.update(angularFirestore.doc(`kingdoms/${kingdom}/troops/${kingdomTroop.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
      } else {
        batch.create(angularFirestore.collection(`kingdoms/${kingdom}/troops`).doc(), { id: unit, quantity: quantity });
      }
      batch.commit();
    }
  }
}

const disbandTroops = async (kingdom: string, troop: string, quantity: number) => {
  let kingdomTroop = await angularFirestore.doc(`kingdoms/${kingdom}/troops/${troop}`).get();
  if (kingdomTroop.exists) {
    let kingdomUnit = await angularFirestore.doc(`units/${kingdomTroop.id}`).get();
    if (kingdomUnit.exists && kingdomUnit.data()?.disbandable) {
      if (quantity >= kingdomTroop.data()?.quantity) {
        angularFirestore.doc(`kingdoms/${kingdom}/troops/${troop}`).delete();
      } else {
        angularFirestore.doc(`kingdoms/${kingdom}/troops/${troop}`).update({ quantity: admin.firestore.FieldValue.increment(-quantity) });
      }
    }
  }
}

const chargeMana = async (kingdom: string, turns: number) => {
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdom}/supplies`).where('id', '==', 'turn').get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    const batch = angularFirestore.batch();
    let kingdomMana = await angularFirestore.collection(`kingdoms/${kingdom}/supplies`).where('id', '==', 'mana').get();
    let kingdomNode = await angularFirestore.collection(`kingdoms/${kingdom}/buildings`).where('id', '==', 'node').get();
    let mana = kingdomNode.docs[0].data().quantity * 10
    batch.update(angularFirestore.doc(`kingdoms/${kingdom}/supplies/${kingdomTurn.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-turns) });
    batch.update(angularFirestore.doc(`kingdoms/${kingdom}/supplies/${kingdomMana.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(mana) });
    batch.commit();
  }
}

const taxGold = async (kingdom: string, turns: number) => {
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdom}/supplies`).where('id', '==', 'turn').get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    const batch = angularFirestore.batch();
    let kingdomGold = await angularFirestore.collection(`kingdoms/${kingdom}/supplies`).where('id', '==', 'gold').get();
    let kingdomVillage = await angularFirestore.collection(`kingdoms/${kingdom}/buildings`).where('id', '==', 'village').get();
    let gold = kingdomVillage.docs[0].data().quantity * 10
    batch.update(angularFirestore.doc(`kingdoms/${kingdom}/supplies/${kingdomTurn.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-turns) });
    batch.update(angularFirestore.doc(`kingdoms/${kingdom}/supplies/${kingdomGold.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(gold) });
    batch.commit();
  }
}

const researchCharm = async (kingdom: string, charm: string, turns: number) => {
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdom}/supplies`).where('id', '==', 'turn').get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    let kingdomCharm = await angularFirestore.doc(`kingdoms/${kingdom}/charms/${charm}`).get();
    if (kingdomCharm.exists) {
      const batch = angularFirestore.batch();
      let charm = kingdomCharm.data();
      batch.update(angularFirestore.doc(`kingdoms/${kingdom}/supplies/${kingdomTurn.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-turns) });
      batch.update(angularFirestore.doc(`kingdoms/${kingdom}/charms/${kingdomCharm.id}`), { turns: admin.firestore.FieldValue.increment(turns), completed: charm?.turns + turns >= charm?.total });
      batch.commit();
    }
  }
}
