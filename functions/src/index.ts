'use strict';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import * as express from 'express';
import * as ash from 'express-async-handler';

const TURNS: number = 5;
const LANDS: number = 1;
const MAX_LANDS: number = 3500;

export const enum RewardType {
  'enchantment' = 'enchantment',
  'contract' = 'contract',
  'artifact' = 'artifact',
  'summon' = 'summon',
  'resource' = 'resource',
}

export const enum ResourceType {
  'gold' = 'gold',
  'population' = 'population',
  'land' = 'land',
  'gem' = 'gem',
  'mana' = 'mana',
  'turn' = 'turn',
}

admin.initializeApp({
  credential: admin.credential.cert(require('../credentials/mage-c4259-firebase-adminsdk-ah05o-b65a21f567.json'))
});
const angularFirestore = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.get('/advance', ash(async (req: any, res: any) => res.json(await advanceTime(TURNS))));
app.get('/kingdom/:kingdomId/explore/:turns', ash(async (req: any, res: any) => res.json(await exploreLands(req.params.kingdomId, parseInt(req.params.turns)))));
app.get('/kingdom/:kingdomId/charge/:turns', ash(async (req: any, res: any) => res.json(await chargeMana(req.params.kingdomId, parseInt(req.params.turns)))));
app.get('/kingdom/:kingdomId/tax/:turns', ash(async (req: any, res: any) => res.json(await taxGold(req.params.kingdomId, parseInt(req.params.turns)))));
app.get('/kingdom/:kingdomId/army/:unitId/recruit/:quantity', ash(async (req: any, res: any) => res.json(await recruitUnits(req.params.kingdomId, req.params.unitId, parseInt(req.params.quantity)))));
app.get('/kingdom/:kingdomId/army/:troopId/disband/:quantity', ash(async (req: any, res: any) => res.json(await disbandTroops(req.params.kingdomId, req.params.troopId, parseInt(req.params.quantity)))));
app.get('/kingdom/:kingdomId/sorcery/:charmId/research/:turns', ash(async (req: any, res: any) => res.json(await researchCharm(req.params.kingdomId, req.params.charmId, parseInt(req.params.turns)))));
app.get('/kingdom/:kingdomId/sorcery/:charmId/conjure/:target', ash(async (req: any, res: any) => res.json(await conjureCharm(req.params.kingdomId, req.params.charmId, req.params.target))));
app.get('/kingdom/:kingdomId/sorcery/:artifactId/activate/:target', ash(async (req: any, res: any) => res.json(await activateArtifact(req.params.kingdomId, req.params.artifactId, req.params.target))));
app.get('/kingdom/:kingdomId/auction/:auctionId/bid/:gold', ash(async (req: any, res: any) => res.json(await bidAuction(req.params.kingdomId, req.params.auctionId, parseInt(req.params.gold)))));
app.get('/kingdom/:kingdomId/temple/:godId/offer/:gold', ash(async (req: any, res: any) => res.json(await offerGod(req.params.kingdomId, req.params.godId, parseInt(req.params.gold)))));
app.use((err: any, req: any, res: any, next: any) => res.status(500).json({ status: 500, error: err.message }));

exports.api = functions
.region('europe-west1')
.https
.onRequest(app);

/**
 * add supply to a kingdom
 * @param kingdomId
 * @param supply
 * @param quantity
 * @param batch
 */
