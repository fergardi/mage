'use strict';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import * as express from 'express';
import * as ash from 'express-async-handler';
import * as moment from 'moment';

const MAX_TURNS: number = 300;
const MIN_LANDS: number = 1;
const MAX_LANDS: number = 3500;
const BATTLE_TURNS: number = 2;
const PROTECTION_TIME: number = 60;

type RewardType = 'enchantment' | 'contract' | 'artifact' | 'summon' | 'resource';
type ResourceType = 'gold' | 'population' | 'land' | 'gem' | 'mana' | 'turn';
type BattleType = 'siege' | 'pillage' | 'attack';

admin.initializeApp({ credential: admin.credential.cert(require('../credentials/key.json')) });
const angularFirestore: FirebaseFirestore.Firestore = admin.firestore();
const geo: any = require('geofirex');
const geofirex: any = geo.init(admin);

const api = express();
api.use(cors({ origin: true }));
api.use(express.json());
api.post('/kingdom', ash(async (req: any, res: any) => res.json(await createKingdom(req.body.kingdomId, req.body.factionId, req.body.name, parseFloat(req.body.latitude), parseFloat(req.body.longitude)))));
api.get('/kingdom/:kingdomId/explore/:turns', ash(async (req: any, res: any) => res.json(await exploreLands(req.params.kingdomId, parseInt(req.params.turns)))));
api.get('/kingdom/:kingdomId/charge/:turns', ash(async (req: any, res: any) => res.json(await chargeMana(req.params.kingdomId, parseInt(req.params.turns)))));
api.get('/kingdom/:kingdomId/tax/:turns', ash(async (req: any, res: any) => res.json(await taxGold(req.params.kingdomId, parseInt(req.params.turns)))));
api.get('/kingdom/:kingdomId/army/:unitId/recruit/:quantity', ash(async (req: any, res: any) => res.json(await recruitUnit(req.params.kingdomId, req.params.unitId, parseInt(req.params.quantity)))));
api.get('/kingdom/:kingdomId/army/:troopId/disband/:quantity', ash(async (req: any, res: any) => res.json(await disbandTroop(req.params.kingdomId, req.params.troopId, parseInt(req.params.quantity)))));
api.post('/kingdom/:kingdomId/army', ash(async (req: any, res: any) => res.json(await assignArmy(req.params.kingdomId, req.body.army))));
api.get('/kingdom/:kingdomId/battle/:battleId/target/:targetId', ash(async (req: any, res: any) => res.json(await battleKingdom(req.params.kingdomId, req.params.battleId, req.params.targetId))));
api.get('/kingdom/:kingdomId/sorcery/:charmId/research/:turns', ash(async (req: any, res: any) => res.json(await researchCharm(req.params.kingdomId, req.params.charmId, parseInt(req.params.turns)))));
api.get('/kingdom/:kingdomId/sorcery/:charmId/conjure/:targetId', ash(async (req: any, res: any) => res.json(await conjureCharm(req.params.kingdomId, req.params.charmId, req.params.targetId))));
api.get('/kingdom/:kingdomId/sorcery/:artifactId/activate/:targetId', ash(async (req: any, res: any) => res.json(await activateArtifact(req.params.kingdomId, req.params.artifactId, req.params.targetId))));
api.get('/kingdom/:kingdomId/auction/:auctionId/bid/:gold', ash(async (req: any, res: any) => res.json(await bidAuction(req.params.kingdomId, req.params.auctionId, parseInt(req.params.gold)))));
api.get('/kingdom/:kingdomId/temple/:godId/offer/:gold', ash(async (req: any, res: any) => res.json(await offerGod(req.params.kingdomId, req.params.godId, parseInt(req.params.gold)))));
api.get('/kingdom/:kingdomId/city/:buildingId/build/:quantity', ash(async (req: any, res: any) => res.json(await buildStructure(req.params.kingdomId, req.params.buildingId, parseInt(req.params.quantity)))));
api.get('/kingdom/:kingdomId/tavern/:contractId/assign/:assignmentId', ash(async (req: any, res: any) => res.json(await assignContract(req.params.kingdomId, req.params.contractId, parseInt(req.params.assignmentId)))));
api.get('/kingdom/:kingdomId/emporium/:itemId', ash(async (req: any, res: any) => res.json(await buyEmporium(req.params.kingdomId, req.params.itemId))));
api.use((err: any, req: any, res: any, next: any) => res.status(500).json({ status: 500, error: err.message }));

