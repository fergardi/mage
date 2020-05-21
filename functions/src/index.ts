'use strict';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import * as express from 'express';
import * as ash from 'express-async-handler';

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
app.get('/turns', ash(async (req: any, res: any) => res.json(await addTurns(TURNS))));
app.get('/kingdom/:kingdom/explore/:turns', ash(async (req: any, res: any) => res.json(await exploreLands(req.params.kingdom, parseInt(req.params.turns)))));
app.get('/kingdom/:kingdom/charge/:turns', ash(async (req: any, res: any) => res.json(await chargeMana(req.params.kingdom, parseInt(req.params.turns)))));
app.get('/kingdom/:kingdom/tax/:turns', ash(async (req: any, res: any) => res.json(await taxGold(req.params.kingdom, parseInt(req.params.turns)))));
app.get('/kingdom/:kingdom/army/:unit/recruit/:quantity', ash(async (req: any, res: any) => res.json(await recruitUnits(req.params.kingdom, req.params.unit, parseInt(req.params.quantity)))));
app.get('/kingdom/:kingdom/army/:troop/disband/:quantity', ash(async (req: any, res: any) => res.json(await disbandTroops(req.params.kingdom, req.params.troop, parseInt(req.params.quantity)))));
app.get('/kingdom/:kingdom/sorcery/:charm/research/:turns', ash(async (req: any, res: any) => res.json(await researchCharm(req.params.kingdom, req.params.charm, parseInt(req.params.turns)))));
app.get('/kingdom/:kingdom/sorcery/:charm/conjure/:target', ash(async (req: any, res: any) => res.json(await conjureCharm(req.params.kingdom, req.params.charm, req.params.target))));
app.get('/kingdom/:kingdom/sorcery/:artifact/activate/:target', ash(async (req: any, res: any) => res.json(await activateArtifact(req.params.kingdom, req.params.artifact, req.params.target))));
app.get('/kingdom/:kingdom/auction/:auction/bid/:gold', ash(async (req: any, res: any) => res.json(await bidAuction(req.params.kingdom, req.params.auction, req.params.gold))));
app.use((err: any, req: any, res: any, next: any) => res.status(500).json({ status: 500, error: err.message }));

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
  return { turns: turns };
}

const exploreLands = async (kingdomId: string, turns: number) => {
  let lands = LANDS;
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    let kingdomLand = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').get();
    let l = kingdomLand.docs[0].data();
    for (let i = 0; i < turns; i++) {
      lands += Math.floor((MAX_LANDS - (l.max + l.balance + lands)) / 100);
    }
    const batch = angularFirestore.batch();
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomTurn.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-turns) });
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomLand.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(lands), max: admin.firestore.FieldValue.increment(lands) });
    batch.commit();
  }
  return { lands: lands };
}

const recruitUnits = async (kingdomId: string, unitId: string, quantity: number) => {
  let kingdomUnit = await angularFirestore.doc(`units/${unitId}`).get();
  if (kingdomUnit.data()?.recruitable) {
    let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').get();
    let kingdomGold = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').get();
    // let kingdomBarrack = await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'barrack').get();
    let turns = quantity; // TODO turns
    let gold = kingdomUnit.data()?.gold * quantity;
    if (turns <= kingdomTurn.docs[0].data().quantity && gold <= kingdomGold.docs[0].data().quantity) {
      let kingdomTroop = await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).where('id', '==', unitId).get();
      const batch = angularFirestore.batch();
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomTurn.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-turns) });
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomGold.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-gold) });
      // batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${kingdomBarrack.docs[0].id}`), { total: admin.firestore.FieldValue.increment(quantity) });
      if (kingdomTroop.size > 0) {
        batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/troops/${kingdomTroop.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
      } else {
        batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: unitId, quantity: quantity });
      }
      batch.commit();
    }
  }
  return { quantity: quantity };
}

const disbandTroops = async (kingdomId: string, troop: string, quantity: number) => {
  let kingdomTroop = await angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troop}`).get();
  if (kingdomTroop.exists) {
    let kingdomUnit = await angularFirestore.doc(`units/${kingdomTroop.id}`).get();
    if (kingdomUnit.exists && kingdomUnit.data()?.disbandable) {
      if (quantity >= kingdomTroop.data()?.quantity) {
        angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troop}`).delete();
      } else {
        angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troop}`).update({ quantity: admin.firestore.FieldValue.increment(-quantity) });
      }
    }
  }
  return { quantity: quantity };
}

const chargeMana = async (kingdomId: string, turns: number) => {
  let mana = 0;
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    const batch = angularFirestore.batch();
    let kingdomMana = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'mana').get();
    let kingdomNode = await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'node').get();
    mana = kingdomNode.docs[0].data().quantity * 10 * turns;
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomTurn.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-turns) });
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomMana.docs[0].id}`), { quantity: kingdomMana.docs[0].data().quantity + mana > kingdomMana.docs[0].data().max ? kingdomMana.docs[0].data().max : admin.firestore.FieldValue.increment(mana) });
    batch.commit();
  }
  return { mana: mana };
}