const addSupply = async (kingdomId: string, supply: ResourceType, quantity: number, batch: FirebaseFirestore.WriteBatch) => {
  let kingdomSupply = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', supply).get();
  let s = kingdomSupply.docs[0].data();
  batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomSupply.docs[0].id}`), { quantity: s.max && s.quantity + quantity > s.max ? s.max : admin.firestore.FieldValue.increment(quantity) });
}

/**
 * add troop to a kingdom
 * @param kingdomId
 * @param unitId
 * @param quantity
 * @param batch
 */
const addTroop = async (kingdomId: string, unitId: string, quantity: number, batch: FirebaseFirestore.WriteBatch) => {
  let kingdomTroop = await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).where('id', '==', unitId).get();
  if (kingdomTroop.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/troops/${kingdomTroop.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: unitId, quantity: quantity });
  }
}

/**
 * add artifact to a kingdom
 * @param kingdomId
 * @param itemId
 * @param quantity
 * @param batch
 */
const addArtifact = async (kingdomId: string, itemId: string, quantity: number, batch: FirebaseFirestore.WriteBatch) => {
  let kingdomArtifact = await angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).where('id', '==', itemId).get();
  if (kingdomArtifact.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${kingdomArtifact.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).doc(), { id: itemId, quantity: quantity });
  }
}

/**
 * add contract to a kingdom
 * @param kingdomId
 * @param heroId
 * @param level
 * @param batch
 */
const addContract = async (kingdomId: string, heroId: string, level: number, batch: FirebaseFirestore.WriteBatch) => {
  let kingdomContract = await angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).where('id', '==', heroId).get();
  if (kingdomContract.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${kingdomContract.docs[0].id}`), { level: admin.firestore.FieldValue.increment(level) });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).doc(), { id: heroId, level: level });
  }
}

/**
 * add enchantment to a kingdom
 * @param kingdomId
 * @param spellId
 * @param originId
 * @param turns
 * @param batch
 */
const addEnchantment = async (kingdomId: string, spellId: string, originId: string|null = null, turns: number, batch: FirebaseFirestore.WriteBatch) => {
  let kingdomEnchantment = await angularFirestore.collection(`kingdoms/${kingdomId}/enchantments`).where('id', '==', spellId).get();
  if (kingdomEnchantment.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/enchantments/${kingdomEnchantment.docs[0].id}`), { from: originId, turns: admin.firestore.FieldValue.increment(turns) });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/enchantments`).doc(), { id: spellId, from: originId, turns: turns });
  }
}

/**
 * add charm to a kingdom
 * @param kingdomId
 * @param spellId
 * @param turns
 * @param batch
 */
const addCharm = async (kingdomId: string, spellId: string, turns: number, batch: FirebaseFirestore.WriteBatch) => {
  let kingdomCharm = await angularFirestore.collection(`kingdoms/${kingdomId}/charms`).where('id', '==', spellId).get();
  if (kingdomCharm.size > 0) {
    let charm = kingdomCharm.docs[0].data();
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/charms/${kingdomCharm.docs[0].id}`), { turns: admin.firestore.FieldValue.increment(turns), completed: charm?.turns + turns >= charm?.total });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: spellId, turns: 0 });
  }
}

/**
 * all kingdoms advance time on a given number of turns
 * @param turns
 */
const advanceTime = async (turns: number) => {
  const batch = angularFirestore.batch();
  let kingdoms = await angularFirestore.collection('kingdoms').get();
  await Promise.all(kingdoms.docs.map(async kingdom => {
    await addSupply(kingdom.id, ResourceType.turn, turns, batch);
  }));
  await batch.commit();
  return { turns: turns };
}

/**
 * kingdom explores lands on a given number of turns
 * @param kingdomId
 * @param turns
 */
const exploreLands = async (kingdomId: string, turns: number) => {
  let lands = LANDS;
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', ResourceType.turn).get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    let kingdomLand = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', ResourceType.land).get();
    let l = kingdomLand.docs[0].data();
    for (let i = 0; i < turns; i++) {
      lands += Math.floor((MAX_LANDS - (l.max + l.balance + lands)) / 100);
    }
    const batch = angularFirestore.batch();
    await addSupply(kingdomId, ResourceType.turn, -turns, batch);
    await addSupply(kingdomId, ResourceType.land, lands, batch);
    await batch.commit();
  } else {
    throw new Error('api.error.turns');
  }
  return { lands: lands };
}

/**
 * kingdom recruits units on a given number
 * @param kingdomId
 * @param unitId
 * @param quantity
 */
const recruitUnits = async (kingdomId: string, unitId: string, quantity: number) => {
  let kingdomUnit = await angularFirestore.doc(`units/${unitId}`).get();
  if (kingdomUnit.data()?.recruitable) {
    let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', ResourceType.turn).get();
    let kingdomGold = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', ResourceType.gold).get();
    // let kingdomBarrack = await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'barrack').get();
    let turns = quantity; // TODO turns
    let gold = kingdomUnit.data()?.gold * quantity;
    if (turns <= kingdomTurn.docs[0].data().quantity && gold <= kingdomGold.docs[0].data().quantity) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, ResourceType.turn, -turns, batch);
      await addSupply(kingdomId, ResourceType.gold, -gold, batch);
      // batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${kingdomBarrack.docs[0].id}`), { total: admin.firestore.FieldValue.increment(quantity) });
      await addTroop(kingdomId, unitId, quantity, batch);
      await batch.commit();
    } else {
      if (turns <= kingdomTurn.docs[0].data().quantity) throw new Error('api.error.turns');
      if (gold <= kingdomGold.docs[0].data().quantity) throw new Error('api.error.gold');
    }
  } else {
    throw new Error('api.error.recruitable');
  }
  return { quantity: quantity };
}