exports.api = functions
.region('europe-west1')
.https
.onRequest(api);

let factions: any[] = [
  {
    faction: 'black',
    units: [
      'vampire',
    ],
    enchantments: [
      'necromancy-touch',
      'death-decay',
      'shroud-darkness',
      'soul-pact',
      'black-death',
      'blood-ritual',
    ],
    heroes: [
      'necrophage',
      'necromancer',
      'dark-knight',
    ],
  }, {
    faction: 'white',
    units: [
      'behemoth',
    ],
    enchantments: [
      'divine-protection',
      'love-peace',
    ],
    heroes: [
      'commander',
      'trader',
      'silver-knight',
    ],
  }, {
    faction: 'red',
    units: [
      'phoenix',
    ],
    enchantments: [
      'battle-chant',
      'meteor-storm',
      'fire-wall',
    ],
    heroes: [
      'dragon-rider',
      'demon-prince',
      'engineer',
    ],
  }, {
    faction: 'blue',
    units: [
      'leviathan',
    ],
    enchantments: [
      'concentration',
      'confuse',
      'hallucination',
      'ice-wall',
      'laziness',
    ],
    heroes: [
      'shaman',
      'elementalist',
      'sage',
    ],
  }, {
    faction: 'green',
    units: [
      'wyvern',
    ],
    enchantments: [
      'druidism',
      'climate-control',
      'locust-swarm',
      'natures-favor',
      'sunray',
    ],
  }
];

const items = [
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

/**
 * add supply to a kingdom
 * @param kingdomId
 * @param supply
 * @param quantity
 * @param batch
 */
const addSupply = async (kingdomId: string, supply: ResourceType, quantity: number, batch: FirebaseFirestore.WriteBatch) => {
  const kingdomSupply = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', supply).limit(1).get();
  const s = kingdomSupply.docs[0].data();
  const q = s.max && (s.quantity + quantity > s.max) ? s.max : admin.firestore.FieldValue.increment(quantity);
  batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomSupply.docs[0].id}`), { quantity: q });
}

/**
 * add troop to a kingdom
 * @param kingdomId
 * @param unitId
 * @param quantity
 * @param batch
 */
const addTroop = async (kingdomId: string, unitId: string, quantity: number, batch: FirebaseFirestore.WriteBatch) => {
  let kingdomTroop = await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).where('id', '==', unitId).limit(1).get();
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
  let kingdomArtifact = await angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).where('id', '==', itemId).limit(1).get();
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
  let kingdomContract = await angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).where('id', '==', heroId).limit(1).get();
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
const addEnchantment = async (kingdomId: string, spellId: string, level: number, originId: string|null = null, turns: number, batch: FirebaseFirestore.WriteBatch) => {
  let kingdomEnchantment = await angularFirestore.collection(`kingdoms/${kingdomId}/enchantments`).where('id', '==', spellId).limit(1).get();
  if (kingdomEnchantment.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/enchantments/${kingdomEnchantment.docs[0].id}`), { from: originId, turns: admin.firestore.FieldValue.increment(turns) });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/enchantments`).doc(), { id: spellId, from: originId, turns: turns, level: level });
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
  let kingdomCharm = await angularFirestore.collection(`kingdoms/${kingdomId}/charms`).where('id', '==', spellId).limit(1).get();
  if (kingdomCharm.size > 0) {
    let charm = kingdomCharm.docs[0].data();
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/charms/${kingdomCharm.docs[0].id}`), { turns: admin.firestore.FieldValue.increment(turns), completed: charm?.turns + turns >= charm?.total });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: spellId, turns: 0 });
  }
}

/**
 * add buildings to a kingdom
 * @param kingdomId
 * @param buildingId
 * @param quantity
 * @param batch
 */
const addBuilding = async (kingdomId: string, buildingId: string, quantity: number, batch: FirebaseFirestore.WriteBatch) => {
  let kingdomLand = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').limit(1).get();
  let land = kingdomLand.docs[0].data();
  if (quantity <= land.quantity) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomLand.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(-quantity) });
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${buildingId}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
  }
}

/**
 * create a new kingdom of a specific faction
 * @param kingdomId
 * @param factionId
 */