const taxGold = async (kingdomId: string, turns: number) => {
  let gold = 0;
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    const batch = angularFirestore.batch();
    let kingdomGold = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').get();
    let kingdomVillage = await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'village').get();
    gold = kingdomVillage.docs[0].data().quantity * 10 * turns;
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomTurn.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-turns) });
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomGold.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(gold) });
    batch.commit();
  }
  return { gold: gold };
}

const researchCharm = async (kingdomId: string, charmId: string, turns: number) => {
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    let kingdomCharm = await angularFirestore.doc(`kingdoms/${kingdomId}/charms/${charmId}`).get();
    if (kingdomCharm.exists) {
      const batch = angularFirestore.batch();
      let charm = kingdomCharm.data();
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomTurn.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-turns) });
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/charms/${kingdomCharm.id}`), { turns: admin.firestore.FieldValue.increment(turns), completed: charm?.turns + turns >= charm?.total });
      batch.commit();
    }
  }
  return { turns: turns };
}

const conjureCharm = async (kingdomId: string, charmId: string, targetId: string) => {
  let turns = 0;
  let mana = 0;
  let kingdomCharm = await angularFirestore.doc(`kingdoms/${kingdomId}/charms/${charmId}`).get();
  if (kingdomCharm.exists) {
    let charm = kingdomCharm.data();
    let kingdomSpell = await angularFirestore.doc(`spells/${charm?.id}`).get();
    let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').get();
    let kingdomMana = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'mana').get();
    let spell = kingdomSpell.data();
    turns = spell?.turns;
    mana = spell?.mana;
    if (charm?.completed && turns <= kingdomTurn.docs[0].data().quantity && mana <= kingdomMana.docs[0].data().quantity) {
      const batch = angularFirestore.batch();
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomTurn.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-turns) });
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomMana.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-mana) });
      switch (spell?.type) {
        case 'summon':
          let unitId = spell?.units[Math.floor(Math.random() * spell?.units.length)];
          let quantity = Math.floor(Math.random() * (Math.max(...spell?.amount) - Math.min(...spell?.amount)) + Math.min(...spell?.amount));
          let kingdomTroop = await angularFirestore.collection(`kingdoms/${targetId}/troops`).where('id', '==', unitId).get();
          if (kingdomTroop.size > 0) {
            batch.update(angularFirestore.doc(`kingdoms/${targetId}/troops/${kingdomTroop.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
          } else {
            batch.create(angularFirestore.collection(`kingdoms/${targetId}/troops`).doc(), { id: unitId, quantity: quantity });
          }
          break;
      }
      batch.commit();
    }
  }
  return { turns: turns, mana: mana };
}

const activateArtifact = async (kingdomId: string, artifactId: string, targetId: string) => {
  let turns = 0;
  let kingdomArtifact = await angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${artifactId}`).get();
  if (kingdomArtifact.exists) {
    let artifact = kingdomArtifact.data();
    let kingdomItem = await angularFirestore.doc(`items/${artifact?.id}`).get();
    let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').get();
    let item = kingdomItem?.data();
    turns = item?.turns;
    if (artifact?.quantity > 0 && turns <= kingdomTurn.docs[0].data().quantity) {
      const batch = angularFirestore.batch();
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomTurn.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-turns) });
      if (artifact?.quantity > 1) {
        batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${artifactId}`), { quantity: admin.firestore.FieldValue.increment(-1) });
      } else {
        batch.delete(angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${artifactId}`));
      }
      switch (item?.type) {
        case 'summon':
          let unitId = item?.units[Math.floor(Math.random() * item?.units.length)];
          let quantity = Math.floor(Math.random() * (Math.max(...item?.amount) - Math.min(...item?.amount)) + Math.min(...item?.amount));
          let kingdomTroop = await angularFirestore.collection(`kingdoms/${targetId}/troops`).where('id', '==', unitId).get();
          if (kingdomTroop.size > 0) {
            batch.update(angularFirestore.doc(`kingdoms/${targetId}/troops/${kingdomTroop.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
          } else {
            batch.create(angularFirestore.collection(`kingdoms/${targetId}/troops`).doc(), { id: unitId, quantity: quantity });
          }
          break;
      }
      batch.commit();
    }
  }
  return { turns: turns };
}

const bidAuction = async (kingdomId: string, auctionId: string, gold: number) => {
  let kingdomAuction = await angularFirestore.doc(`auctions/${auctionId}`).get();
  if (kingdomAuction.exists) {
    let auction = kingdomAuction.data();
    let kingdomGold = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').get();
    if (gold <= kingdomGold.docs[0].data().quantity && gold >= Math.floor(auction?.gold * 1.10) && kingdomId !== auction?.from) {
      const batch = angularFirestore.batch();
      if (auction?.from) {
        let kingdomFromGold = await angularFirestore.collection(`kingdoms/${auction?.from}/supplies`).where('id', '==', 'gold').get();
        batch.update(angularFirestore.doc(`kingdoms/${auction?.from}/supplies/${kingdomFromGold.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(Math.floor(auction?.gold * 0.90)) });
      }
      batch.update(angularFirestore.doc(`auctions/${auctionId}`), { from: kingdomId, gold: gold });
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomGold.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-gold) });
      batch.commit();
    }
  }
  return { gold: gold };
}