/**
 * kingdom disbands troops on a given number
 * @param kingdomId
 * @param troop
 * @param quantity
 */
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
    } else {
      if (!kingdomUnit.exists) throw new Error('api.error.unit');
      if (!kingdomUnit.data()?.disbandable) throw new Error('api.error.disbandable')
    }
  } else {
    throw new Error('api.error.troop');
  }
  return { quantity: quantity };
}

/**
 * kingdom charges mana a given number of turns
 * @param kingdomId
 * @param turns
 */
const chargeMana = async (kingdomId: string, turns: number) => {
  let mana = 0;
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', ResourceType.turn).get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    const batch = angularFirestore.batch();
    let kingdomNode = await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'node').get();
    mana = kingdomNode.docs[0].data().quantity * 10 * turns;
    await addSupply(kingdomId, ResourceType.turn, -turns, batch);
    await addSupply(kingdomId, ResourceType.mana, mana, batch);
    await batch.commit();
  }
  return { mana: mana };
}

/**
 * kingdom taxes gold a given number of turns
 * @param kingdomId
 * @param turns
 */
const taxGold = async (kingdomId: string, turns: number) => {
  let gold = 0;
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', ResourceType.turn).get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    const batch = angularFirestore.batch();
    let kingdomVillage = await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'village').get();
    gold = kingdomVillage.docs[0].data().quantity * 10 * turns;
    await addSupply(kingdomId, ResourceType.turn, -turns, batch);
    await addSupply(kingdomId, ResourceType.gold, gold, batch);
    await batch.commit();
  } else {
    throw new Error('api.error.turns')
  }
  return { gold: gold };
}

/**
 * kingdom researchs charm a given number of turns
 * @param kingdomId
 * @param charmId
 * @param turns
 */
const researchCharm = async (kingdomId: string, charmId: string, turns: number) => {
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', ResourceType.turn).get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    const batch = angularFirestore.batch();
    await addSupply(kingdomId, ResourceType.turn, -turns, batch);
    await addCharm(kingdomId, charmId, turns, batch);
    await batch.commit();
  }
  return { turns: turns };
}

/**
 * kingdom conjure spell on target kingdom, even on itself
 * @param kingdomId
 * @param charmId
 * @param targetId
 */
const conjureCharm = async (kingdomId: string, charmId: string, targetId: string) => {
  let turns = 0;
  let mana = 0;
  let kingdomCharm = await angularFirestore.doc(`kingdoms/${kingdomId}/charms/${charmId}`).get();
  if (kingdomCharm.exists) {
    let charm = kingdomCharm.data();
    let kingdomSpell = await angularFirestore.doc(`spells/${charm?.id}`).get();
    let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', ResourceType.turn).get();
    let kingdomMana = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', ResourceType.mana).get();
    let spell = kingdomSpell.data();
    turns = spell?.turns;
    mana = spell?.mana;
    if (charm?.completed && turns <= kingdomTurn.docs[0].data().quantity && mana <= kingdomMana.docs[0].data().quantity) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, ResourceType.turn, -turns, batch);
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomMana.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-mana) });
      switch (spell?.type) {
        case 'summon':
          let unitId = spell?.units[Math.floor(Math.random() * spell?.units.length)];
          let quantity = Math.floor(Math.random() * (Math.max(...spell?.amount) - Math.min(...spell?.amount)) + Math.min(...spell?.amount));
          await addTroop(targetId, unitId, quantity, batch);
          break;
      }
      await batch.commit();
    }
  }
  return { turns: turns, mana: mana };
}