const createKingdom = async (kingdomId: string, factionId: string, name: string, latitude: number, longitude: number) => {
  const batch = angularFirestore.batch();
  batch.create(angularFirestore.doc(`kingdoms/${kingdomId}`), { id: kingdomId, faction: factionId, position: geofirex.point(latitude, longitude), coordinates: { latitude: latitude, longitude: longitude }, name: name, power: 1500 });
  switch (factionId) {
    case 'black': {
      // troops
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: 'skeleton', quantity: 20000, assignment: 2 });
      // charms
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: 'animate-skeleton', turns: 0, completed: false, total: 200 });
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: 'fear', turns: 0, completed: false, total: 200 });
      break;
    }
    case 'green': {
      // troops
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: 'goblin', quantity: 20000, assignment: 2 });
      // charms
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: 'summon-goblin', turns: 0, completed: false, total: 200 });
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: 'cure', turns: 0, completed: false, total: 200 });
      break;
    }
    case 'red': {
      // troops
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: 'orc', quantity: 20000, assignment: 2 });
      // charms
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: 'fireball', turns: 0, completed: false, total: 200 });
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: 'call-orc', turns: 0, completed: false, total: 200 });
      break;
    }
    case 'blue': {
      // troops
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: 'mage', quantity: 20000, assignment: 2 });
      // charms
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: 'summon-mage', turns: 0, completed: false, total: 200 });
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: 'ice-shock', turns: 0, completed: false, total: 200 });
      break;
    }
    case 'white': {
      // troops
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: 'crusader', quantity: 20000, assignment: 2 });
      // charms
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: 'call-crusader', turns: 0, completed: false, total: 200 });
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: 'healing-hand', turns: 0, completed: false, total: 200 });
      break;
    }
  }
  // artifacts
  let itemId = items[Math.floor(Math.random() * items.length)];
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).doc(), { id: itemId, quantity: 1 });
  // supplies
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).doc(), { id: 'gold', quantity: 20000, max: null, balance: 0 });
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).doc(), { id: 'mana', quantity: 20000, max: 20000, balance: 0 });
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).doc(), { id: 'population', quantity: 20000, max: 20000, balance: 0 });
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).doc(), { id: 'gem', quantity: 10, max: null, balance: 0 });
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).doc(), { id: 'turn', quantity: 300, max: 300, balance: 0 });
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).doc(), { id: 'land', quantity: 300, max: null, balance: 0 });
  // buildings
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'barrack', quantity: 100 });
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'barrier', quantity: 100 });
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'farm', quantity: 100 });
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'fortress', quantity: 100 });
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'academy', quantity: 100 });
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'node', quantity: 100 });
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'village', quantity: 100 });
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'workshop', quantity: 100 });
  // commit
  return batch.commit();
}

/**
 * kingdom explores lands on a given number of turns
 * @param kingdomId
 * @param turns
 */
const exploreLands = async (kingdomId: string, turns: number) => {
  let lands = MIN_LANDS;
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    let kingdomLand = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').limit(1).get();
    let l = kingdomLand.docs[0].data();
    for (let i = 0; i < turns; i++) {
      lands += Math.floor((MAX_LANDS - (l.max + l.balance + lands)) / 100);
    }
    const batch = angularFirestore.batch();
    await addSupply(kingdomId, 'turn', -turns, batch);
    await addSupply(kingdomId, 'land', lands, batch);
    await batch.commit();
  } else throw new Error('api.error.turns');
  return { lands: lands };
}

/**
 * kingdom recruits units on a given number
 * @param kingdomId
 * @param unitId
 * @param quantity
 */
const recruitUnit = async (kingdomId: string, unitId: string, quantity: number) => {
  let kingdomUnit = await angularFirestore.doc(`units/${unitId}`).get();
  if (kingdomUnit.data()?.recruitable) {
    let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get();
    let kingdomGold = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get();
    // let kingdomBarrack = await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'barrack').get();
    let turns = quantity; // TODO turns
    let gold = kingdomUnit.data()?.gold * quantity;
    if (turns <= kingdomTurn.docs[0].data().quantity && gold <= kingdomGold.docs[0].data().quantity) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, 'turn', -turns, batch);
      await addSupply(kingdomId, 'gold', -gold, batch);
      // batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${kingdomBarrack.docs[0].id}`), { total: admin.firestore.FieldValue.increment(quantity) });
      await addTroop(kingdomId, unitId, quantity, batch);
      await batch.commit();
    } else {
      if (turns <= kingdomTurn.docs[0].data().quantity) throw new Error('api.error.turns');
      if (gold <= kingdomGold.docs[0].data().quantity) throw new Error('api.error.gold');
    }
  } else throw new Error('api.error.recruitable');
  return { quantity: quantity };
}

