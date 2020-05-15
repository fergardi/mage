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
app.get('/kingdom/:id/explore/:turns', (req: any, res: any) => res.send(exploreLands(req.params.id, req.params.turns)));

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
  }))
  await batch.commit();
}

const exploreLands = async (id: string, turns: number) => {
  let lands = LANDS;
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${id}/supplies`).where('id', '==', 'turn').get();
  let kingdomLand = await angularFirestore.collection(`kingdoms/${id}/supplies`).where('id', '==', 'land').get();
  for (let i = 0; i < turns; i++) {
    lands += Math.floor((MAX_LANDS - (kingdomLand.docs[0].data().max + kingdomLand.docs[0].data().balance + lands)) / 100);
  }
  const batch = angularFirestore.batch();
  batch.update(angularFirestore.doc(`kingdoms/${id}/supplies/${kingdomTurn.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-turns) });
  batch.update(angularFirestore.doc(`kingdoms/${id}/supplies/${kingdomLand.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(lands), max: admin.firestore.FieldValue.increment(lands) });
  await batch.commit();
}