/**
 * kingdom activates artifacts on target kingdom, even on itself
 * @param kingdomId
 * @param artifactId
 * @param targetId
 */
const activateArtifact = async (kingdomId: string, artifactId: string, targetId: string) => {
  let turns = 0;
  let kingdomArtifact = await angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${artifactId}`).get();
  if (kingdomArtifact.exists) {
    let artifact = kingdomArtifact.data();
    let kingdomItem = await angularFirestore.doc(`items/${artifact?.id}`).get();
    let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', ResourceType.turn).get();
    let item = kingdomItem?.data();
    turns = item?.turns;
    if (artifact?.quantity > 0 && turns <= kingdomTurn.docs[0].data().quantity) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, ResourceType.turn, -turns, batch);
      if (artifact?.quantity > 1) {
        batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${artifactId}`), { quantity: admin.firestore.FieldValue.increment(-1) });
      } else {
        batch.delete(angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${artifactId}`));
      }
      switch (item?.type) {
        case 'summon':
          let unitId = item?.units[Math.floor(Math.random() * item?.units.length)];
          let quantity = Math.floor(Math.random() * (Math.max(...item?.amount) - Math.min(...item?.amount)) + Math.min(...item?.amount));
          await addTroop(targetId, unitId, quantity, batch);
          break;
      }
      await batch.commit();
    }
  }
  return { turns: turns };
}

/**
 * kingdom bids an auction with gold
 * @param kingdomId
 * @param auctionId
 * @param gold
 */
const bidAuction = async (kingdomId: string, auctionId: string, gold: number) => {
  let kingdomAuction = await angularFirestore.doc(`auctions/${auctionId}`).get();
  if (kingdomAuction.exists) {
    let auction = kingdomAuction.data();
    let kingdomGold = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', ResourceType.gold).get();
    if (gold <= kingdomGold.docs[0].data().quantity && gold >= Math.floor(auction?.gold * 1.10) && kingdomId !== auction?.kingdom) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, ResourceType.gold, -gold, batch);
      if (auction?.kingdom) {
        await addSupply(auction?.kingdom, ResourceType.gold, Math.floor(auction?.gold * 0.90), batch);
      }
      batch.update(angularFirestore.doc(`auctions/${auctionId}`), { kingdom: kingdomId, gold: gold });
      await batch.commit();
    }
  }
  return { gold: gold };
}

/**
 * kingdom offers gold to a god in exchange of some random rewards, good and bad
 * @param kingdomId
 * @param godId
 * @param gold
 */
const offerGod = async (kingdomId: string, godId: string, gold: number) => {
  let result = {};
  let kingdomGod = await angularFirestore.doc(`gods/${godId}`).get();
  if (kingdomGod.exists) {
    let god = kingdomGod.data();
    let kingdomGold = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', ResourceType.gold).get();
    if (gold <= kingdomGold.docs[0].data().quantity && gold >= Math.ceil(god?.gold * 1.10) /*&& kingdomId !== god?.kingdom*/) {
      const batch = angularFirestore.batch();
      batch.update(angularFirestore.doc(`gods/${godId}`), { /*kingdom: kingdomId,*/ gold: gold });
      await addSupply(kingdomId, ResourceType.gold, -gold, batch);
      let rewards: RewardType[] = [RewardType.enchantment, RewardType.contract, RewardType.summon, RewardType.resource];
      let reward: RewardType = rewards[Math.floor(Math.random() * rewards.length)];
      switch (reward) {
        case RewardType.enchantment:
          let enchantmentsByFaction: any[] = [
            {
              faction: 'black',
              enchantments: [
                'necromancy-touch',
                'death-decay',
                'shroud-darkness',
                'soul-pact',
                'black-death',
                'blood-ritual',
              ],
            }, {
              faction: 'black',
              enchantments: [
                'battle-chant',
                'meteor-storm',
                'fire-wall',
              ],
            }, {
              faction: 'blue',
              enchantments: [
                'concentration',
                'confuse',
                'hallucination',
                'ice-wall',
                'laziness',
              ],
            }, {
              faction: 'green',
              enchantments: [
                'druidism',
                'climate-control',
                'locust-swarm',
                'natures-favor',
                'sunray',
              ],
            }, {
              faction: 'white',
              enchantments: [
                'divine-protection',
                'love-peace',
              ],
            }
          ];
          let enchantments = enchantmentsByFaction.find((e: any)  => e.faction === god?.faction).enchantments;
          let enchantmentId = enchantments[Math.floor(Math.random() * enchantments.length)];
          let turns = Math.floor(Math.random() * 1000);
          await addEnchantment(kingdomId, enchantmentId, null, turns, batch);
          break;
        case RewardType.contract:
          let heroes = [
            'dragon-rider',
          ];
          let heroId = heroes[Math.floor(Math.random() * heroes.length)];
          let level = Math.floor(Math.random() * 10);
          await addContract(kingdomId, heroId, level, batch);
          break;
        case RewardType.artifact:
          let items = [
            'golden-chest',
            'magical-chest',
            'stone-chest',
            'wooden-chest',
            'necronomicon',
            'enchanted-lamp',
            'wisdom-tome',
            'demon-horn',
            'lightning-orb',
            'dragon-egg',
            'crystal-ball',
            'agility-potion',
            'defense-potion',
            'cold-orb',
            'earth-orb',
            'fire-orb',
            'mana-potion',
            'light-orb',
            'strength-potion',
            'love-potion',
            'spider-web',
            'animal-fang',
            'bone-necklace',
            'crown-thorns',
            'voodoo-doll',
            'cursed-skull',
            'golden-feather',
            'golden-idol',
            'golem-book',
            'letter-thieves',
            'vial-venom',
            'lucky-coin',
            'lucky-horseshoe',
            'lucky-paw',
            'magic-beans',
            'magic-compass',
            'magic-scroll',
            'mana-vortex',
            'monkey-hand',
            'powder-barrel',
            'rattle',
            'rotten-food',
            'snake-eye',
            'treasure-map',
            'valhalla-horn',
            'bottomless-carcaj',
            'fairy-wings',
            'holy-grenade',
            'magic-ashes',
            'vampire-teeth',
          ];
          let itemId = items[Math.floor(Math.random() * items.length)];
          await addArtifact(kingdomId, itemId, 1, batch);
          break;
        case RewardType.summon:
          let unitsByFaction: any[] = [
            {
              faction: 'black',
              units: [
                'skeleton',
              ],
            }
          ];
          let units = unitsByFaction.find((u: any) => u.faction === god?.faction).units;
          let unitId = units[Math.floor(Math.random() * units.length)];
          let quantity = Math.floor(Math.random() * 100);
          await addTroop(kingdomId, unitId, quantity, batch);
          break;
        case RewardType.resource:
          let resources: ResourceType[] = [ResourceType.gold, ResourceType.mana, ResourceType.population, ResourceType.land];
          let resource: ResourceType = resources[Math.floor(Math.random() * resources.length)];
          switch (resource) {
            case ResourceType.gold:
              let gold = Math.floor(Math.random() * 1000000);
              await addSupply(kingdomId, ResourceType.gold, gold, batch);
              break;
            case ResourceType.mana:
              let mana = Math.floor(Math.random() * 1000000);
              await addSupply(kingdomId, ResourceType.mana, mana, batch);
              break;
            case ResourceType.population:
              let population = Math.floor(Math.random() * 1000000);
              await addSupply(kingdomId, ResourceType.population, population, batch);
              break;
            case ResourceType.land:
              let land = Math.floor(Math.random() * 100);
              await addSupply(kingdomId, ResourceType.land, land, batch);
              break;
          }
          break;
      }
      await batch.commit();
    } else {
      throw new Error('api.error.god');
    }
  } else {
    throw new Error('api.error.god');
  }
  return result;
}