/**
 * kingdom disbands troops on a given number
 * @param kingdomId
 * @param troopId
 * @param quantity
 */
const disbandTroop = async (kingdomId: string, troopId: string, quantity: number) => {
  let kingdomTroop = await angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troopId}`).get();
  if (kingdomTroop.exists) {
    let kingdomUnit = await angularFirestore.doc(`units/${kingdomTroop.id}`).get();
    if (kingdomUnit.exists && kingdomUnit.data()?.disbandable) {
      if (quantity >= kingdomTroop.data()?.quantity) {
        angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troopId}`).delete();
      } else {
        angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troopId}`).update({ quantity: admin.firestore.FieldValue.increment(-quantity) });
      }
    } else {
      if (!kingdomUnit.exists) throw new Error('api.error.unit');
      if (!kingdomUnit.data()?.disbandable) throw new Error('api.error.disbandable')
    }
  } else throw new Error('api.error.troop');
  return { quantity: quantity };
}

/**
 * kingdom charges mana a given number of turns
 * @param kingdomId
 * @param turns
 */
const chargeMana = async (kingdomId: string, turns: number) => {
  let mana = 0;
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    const batch = angularFirestore.batch();
    let kingdomNode = await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'node').limit(1).get();
    mana = kingdomNode.docs[0].data().quantity * 10 * turns;
    await addSupply(kingdomId, 'turn', -turns, batch);
    await addSupply(kingdomId, 'mana', mana, batch);
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
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    const batch = angularFirestore.batch();
    let kingdomVillage = await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'village').limit(1).get();
    gold = kingdomVillage.docs[0].data().quantity * 10 * turns;
    await addSupply(kingdomId, 'turn', -turns, batch);
    await addSupply(kingdomId, 'gold', gold, batch);
    await batch.commit();
  } else throw new Error('api.error.turns');
  return { gold: gold };
}

/**
 * kingdom researchs charm a given number of turns
 * @param kingdomId
 * @param charmId
 * @param turns
 */
const researchCharm = async (kingdomId: string, charmId: string, turns: number) => {
  let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get();
  if (turns <= kingdomTurn.docs[0].data().quantity) {
    const batch = angularFirestore.batch();
    await addSupply(kingdomId, 'turn', -turns, batch);
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
    let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get();
    let kingdomMana = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'mana').limit(1).get();
    let spell = kingdomSpell.data();
    turns = spell?.turns;
    mana = spell?.mana;
    if (charm?.completed && turns <= kingdomTurn.docs[0].data().quantity && mana <= kingdomMana.docs[0].data().quantity) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, 'turn', -turns, batch);
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
    let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get();
    let item = kingdomItem?.data();
    turns = item?.turns;
    if (artifact?.quantity > 0 && turns <= kingdomTurn.docs[0].data().quantity) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, 'turn', -turns, batch);
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
    let kingdomGold = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get();
    if (gold <= kingdomGold.docs[0].data().quantity && gold >= Math.floor(auction?.gold * 1.10) && kingdomId !== auction?.kingdom) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, 'gold', -gold, batch);
      if (auction?.kingdom) {
        await addSupply(auction?.kingdom, 'gold', Math.floor(auction?.gold * 0.90), batch);
      }
      batch.update(angularFirestore.doc(`auctions/${auctionId}`), { kingdom: kingdomId, gold: gold });
      await batch.commit();
    }
  }
  return { gold: gold };
}

/**
 * kingdom builds structures
 * @param kingdomId
 * @param buildingId
 * @param quantity
 */
const buildStructure = async (kingdomId: string, buildingId: string, quantity: number) => {
  let kingdomBuilding = await angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${buildingId}`).get();
  if (kingdomBuilding.exists) {
    let kingdomWorkshop = await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'workshop').limit(1).get();
    let kingdomGold = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get();
    let kingdomLand = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').limit(1).get();
    let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get();
    let kingdomStructure = await angularFirestore.doc(`structures/${kingdomBuilding.data()?.id}`).get();
    let gold = kingdomStructure.data()?.goldCost * quantity;
    let turn = Math.ceil(quantity / Math.ceil((kingdomWorkshop.docs[0].data().quantity + 1) / kingdomStructure.data()?.turnRatio))
    if (quantity <= kingdomLand.docs[0].data().quantity && gold <= kingdomGold.docs[0].data().quantity && turn <= kingdomTurn.docs[0].data().quantity) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, 'gold', -gold, batch);
      await addSupply(kingdomId, 'turn', -turn, batch);
      await addSupply(kingdomId, 'land', -quantity, batch);
      await addBuilding(kingdomId, buildingId, quantity, batch);
      await batch.commit();
      return { quantity: quantity };
    } else throw new Error('api.error.build');
  } else throw new Error('api.error.build');
}

