import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(require('../mage-c4259-firebase-adminsdk-ah05o-b65a21f567.json'))
});
const angularFirestore = admin.firestore();

const TURNS: number = 5;

export const turnsSchedule = functions.pubsub.schedule('*/5 * * * *').onRun(async context => {
  return addTurns(TURNS);
});

const addTurns = async (turns: number) => {
  const batch = angularFirestore.batch();
  let kingdoms = await angularFirestore.collection('kingdoms').get();
  await Promise.all(kingdoms.docs.map(async kingdom => {
    let kingdomSupplies = await angularFirestore.collection(`kingdoms/${kingdom.id}/supplies`).where('id', '==', 'turn').get();
    batch.update(angularFirestore.doc(`kingdoms/${kingdom.id}/supplies/${kingdomSupplies.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(turns) });
  }))
  return await batch.commit();
}