/**
 * kingdom offers a resource to a god in exchange of some random rewards, good and bad
 * @param kingdomId
 * @param godId
 * @param sacrifice
 */
const offerGod = async (kingdomId: string, godId: string, sacrifice: number) => {
  let result = {};
  let kingdomGod = await angularFirestore.doc(`gods/${godId}`).get();
  if (kingdomGod.exists) {
    let god = kingdomGod.data();
    let resource: ResourceType = god?.gold
      ? 'gold'
      : god?.mana
        ? 'mana'
        : god?.population
          ? 'population'
          : god?.land
            ? 'land'
            : 'turn';
    let kingdomResource = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', resource).limit(1).get();
    if (sacrifice <= kingdomResource.docs[0].data().quantity && sacrifice >= 1) {
      const batch = angularFirestore.batch();
      batch.update(angularFirestore.doc(`gods/${godId}`), { sacrifice: admin.firestore.FieldValue.increment(sacrifice), armageddon: true });
      await addSupply(kingdomId, resource, -sacrifice, batch);
      let rewards: RewardType[] = ['resource', 'artifact', 'contract', 'enchantment', 'summon'];
      let reward: RewardType = rewards[Math.floor(Math.random() * rewards.length)];
      switch (reward) {
        case 'enchantment':
          let enchantments = factions.find((e: any)  => e.faction === god?.faction).enchantments;
          let enchantmentId = enchantments[Math.floor(Math.random() * enchantments.length)];
          await addEnchantment(kingdomId, enchantmentId, 10, null, 300, batch);
          result = { enchantment: `spell.${enchantmentId}.name`, turns: 300, level: 10 };
          break;
        case 'contract':
          let heroes = factions.find((e: any)  => e.faction === god?.faction).heroes;
          let heroId = heroes[Math.floor(Math.random() * heroes.length)];
          let level = Math.floor(Math.random() * 9) + 1;
          await addContract(kingdomId, heroId, level, batch);
          result = { hero: `hero.${heroId}.name`, level: level };
          break;
        case 'artifact':
          let itemId = items[Math.floor(Math.random() * items.length)];
          await addArtifact(kingdomId, itemId, 1, batch);
          result = { item: `item.${itemId}.name`, quantity: 1 };
          break;
        case 'summon':
          let units = factions.find((u: any) => u.faction === god?.faction).units;
          let unitId = units[Math.floor(Math.random() * units.length)];
          let quantity = Math.floor(Math.random() * 100);
          await addTroop(kingdomId, unitId, quantity, batch);
          result = { unit: `unit.${unitId}.name`, quantity: quantity };
          break;
        case 'resource':
          let resources: ResourceType[] = ['gold', 'mana', 'population', 'land', 'turn'];
          let resource: ResourceType = resources[Math.floor(Math.random() * resources.length)];
          let amount = Math.floor(Math.random() * (resource === 'land' ? 100 : 100000));
          await addSupply(kingdomId, resource, amount, batch);
          result = { [resource]: amount };
          break;
      }
      await batch.commit();
    } else throw new Error('api.error.god');
  } else throw new Error('api.error.god');
  return result;
}

/**
 * kingdom assigns contract to an assignment
 * @param kingdomId
 * @param contractId
 * @param assignmentId
 */
const assignContract = async (kingdomId: string, contractId: string, assignmentId: number) => {
  const batch = angularFirestore.batch();
  batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${contractId}`), { assignment: assignmentId });
  await batch.commit();
}

/**
 * kingdom assigns troops to their assignments with proper sorting
 * @param kingdomId
 * @param army
 */
const assignArmy = async (kingdomId: string, army: any[]) => {
  const batch = angularFirestore.batch();
  army.forEach(troop => batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troop.troopId}`), { sort: troop.sort, assignment: troop.assignment }));
  await batch.commit();
}

/**
 * kingdom buy artifact from emporium
 * @param kingdomId
 * @param itemId
 */
const buyEmporium = async (kingdomId: string, itemId: string) => {
  let kingdomItem = await angularFirestore.doc(`items/${itemId}`).get();
  if (kingdomItem.exists) {
    let item = kingdomItem.data();
    let kingdomGem = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gem').limit(1).get();
    if (item?.gems <= kingdomGem.docs[0].data().quantity) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, 'gem', -item?.gems, batch);
      await addArtifact(kingdomId, itemId, 1, batch);
      await batch.commit();
    } else throw new Error('api.error.emporium');
  } else throw new Error('api.error.emporium');
}

/**
 * kingdom attacks another kingdom with a battle type
 * @param kingdomId
 * @param targetId
 * @param battleId
 */
const battleKingdom = async (kingdomId: string, battleId: BattleType, targetId: string) => {
  let sourceKingdom = await angularFirestore.doc(`kingdoms/${kingdomId}`).get();
  let targetKingdom = await angularFirestore.doc(`kingdoms/${targetId}`).get();
  if (targetKingdom.exists && sourceKingdom.exists) {
    let sourceArmy = await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).where('assignment', '==', 2).limit(5).get();
    // let sourceCharm = await angularFirestore.collection(`kingdoms/${kingdomId}/charms`).where('assignment', '==', 2).limit(1).get();
    // let sourceArtifact = await angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).where('assignment', '==', 2).limit(1).get();
    // let targetArmy = await angularFirestore.collection(`kingdoms/${targetId}/troops`).where('assignment', '==', 2).limit(5).get();
    // let targetCharm = await angularFirestore.collection(`kingdoms/${targetId}/charms`).where('assignment', '==', 2).limit(1).get();
    // let targetArtifact = await angularFirestore.collection(`kingdoms/${targetId}/artifacts`).where('assignment', '==', 2).limit(1).get();
    if (!sourceArmy.empty) {
      const batch = angularFirestore.batch();
      switch (battleId) {
        case 'attack':
          break;
        case 'pillage':
          break;
        case 'siege':
          break;
      }
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/letters`).doc(), {
        from: kingdomId,
        to: targetId,
        subject: 'kingdom.report.battle',
        message: 'kingdom.report.description',
        timestamp: admin.firestore.Timestamp.now(),
        log: [
          { side: 'left', sort: 1, spell: 'fireball', quantity: 123, text: 'texto de prueba' },
          { side: 'left', sort: 2, item: 'mana-vortex', quantity: 123, text: 'texto de prueba' },
          { side: 'left', sort: 3, unit: 'skeleton', quantity: 123, text: 'texto de prueba' },
          { side: 'right', sort: 4, unit: 'skeleton', quantity: 123, text: 'texto de prueba' },
          { side: 'left', sort: 5, unit: 'skeleton', quantity: 123, text: 'texto de prueba' },
          { side: 'right', sort: 6, unit: 'skeleton', quantity: 123, text: 'texto de prueba' },
          { side: 'left', sort: 7, unit: 'skeleton', quantity: 123, text: 'texto de prueba' },
          { side: 'right', sort: 8, unit: 'skeleton', quantity: 123, text: 'texto de prueba' },
          { side: 'left', sort: 9, unit: 'skeleton', quantity: 123, text: 'texto de prueba' },
          { side: 'right', sort: 10, unit: 'skeleton', quantity: 123, text: 'texto de prueba' },
          { side: 'left', sort: 11, unit: 'skeleton', quantity: 123, text: 'texto de prueba' },
        ],
      });
      batch.update(angularFirestore.doc(`kingdoms/${targetId}`), {
        lastAttacked: moment(admin.firestore.Timestamp.now()).add(PROTECTION_TIME, 'seconds')
      });
      await addSupply(kingdomId, 'turn', -BATTLE_TURNS, batch);
      await batch.commit();
    } else throw new Error('api.error.battle');
  } else throw new Error('api.error.battle');
}
