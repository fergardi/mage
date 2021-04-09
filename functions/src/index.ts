'use strict';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import * as express from 'express';
import * as ash from 'express-async-handler';
import * as moment from 'moment';
import * as _ from 'lodash';

const MAX_TURNS: number = 300;
const MIN_LANDS: number = 1;
const MAX_LANDS: number = 3500;
const BATTLE_TURNS: number = 2;
const PROTECTION_TIME: number = 60;
const VISITATION_TIME: number = 60;
const AUCTION_TIME: number = 60;
const GUILD_TIME: number = 60;
const CLAN_COST: number = 1000000;

enum KingdomType {
  RED = 'red',
  GREEN = 'green',
  BLACK = 'black',
  BLUE = 'blue',
  WHITE = 'white',
  GREY = 'grey',
}

enum BattleType {
  SIEGE = 'siege',
  PILLAGE = 'pillage',
  ATTACK = 'attack',
}

enum StoreType {
  INN = 'inn',
  MERCENARY = 'mercenary',
  SORCERER = 'sorcerer',
  MERCHANT = 'merchant',
};

enum LocationType {
  CAVE = 'cave',
  GRAVEYARD = 'graveyard',
  DUNGEON = 'dungeon',
  MINE = 'mine',
  FOREST = 'forest',
  CATHEDRAL = 'cathedral',
  MOUNTAIN = 'mountain',
  VOLCANO = 'volcano',
  LAKE = 'lake',
  NEST = 'nest',
  CASTLE = 'castle',
  BARRACK = 'barrack',
  ISLAND = 'island',
  MONOLITH = 'monolith',
  RUIN = 'ruin',
  SHIP = 'ship',
  TOWN = 'town',
  SHRINE = 'shrine',
  TOTEM = 'totem',
  PYRAMID = 'pyramid',
};

enum AuctionType {
  ARTIFACT = 'artifact',
  CHARM = 'charm',
  CONTRACT = 'contract',
  TROOP = 'troop',
};

/**
 * random
 * @param min
 * @param max
 */
const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * calculate remaining turns
 * @param from
 * @param to
 * @param max
 * @param ratio
 */
const calculate = (from: any, to: any, max: number, ratio: number): number => {
  const start = moment(from);
  const end = moment(to);
  const minutes = moment.duration(end.diff(start)).asMinutes();
  return max
    ? Math.min(max, Math.floor(minutes / ratio))
    : Math.floor(minutes / ratio);
};

// firestore
admin.initializeApp({ credential: admin.credential.cert(require('../credentials/key.json')) });
const angularFirestore: FirebaseFirestore.Firestore = admin.firestore();
const geo: any = require('geofirex');
const geofirex: any = geo.init(admin);

// express
const api = express();
api.use(cors({ origin: true }));
api.use(express.json());

// endpoints
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
api.get('/kingdom/:kingdomId/sorcery/charm/:charmId/assign/:assignmentId', ash(async (req: any, res: any) => res.json(await assignCharm(req.params.kingdomId, req.params.charmId, req.params.assignmentId))));
api.get('/kingdom/:kingdomId/sorcery/artifact/:artifactId/assign/:assignmentId', ash(async (req: any, res: any) => res.json(await assignArtifact(req.params.kingdomId, req.params.artifactId, req.params.assignmentId))));
api.get('/kingdom/:kingdomId/auction/:auctionId/bid/:gold', ash(async (req: any, res: any) => res.json(await bidAuction(req.params.kingdomId, req.params.auctionId, parseInt(req.params.gold)))));
api.get('/kingdom/:kingdomId/temple/:godId/offer/:resource', ash(async (req: any, res: any) => res.json(await offerGod(req.params.kingdomId, req.params.godId, parseInt(req.params.resource)))));
api.delete('/kingdom/:kingdomId/temple/:enchantmentId', ash(async (req: any, res: any) => res.json(await dispelEnchantment(req.params.kingdomId, req.params.enchantmentId))));
api.get('/kingdom/:kingdomId/city/:buildingId/build/:quantity', ash(async (req: any, res: any) => res.json(await buildStructure(req.params.kingdomId, req.params.buildingId, parseInt(req.params.quantity)))));
api.get('/kingdom/:kingdomId/tavern/:contractId/assign/:assignmentId', ash(async (req: any, res: any) => res.json(await assignContract(req.params.kingdomId, req.params.contractId, parseInt(req.params.assignmentId)))));
api.get('/kingdom/:kingdomId/tavern/:contractId/discharge', ash(async (req: any, res: any) => res.json(await dischargeContract(req.params.kingdomId, req.params.contractId))));
api.get('/kingdom/:kingdomId/emporium/:itemId', ash(async (req: any, res: any) => res.json(await buyEmporium(req.params.kingdomId, req.params.itemId))));
api.post('/kingdom/:kingdomId/archive', ash(async (req: any, res: any) => res.json(await sendLetter(req.params.kingdomId, req.body.subject, req.body.message, req.body.fromId))));
api.patch('/kingdom/:kingdomId/archive/:letterId', ash(async (req: any, res: any) => res.json(await readLetter(req.params.kingdomId, req.params.letterId))));
api.delete('/kingdom/:kingdomId/archive', ash(async (req: any, res: any) => res.json(await removeLetters(req.params.kingdomId, req.body.letterIds))));
api.patch('/kingdom/:kingdomId/guild/:guildId', ash(async (req: any, res: any) => res.json(await favorGuild(req.params.kingdomId, req.params.guildId))));
api.patch('/kingdom/:kingdomId/clan/:clanId', ash(async (req: any, res: any) => res.json(await joinClan(req.params.kingdomId, req.params.clanId))));
api.delete('/kingdom/:kingdomId/clan/:clanId', ash(async (req: any, res: any) => res.json(await leaveClan(req.params.kingdomId, req.params.clanId))));
api.put('/kingdom/auction', ash(async (req: any, res: any) => res.json(await refreshAuctions())));
api.post('/world/kingdom', ash(async (req: any, res: any) => res.json(await createKingdom(req.body.kingdomId, req.body.factionId, req.body.name, parseFloat(req.body.latitude), parseFloat(req.body.longitude)))));
api.post('/world/clan', ash(async (req: any, res: any) => res.json(await foundateClan(req.body.kingdomId, req.body.name, req.body.description, req.body.image))));
api.put('/world/shop', ash(async (req: any, res: any) => res.json(await checkShop(req.body.fid, parseFloat(req.body.latitude), parseFloat(req.body.longitude), req.body.storeType, req.body.name))));
api.put('/world/quest', ash(async (req: any, res: any) => res.json(await checkQuest(req.body.fid, parseFloat(req.body.latitude), parseFloat(req.body.longitude), req.body.locationType, req.body.name))));
// error handler
api.use((err: any, req: any, res: any, next: any) => res.status(500).json({ status: 500, error: err.message }));;

// https
exports.api = functions
.region('europe-west1')
.https
.onRequest(api);

/**
 * creates a new kingdom
 * @param kingdomId
 * @param factionId
 * @param name
 * @param latitude
 * @param longitude
 */
const createKingdom = async (kingdomId: string, factionId: KingdomType, name: string, latitude: number, longitude: number) => {
  const batch = angularFirestore.batch();
  // balances
  let power = 0;
  let goldBalance = 0;
  let manaBalance = 0;
  let populationBalance = 0;
  let manaMax = 0;
  let populationMax = 0;
  // buildings
  const buildings = [
    { id: 'barrier', quantity: 0 },
    { id: 'farm', quantity: 100 },
    { id: 'fortress', quantity: 0 },
    { id: 'academy', quantity: 0 },
    { id: 'node', quantity: 50 },
    { id: 'village', quantity: 100 },
    { id: 'workshop', quantity: 0 },
  ];
  for (const building of buildings) {
    const structure = (await angularFirestore.doc(`structures/${building.id}`).get()).data();
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: building.id, structure: structure, quantity: building.quantity });
    power += structure?.power * building.quantity;
    goldBalance += (structure?.goldProduction - structure?.goldMaintenance) * building.quantity;
    manaBalance += (structure?.manaProduction - structure?.manaMaintenance) * building.quantity;
    populationBalance += (structure?.populationProduction - structure?.populationMaintenance) * building.quantity;
    manaMax += structure?.manaCapacity * building.quantity;
    populationMax += structure?.populationCapacity * building.quantity;
  }
  // factions
  let troops: any = [];
  let charms: any = [];
  switch (factionId) {
    case KingdomType.BLACK: {
      troops = ['skeleton'];
      charms = ['animate-skeleton', 'terror'];
      break;
    }
    case KingdomType.GREEN: {
      troops = ['goblin'];
      charms = ['summon-goblin', 'cure'];
      break;
    }
    case KingdomType.RED: {
      troops = ['orc'];
      charms = ['call-orc', 'fireball'];
      break;
    }
    case KingdomType.BLUE: {
      troops = ['mage'];
      charms = ['summon-mage', 'ice-shock'];
      break;
    }
    case KingdomType.WHITE: {
      troops = ['pegasus'];
      charms = ['call-pegasus', 'healing-hand'];
      break;
    }
  }
  // troops
  for (const troop of troops) {
    const unit = (await angularFirestore.doc(`units/${troop}`).get()).data();
    const quantity = Math.max(...unit?.amount);
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: unit?.id, unit: unit, quantity: quantity, assignment: 2 })
    goldBalance -= unit?.goldMaintenance * quantity;
    manaBalance -= unit?.manaMaintenance * quantity;
    populationBalance -= unit?.populationMaintenance * quantity;
    power += unit?.power * quantity;
  }
  // charms
  for (const charm of charms) {
    const spell = (await angularFirestore.doc(`spells/${charm}`).get()).data();
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: spell?.id, spell: spell, turns: 0, completed: false })
  }
  // artifacts
  const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).doc(), { id: item.id, item: item, quantity: 1, assignment: 0 });
  // supplies
  const supplies = [
    { id: 'gold', quantity: 1000000, max: null, balance: Math.floor(goldBalance), timestamp: null },
    { id: 'mana', quantity: 100000, max: manaMax, balance: Math.floor(manaBalance), timestamp: null },
    { id: 'population', quantity: 10000, max: populationMax, balance: Math.floor(populationBalance), timestamp: null },
    { id: 'gem', quantity: 10, max: null, balance: 0, timestamp: null },
    { id: 'turn', quantity: 300, max: MAX_TURNS, balance: 0, timestamp: moment(admin.firestore.Timestamp.now().toMillis()).subtract(MAX_TURNS, 'minutes') },
    { id: 'land', quantity: 300, max: null, balance: 0, timestamp: null },
  ];
  for (const supply of supplies) {
    const resource = (await angularFirestore.doc(`resources/${supply.id}`).get()).data();
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).doc(), { id: supply.id, resource: resource, quantity: supply.quantity, max: supply.max, balance: supply.balance, timestamp: supply.timestamp });
  }
  // kingdom
  const faction = (await angularFirestore.doc(`factions/${factionId}`).get()).data();
  const guild = (await angularFirestore.collection('guilds').where('random', '==', random(0, 8)).limit(1).get()).docs[0].data();
  batch.create(angularFirestore.doc(`kingdoms/${kingdomId}`), {
    id: kingdomId,
    faction: faction,
    guild: guild,
    guilded: moment(admin.firestore.Timestamp.now().toMillis()),
    position: geofirex.point(latitude,longitude),
    coordinates: { latitude: latitude, longitude: longitude },
    name: name,
    power: power,
  });
  // commit
  return batch.commit();
}

/**
 * add supply to a kingdom
 * @param kingdomId
 * @param supply
 * @param quantity
 * @param batch
 */
const addSupply = async (kingdomId: string, supply: string, quantity: number, batch: FirebaseFirestore.WriteBatch, ratio?: number, max?: number) => {
  const kingdomSupply = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', supply).limit(1).get()).docs[0];
  const s = kingdomSupply.data();
  if (supply === 'turn' && ratio) {
    const total = calculate(s.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), MAX_TURNS, ratio);
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomSupply.id}`), {
      quantity: 0,
      timestamp: moment(admin.firestore.Timestamp.now().toMillis()).subtract((total + quantity) * ratio, 'minutes').subtract(1 , 'seconds'),
    });
    if (quantity < 0) await payMaintenance(kingdomId, Math.abs(quantity), batch);
  } else {
    const q = s.max && (s.quantity + quantity > s.max) ? s.max : s.quantity + quantity <= 0 ? 0 : admin.firestore.FieldValue.increment(quantity);
    if (max) batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomSupply.id}`), { quantity: q, max: max });
    else batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomSupply.id}`), { quantity: q });
  }
}

/**
 * pay the maintenances if turns are spent
 * @param kingdomId
 * @param turns
 * @param batch
 */
const payMaintenance = async (kingdomId: string, turns: number, batch: FirebaseFirestore.WriteBatch) => {
  const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
  const kingdomMana = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'mana').limit(1).get()).docs[0];
  const kingdomPopulation = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'population').limit(1).get()).docs[0];
  const kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').limit(1).get()).docs[0];
  const gold = kingdomGold.data();
  const mana = kingdomMana.data();
  const population = kingdomPopulation.data();
  const land = kingdomLand.data();
  const goldQuantity = Math.ceil(gold.balance * turns);
  const goldBalance = gold.max && (gold.quantity + goldQuantity > gold.max) ? gold.max : gold.quantity + goldQuantity <= 0 ? 0 : admin.firestore.FieldValue.increment(goldQuantity);
  batch.update(kingdomGold.ref, { quantity: goldBalance });
  const manaQuantity = Math.ceil(mana.balance * turns);
  const manaBalance = mana.max && (mana.quantity + manaQuantity > mana.max) ? mana.max : mana.quantity + manaQuantity <= 0 ? 0 : admin.firestore.FieldValue.increment(manaQuantity);
  batch.update(kingdomMana.ref, { quantity: manaBalance });
  const populationQuantity = Math.ceil(population.balance * turns);
  const populationBalance = population.max && (population.quantity + populationQuantity > population.max) ? population.max : population.quantity + populationQuantity <= 0 ? 0 : admin.firestore.FieldValue.increment(populationQuantity);
  batch.update(kingdomPopulation.ref, { quantity: populationBalance });
  const landQuantity = Math.ceil(land.balance * turns);
  const landBalance = land.max && (land.quantity + landQuantity > land.max) ? land.max : land.quantity + landQuantity <= 0 ? 0 : admin.firestore.FieldValue.increment(landQuantity);
  batch.update(kingdomLand.ref, { quantity: landBalance });
  if (gold.quantity + goldQuantity <= 0 || mana.quantity + manaQuantity <= 0 || population.quantity + populationQuantity <= 0) {
    await evictMaintenance(kingdomId, batch);
  }
}

/**
 * evict something to pay the maintenance
 * @param kingdomId
 * @param batch
 */
const evictMaintenance = async (kingdomId: string, batch: FirebaseFirestore.WriteBatch) => {
  // enchantments
  // const kingdomEnchantments = await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).where('id', '==', unit.id).limit(1).get();
  // units
  // heroes
  // TODO
}

/**
 * add troop to a kingdom
 * @param kingdomId
 * @param unitId
 * @param quantity
 * @param batch
 */
const addTroop = async (kingdomId: string, unit: any, quantity: number, batch: FirebaseFirestore.WriteBatch) => {
  const kingdomTroop = await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).where('id', '==', unit.id).limit(1).get();
  if (kingdomTroop.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/troops/${kingdomTroop.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: unit.id, quantity: quantity, unit: unit, assignment: 0 });
  }
  const goldBalance = Math.floor(-unit.goldMaintenance * quantity);
  if (goldBalance) {
    const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
    batch.update(kingdomGold.ref, { balance: admin.firestore.FieldValue.increment(goldBalance) });
  }
  const manaBalance = Math.floor(-unit.manaMaintenance * quantity);
  if (manaBalance) {
    const kingdomMana = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'mana').limit(1).get()).docs[0];
    batch.update(kingdomMana.ref, { balance: admin.firestore.FieldValue.increment(manaBalance) });
  }
  const populationBalance = Math.floor(-unit.populationMaintenance * quantity);
  if (populationBalance) {
    const kingdomPopulation = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'population').limit(1).get()).docs[0];
    batch.update(kingdomPopulation.ref, { balance: admin.firestore.FieldValue.increment(populationBalance) });
  }
  const powerBalance = Math.floor(unit.power * quantity);
  batch.update(angularFirestore.doc(`kingdoms/${kingdomId}`), { power: admin.firestore.FieldValue.increment(powerBalance) });
}

/**
 * add artifact to a kingdom
 * @param kingdomId
 * @param itemId
 * @param quantity
 * @param batch
 */
const addArtifact = async (kingdomId: string, item: any, quantity: number, batch: FirebaseFirestore.WriteBatch) => {
  const kingdomArtifact = await angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).where('id', '==', item.id).limit(1).get();
  if (kingdomArtifact.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${kingdomArtifact.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).doc(), { id: item.id, quantity: quantity, item: item, assignment: 0 });
  }
}

/**
 * add contract to a kingdom
 * @param kingdomId
 * @param heroId
 * @param level
 * @param batch
 */
const addContract = async (kingdomId: string, hero: any, level: number, batch: FirebaseFirestore.WriteBatch) => {
  const kingdomContract = await angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).where('id', '==', hero.id).limit(1).get();
  if (kingdomContract.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${kingdomContract.docs[0].id}`), { level: admin.firestore.FieldValue.increment(level) });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).doc(), { id: hero.id, level: level, hero: hero, assignment: 0 });
  }
  const goldBalance = Math.floor((hero.goldProduction - hero.goldMaintenance) * level);
  if (goldBalance) {
    const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
    batch.update(kingdomGold.ref, { balance: admin.firestore.FieldValue.increment(goldBalance) });
  }
  const manaBalance = Math.floor((hero.manaProduction - hero.manaMaintenance) * level);
  if (manaBalance) {
    const kingdomMana = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'mana').limit(1).get()).docs[0];
    batch.update(kingdomMana.ref, { balance: admin.firestore.FieldValue.increment(manaBalance) });
  }
  const populationBalance = Math.floor((hero.populationProduction - hero.populationMaintenance) * level);
  if (populationBalance) {
    const kingdomPopulation = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'population').limit(1).get()).docs[0];
    batch.update(kingdomPopulation.ref, { balance: admin.firestore.FieldValue.increment(populationBalance) });
  }
  const exploreBonus = Math.floor(hero.exploreBonus * level);
  if (exploreBonus) {
    const kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').limit(1).get()).docs[0];
    batch.update(kingdomLand.ref, { bonus: admin.firestore.FieldValue.increment(exploreBonus) });
  }
  const buildBonus = Math.floor(hero.buildBonus * level);
  if (buildBonus) {
    const kingdomWorkshop = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'workshop').limit(1).get()).docs[0];
    batch.update(kingdomWorkshop.ref, { bonus: admin.firestore.FieldValue.increment(buildBonus) });
  }
  const researchBonus = Math.floor(hero.researchBonus * level);
  if (researchBonus) {
    const kingdomAcademy = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'academy').limit(1).get()).docs[0];
    batch.update(kingdomAcademy.ref, { bonus: admin.firestore.FieldValue.increment(researchBonus) });
  }
  const powerBalance = Math.floor(hero.power * level);
  batch.update(angularFirestore.doc(`kingdoms/${kingdomId}`), { power: admin.firestore.FieldValue.increment(powerBalance) });
}

/**
 * add enchantment to a kingdom
 * @param kingdomId
 * @param spellId
 * @param originId
 * @param turns
 * @param batch
 */
const addEnchantment = async (kingdomId: string, enchantment: any, originId: string, turns: number, batch: FirebaseFirestore.WriteBatch) => {
  const kingdomEnchantment = await angularFirestore.collection(`kingdoms/${kingdomId}/enchantments`).where('id', '==', enchantment.id).limit(1).get();
  if (kingdomEnchantment.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/enchantments/${kingdomEnchantment.docs[0].id}`), { turns: admin.firestore.FieldValue.increment(turns) });
  } else {
    const kingdomTarget = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
    batch.create(angularFirestore.collection(`kingdoms/${originId}/incantations`).doc(), { id: enchantment.id, spell: enchantment, to: kingdomTarget, turns: turns });
    const kingdomOrigin = (await angularFirestore.doc(`kingdoms/${originId}`).get()).data();
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/enchantments`).doc(), { id: enchantment.id, spell: enchantment, from: kingdomOrigin, turns: turns });
    // origin
    const goldBalanceOrigin = -enchantment.goldMaintenance;
    if (goldBalanceOrigin) {
      const kingdomGold = (await angularFirestore.collection(`kingdoms/${originId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
      batch.update(kingdomGold.ref, { balance: admin.firestore.FieldValue.increment(goldBalanceOrigin) });
    }
    const manaBalanceOrigin = -enchantment.manaMaintenance;
    if (manaBalanceOrigin) {
      const kingdomMana = (await angularFirestore.collection(`kingdoms/${originId}/supplies`).where('id', '==', 'mana').limit(1).get()).docs[0];
      batch.update(kingdomMana.ref, { balance: admin.firestore.FieldValue.increment(manaBalanceOrigin) });
    }
    const populationBalanceOrigin = -enchantment.populationMaintenance;
    if (populationBalanceOrigin) {
      const kingdomPopulation = (await angularFirestore.collection(`kingdoms/${originId}/supplies`).where('id', '==', 'population').limit(1).get()).docs[0];
      batch.update(kingdomPopulation.ref, { balance: admin.firestore.FieldValue.increment(populationBalanceOrigin) });
    }
    // target
    const goldBalance = enchantment.goldProduction;
    if (goldBalance) {
      const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
      batch.update(kingdomGold.ref, { balance: admin.firestore.FieldValue.increment(goldBalance) });
    }
    const manaBalance = enchantment.manaProduction;
    if (manaBalance) {
      const kingdomMana = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'mana').limit(1).get()).docs[0];
      batch.update(kingdomMana.ref, { balance: admin.firestore.FieldValue.increment(manaBalance) });
    }
    const populationBalance = enchantment.populationProduction;
    if (populationBalance) {
      const kingdomPopulation = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'population').limit(1).get()).docs[0];
      batch.update(kingdomPopulation.ref, { balance: admin.firestore.FieldValue.increment(populationBalance) });
    }
    const landBalance = enchantment.landProduction;
    if (landBalance) {
      const kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').limit(1).get()).docs[0];
      batch.update(kingdomLand.ref, { balance: admin.firestore.FieldValue.increment(landBalance) });
    }
    const buildBonus = enchantment.buildBonus;
    if (buildBonus) {
      const kingdomWorkshop = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'workshop').limit(1).get()).docs[0];
      batch.update(kingdomWorkshop.ref, { bonus: admin.firestore.FieldValue.increment(buildBonus) });
    }
    const researchBonus = enchantment.researchBonus;
    if (researchBonus) {
      const kingdomAcademy = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'academy').limit(1).get()).docs[0];
      batch.update(kingdomAcademy.ref, { bonus: admin.firestore.FieldValue.increment(researchBonus) });
    }
  }
}

/**
 * add charm to a kingdom
 * @param kingdomId
 * @param spellId
 * @param turns
 * @param batch
 */
const addCharm = async (kingdomId: string, spell: any, turns: number, batch: FirebaseFirestore.WriteBatch) => {
  const kingdomCharm = await angularFirestore.collection(`kingdoms/${kingdomId}/charms`).where('id', '==', spell.id).limit(1).get();
  if (kingdomCharm.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/charms/${kingdomCharm.docs[0].id}`), {
      turns: admin.firestore.FieldValue.increment(turns),
      completed: (kingdomCharm.docs[0]?.data().turns + turns) >= spell?.turnResearch,
    });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: spell.id, spell: spell, turns: 0, assignment: 0, completed: true });
  }
}

/**
 * kingdom researchs charm a given number of turns
 * @param kingdomId
 * @param charmId
 * @param turns
 */
const researchCharm = async (kingdomId: string, charmId: string, turns: number) => {
  const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
  kingdomTurn.quantity = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
  if (turns <= kingdomTurn.quantity) {
    const spell = (await angularFirestore.doc(`kingdoms/${kingdomId}/charms/${charmId}`).get()).data();
    const batch = angularFirestore.batch();
    await addSupply(kingdomId, 'turn', -turns, batch, kingdomTurn.resource.ratio);
    await addCharm(kingdomId, spell, turns, batch);
    await batch.commit();
    return { turns: turns };
  } else throw new Error('api.error.research');
}

/**
 * kingdom explores lands on a given number of turns
 * @param kingdomId
 * @param turns
 */
const exploreLands = async (kingdomId: string, turns: number) => {
  let lands = MIN_LANDS;
  const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
  const max = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
  if (turns <= max) {
    const kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').limit(1).get()).docs[0].data();
    for (let i = 0; i < turns; i++) {
      lands += Math.min(MAX_LANDS, Math.max(0, Math.floor((MAX_LANDS - (kingdomLand.quantity + lands)) / 100)));
    }
    const batch = angularFirestore.batch();
    await addSupply(kingdomId, 'turn', -turns, batch, kingdomTurn.resource.ratio);
    await addSupply(kingdomId, 'land', lands, batch);
    await batch.commit();
    return { lands: lands };
  } else throw new Error('api.error.explore');
}

/**
 * kingdom recruits units on a given number
 * @param kingdomId
 * @param unitId
 * @param quantity
 */
const recruitUnit = async (kingdomId: string, unitId: string, quantity: number) => {
  const unit = (await angularFirestore.doc(`units/${unitId}`).get()).data();
  if (unit?.gold > 0) {
    const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0].data();
    const gold = unit?.gold * quantity;
    if (gold <= kingdomGold.quantity) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, 'gold', -gold, batch);
      await addTroop(kingdomId, unit, quantity, batch);
      await batch.commit();
      return { quantity: quantity, unit: unit?.name };
    } else throw new Error('api.error.recruitable');
  } else throw new Error('api.error.recruitable');
}

/**
 * kingdom disbands troops on a given number
 * @param kingdomId
 * @param troopId
 * @param quantity
 */
const disbandTroop = async (kingdomId: string, troopId: string, quantity: number) => {
  const kingdomTroop = (await angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troopId}`).get()).data();
  if (kingdomTroop?.quantity > 0) {
    const unit = kingdomTroop?.unit;
    if (unit.populationMaintenance <= 0) {
      const batch = angularFirestore.batch();
      if (quantity >= kingdomTroop?.quantity) {
        quantity = kingdomTroop?.quantity;
        batch.delete(angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troopId}`));
      } else {
        batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troopId}`), { quantity: admin.firestore.FieldValue.increment(-quantity) });
      }
      const goldBalance = Math.floor(unit.goldMaintenance * quantity);
      if (goldBalance) {
        const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
        batch.update(kingdomGold.ref, { balance: admin.firestore.FieldValue.increment(goldBalance) });
      }
      const manaBalance = Math.floor(unit.manaMaintenance * quantity);
      if (manaBalance) {
        const kingdomMana = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'mana').limit(1).get()).docs[0];
        batch.update(kingdomMana.ref, { balance: admin.firestore.FieldValue.increment(manaBalance) });
      }
      const populationBalance = Math.floor(unit.populationMaintenance * quantity);
      if (populationBalance) {
        const kingdomPopulation = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'population').limit(1).get()).docs[0];
        batch.update(kingdomPopulation.ref, { balance: admin.firestore.FieldValue.increment(populationBalance) });
      }
      const powerBalance = Math.floor(-unit.power * quantity);
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}`), { power: admin.firestore.FieldValue.increment(powerBalance) });
      await batch.commit();
      return { quantity: quantity, unit: unit.name };
    } else throw new Error('api.error.troop');
  } else throw new Error('api.error.troop');
}

/**
 * kingdom break a contract with a hero
 * @param kingdomId
 * @param contractId
 */
const dischargeContract = async (kingdomId: string, contractId: string) => {
  const kingdomContract = (await angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${contractId}`).get()).data();
  if (kingdomContract) {
    const batch = angularFirestore.batch();
    batch.delete(angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${contractId}`));
    const goldBalance = Math.floor((kingdomContract.hero.goldMaintenance - kingdomContract.hero.goldProduction) * kingdomContract.level);
    if (goldBalance) {
      const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
      batch.update(kingdomGold.ref, { balance: admin.firestore.FieldValue.increment(goldBalance) });
    }
    const manaBalance = Math.floor((kingdomContract.hero.manaMaintenance - kingdomContract.hero.manaProduction) * kingdomContract.level);
    if (manaBalance) {
      const kingdomMana = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'mana').limit(1).get()).docs[0];
      batch.update(kingdomMana.ref, { balance: admin.firestore.FieldValue.increment(manaBalance) });
    }
    const populationBalance = Math.floor((kingdomContract.hero.populationMaintenance - kingdomContract.hero.populationProduction) * kingdomContract.level);
    if (populationBalance) {
      const kingdomPopulation = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'population').limit(1).get()).docs[0];
      batch.update(kingdomPopulation.ref, { balance: admin.firestore.FieldValue.increment(populationBalance) });
    }
    const exploreBonus = Math.floor(-kingdomContract.hero.exploreBonus * kingdomContract.level);
    if (exploreBonus) {
      const kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').limit(1).get()).docs[0];
      batch.update(kingdomLand.ref, { bonus: admin.firestore.FieldValue.increment(exploreBonus) });
    }
    const buildBonus = Math.floor(-kingdomContract.hero.buildBonus * kingdomContract.level);
    if (buildBonus) {
      const kingdomWorkshop = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'workshop').limit(1).get()).docs[0];
      batch.update(kingdomWorkshop.ref, { bonus: admin.firestore.FieldValue.increment(buildBonus) });
    }
    const researchBonus = Math.floor(-kingdomContract.hero.researchBonus * kingdomContract.level);
    if (researchBonus) {
      const kingdomAcademy = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'academy').limit(1).get()).docs[0];
      batch.update(kingdomAcademy.ref, { bonus: admin.firestore.FieldValue.increment(researchBonus) });
    }
    const powerBalance = Math.floor(-kingdomContract.hero.power * kingdomContract.level);
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}`), { power: admin.firestore.FieldValue.increment(powerBalance) });
    await batch.commit();
  } else throw new Error('api.error.discharge');
}

/**
 * kingdom charges mana a given number of turns
 * @param kingdomId
 * @param turns
 */
const chargeMana = async (kingdomId: string, turns: number) => {
  const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
  kingdomTurn.quantity = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
  if (turns <= kingdomTurn.quantity) {
    const batch = angularFirestore.batch();
    const kingdomNode = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'node').limit(1).get()).docs[0].data();
    const mana = kingdomNode.quantity * kingdomNode.structure.manaProduction * turns;
    await addSupply(kingdomId, 'turn', -turns, batch, kingdomTurn.resource.ratio);
    await addSupply(kingdomId, 'mana', mana, batch);
    await batch.commit();
    return { mana: mana };
  } else throw new Error('api.error.charge');
}

/**
 * kingdom taxes gold a given number of turns
 * @param kingdomId
 * @param turns
 */
const taxGold = async (kingdomId: string, turns: number) => {
  const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
  kingdomTurn.quantity = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
  if (turns <= kingdomTurn.quantity) {
    const kingdomVillage = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'village').limit(1).get()).docs[0].data();
    const gold = Math.floor(kingdomVillage.quantity * kingdomVillage.structure.goldProduction * turns);
    const batch = angularFirestore.batch();
    await addSupply(kingdomId, 'turn', -turns, batch, kingdomTurn.resource.ratio);
    await addSupply(kingdomId, 'gold', gold, batch);
    await batch.commit();
    return { gold: gold };
  } else throw new Error('api.error.tax');
}

/**
 * kingdom conjure spell on target kingdom, even on itself
 * @param kingdomId
 * @param charmId
 * @param targetId
 */
const conjureCharm = async (kingdomId: string, charmId: string, targetId: string) => {
  let result = {};
  const charm = (await angularFirestore.doc(`kingdoms/${kingdomId}/charms/${charmId}`).get()).data();
  if (charm) {
    const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
    const kingdomMana = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'mana').limit(1).get()).docs[0].data();
    const turns = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
    if (charm.completed && charm.spell.turnCost <= turns && charm.spell.manaCost <= kingdomMana.quantity) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, 'turn', -charm.spell.turnCost, batch, kingdomTurn.resource.ratio);
      await addSupply(kingdomId, 'mana', -charm.spell.manaCost, batch);
      switch (charm.spell.subtype) {
        case 'summon':
          const unit = charm.spell.units[random(0, charm.spell.units.length - 1)];
          const size = random(Math.min(...unit.amount), Math.max(...unit.amount));
          await addTroop(targetId, unit, size, batch);
          result = { unit: `unit.${unit.id}.name`, size: size };
          break;
        case 'item':
          const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
          const lot = 1;
          await addArtifact(targetId, item, lot, batch);
          result = { item: `item.${item.id}.name`, quantity: lot };
          break;
        case 'enchantment':
          if (!charm.spell.multiple) {
            await addEnchantment(targetId, charm.spell, kingdomId, charm.spell.turnDuration, batch);
            result = { enchantment: `spell.${charm.spell.id}.name`, turns: charm.spell.turnDuration };
          } else {
            const kingdomEnchantments = await angularFirestore.collection(`kingdoms/${targetId}/enchantments`).listDocuments();
            kingdomEnchantments.map(enchantment => batch.delete(enchantment));
          }
          break;
        case 'espionage':
          const from = (await angularFirestore.doc(`kingdoms/${targetId}`).get()).data();
          // TODO
          await addLetter(kingdomId, 'kingdom.espionage.subject', 'kingdom.espionage.message', from, batch, null);
          break;
        case 'resource':
          // TODO
          break;
        case 'armageddon':
          // this is done in the gods section
          break;
        case 'battle':
          // this is done in the battle section
          break;
      }
      if (targetId !== kingdomId) {
        const data = {
          spell: charm.spell,
          level: charm.spell.level,
        };
        const from = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
        await addLetter(targetId, 'kingdom.conjure.subject', 'kingdom.conjure.message', from, batch, data);
      }
      await batch.commit();
      return result;
    } else throw new Error('api.error.conjure');
  } else throw new Error('api.error.conjure');
}

/**
 * kingdom activates artifacts on target kingdom, even on itself
 * @param kingdomId
 * @param artifactId
 * @param targetId
 */
const activateArtifact = async (kingdomId: string, artifactId: string, targetId: string) => {
  let result = {};
  const artifact = (await angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${artifactId}`).get()).data();
  if (artifact && !artifact.item.battle) {
    const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
    const max = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
    if (artifact.quantity > 0 && artifact.item.turns <= max) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, 'turn', -artifact.item.turns, batch, kingdomTurn.resource.ratio);
      if (artifact.quantity > 1) {
        batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${artifactId}`), { quantity: admin.firestore.FieldValue.increment(-1) });
      } else {
        batch.delete(angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${artifactId}`));
      }
      switch (artifact.item.subtype) {
        case 'summon':
          const unit = artifact.item.units[random(0, artifact.item.units.length - 1)];
          const size = random(Math.min(...unit.amount), Math.max(...unit.amount));
          await addTroop(targetId, unit, size, batch);
          result = { unit: `unit.${unit.id}.name`, size: size };
          break;
        case 'resource':
          const resource = artifact.item.resources[0];
          const amount = random(Math.min(...artifact.item.amount), Math.max(...artifact.item.amount));
          await addSupply(targetId, resource.id, amount, batch, resource.id === 'turn' ? kingdomTurn.resource.ratio : null);
          result = { resource: `resource.${resource.id}.name`, amount: amount };
          break;
        case 'enchantment':
          if (artifact.item.spells.length) {
            const enchantment = artifact.item.spells[random(0, artifact.item.spells.length - 1)];
            await addEnchantment(targetId, enchantment, kingdomId, enchantment.turnDuration, batch);
            result = { enchantment: `spell.${enchantment.id}.name`, turns: enchantment.turnDuration };
          } else {
            const kingdomEnchantments = await angularFirestore.collection(`kingdoms/${targetId}/enchantments`).listDocuments();
            kingdomEnchantments.map(enchantment => batch.delete(enchantment));
          }
          break;
        case 'item':
          const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
          const quantity = 1;
          await addArtifact(targetId, item, quantity, batch);
          result = { item: `item.${item.id}.name`, quantity: quantity };
          break;
        case 'spell':
          let spell: any = false;
          let tries: number = 0;
          while (!spell && tries <= 10) {
            spell = (await angularFirestore.collection('spells').where('random', '==', random(0, 100)).limit(1).get()).docs[0].data();
            spell = (await angularFirestore.collection(`kingdoms/${targetId}/charms`).where('spell.id', '==', spell.id).limit(1).get()).empty ? spell : false;
            tries++;
          }
          if (spell) {
            await addCharm(targetId, spell, 0, batch);
            result = { spell: `spell.${spell.id}.name` };
          }
          break;
        case 'espionage':
          const from = (await angularFirestore.doc(`kingdoms/${targetId}`).get()).data();
          // TODO
          await addLetter(kingdomId, 'kingdom.espionage.subject', 'kingdom.espionage.message', from, batch, null);
          break;
        case 'battle':
          // this is done in the battle section
          break;
      }
      if (targetId !== kingdomId) {
        const data = {
          item: artifact.item,
          quantity: 1,
        };
        const from = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
        await addLetter(targetId, 'kingdom.activate.subject', 'kingdom.activate.message', from, batch, data);
      }
      await batch.commit();
      return result;
    } else throw new Error('api.error.activate');
  } else throw new Error('api.error.activate');
}

/**
 * kingdom bids an auction with gold
 * @param kingdomId
 * @param auctionId
 * @param gold
 */
const bidAuction = async (kingdomId: string, auctionId: string, gold: number) => {
  const auction = (await angularFirestore.doc(`auctions/${auctionId}`).get()).data();
  if (auction) {
    const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0].data();
    if (gold <= kingdomGold.quantity && gold >= Math.floor(auction.gold * 1.10) && kingdomId !== auction.kingdom) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, 'gold', -gold, batch);
      if (auction.kingdom) {
        const from = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
        const bid = Math.ceil(auction.gold * 0.90);
        const data = {
          item: auction.item || null,
          spell: auction.spell || null,
          hero: auction.hero || null,
          unit: auction.unit || null,
          quantity: auction.quantity || null,
          level: auction.level || null,
          gold: bid || null,
        };
        await addLetter(auction.kingdom, 'kingdom.auction.subject', 'kingdom.auction.outbid', from, batch, data);
        await addSupply(auction.kingdom, 'gold', bid, batch);
      }
      batch.update(angularFirestore.doc(`auctions/${auctionId}`), { kingdom: kingdomId, gold: gold });
      await batch.commit();
      return { gold: gold };
    } else throw new Error('api.error.bid');
  } else throw new Error('api.error.bid');
}

/**
 * kingdom builds structures
 * @param kingdomId
 * @param buildingId
 * @param quantity
 */
const buildStructure = async (kingdomId: string, buildingId: string, quantity: number) => {
  const kingdomBuilding = (await angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${buildingId}`).get()).data();
  if (kingdomBuilding) {
    const kingdomWorkshop = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'workshop').limit(1).get()).docs[0].data();
    const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0].data();
    const kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').limit(1).get()).docs[0].data();
    const resourceTurn = (await angularFirestore.doc(`resources/turn`).get()).data();
    const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
    const structure = kingdomBuilding.structure;
    const gold = structure?.goldCost * quantity;
    const turn = Math.ceil(quantity / Math.ceil((kingdomWorkshop.quantity + 1) / structure?.turnRatio))
    const maxTurns = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), resourceTurn?.max, resourceTurn?.ratio);
    if (quantity <= kingdomLand.quantity && gold <= kingdomGold.quantity && turn <= maxTurns) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, 'turn', -turn, batch, resourceTurn?.ratio);
      await addSupply(kingdomId, 'gold', -gold, batch);
      await addSupply(kingdomId, 'land', -quantity, batch);
      if (kingdomBuilding.id === 'node') await addSupply(kingdomId, 'mana', 0, batch, 0, (kingdomBuilding.quantity + quantity) * structure?.manaCapacity);
      if (kingdomBuilding.id === 'village') await addSupply(kingdomId, 'population', 0, batch, 0, (kingdomBuilding.quantity + quantity) * structure?.populationCapacity);
      await addBuilding(kingdomId, kingdomBuilding.id, quantity, batch);
      await batch.commit();
      return { quantity: quantity, structure: structure?.name };
    } else throw new Error('api.error.structure');
  } else throw new Error('api.error.structure');
}

/**
 * add building to kingdom
 * @param kingdomId
 * @param structureId
 * @param quantity
 * @param batch
 */
const addBuilding = async (kingdomId: string, buildingId: string, quantity: number, batch: FirebaseFirestore.WriteBatch) => {
  const kingdomBuilding = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', buildingId).limit(1).get()).docs[0];
  if (kingdomBuilding) {
    const building = kingdomBuilding.data();
    const stack = building.quantity + quantity <= 0 ? 0 : admin.firestore.FieldValue.increment(quantity);
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${kingdomBuilding.id}`), { quantity: stack });
    const goldBalance = Math.floor((building.structure.goldProduction - building.structure.goldMaintenance) * quantity);
    if (goldBalance) {
      const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
      batch.update(kingdomGold.ref, { balance: admin.firestore.FieldValue.increment(goldBalance) });
    }
    const manaBalance = Math.floor((building.structure.manaProduction - building.structure.manaMaintenance) * quantity);
    if (manaBalance) {
      const kingdomMana = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'mana').limit(1).get()).docs[0];
      batch.update(kingdomMana.ref, { balance: admin.firestore.FieldValue.increment(manaBalance) });
    }
    const populationBalance = Math.floor((building.structure.populationProduction - building.structure.populationMaintenance) * quantity);
    if (populationBalance) {
      const kingdomPopulation = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'population').limit(1).get()).docs[0];
      batch.update(kingdomPopulation.ref, { balance: admin.firestore.FieldValue.increment(populationBalance) });
    }
    const powerBalance = Math.floor(building.structure.power * quantity);
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}`), { power: admin.firestore.FieldValue.increment(powerBalance) });
  } else throw new Error('api.error.building');
}

/**
 * kingdom assigns contract to an assignment
 * @param kingdomId
 * @param contractId
 * @param assignmentId
 */
const assignContract = async (kingdomId: string, contractId: string, assignmentId: number) => {
  const kingdomContract = (await angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${contractId}`).get()).data();
  if (kingdomContract) {
    const batch = angularFirestore.batch();
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${contractId}`), { assignment: assignmentId });
    await batch.commit();
  } else throw new Error('api.error.assignation');
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
  const item = (await angularFirestore.doc(`items/${itemId}`).get()).data();
  if (item) {
    const kingdomGem = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gem').limit(1).get()).docs[0].data();
    if (item.gems <= kingdomGem.quantity) {
      const batch = angularFirestore.batch();
      const quantity = 100;
      const data = {
        item: item,
        quantity: quantity,
      };
      const from = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
      await addLetter(kingdomId, 'kingdom.emporium.subject', 'kingdom.emporium.message', from, batch, data);
      await addSupply(kingdomId, 'gem', -item.gems, batch);
      await addArtifact(kingdomId, item, quantity, batch);
      await batch.commit();
      return { quantity: quantity, item: item.name };
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
  const sourceKingdom = await angularFirestore.doc(`kingdoms/${kingdomId}`).get();
  const targetKingdom = await angularFirestore.doc(`kingdoms/${targetId}`).get();
  if (targetKingdom.exists && sourceKingdom.exists) {
    const sourceArmy = await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).where('assignment', '==', 2).limit(5).get();
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
      batch.update(angularFirestore.doc(`kingdoms/${targetId}`), { attacked: moment(admin.firestore.Timestamp.now().toMillis()).add(PROTECTION_TIME, 'seconds') });
      await addSupply(kingdomId, 'turn', -BATTLE_TURNS, batch);
      await batch.commit();
    } else throw new Error('api.error.battle');
  } else throw new Error('api.error.battle');
}

/**
 * adds letter from kingdom to kingdom
 * @param kingdomId
 * @param subject
 * @param message
 * @param from
 * @param batch
 * @param data
 */
const addLetter = async (kingdomId: string, subject: string, message: string, from: any, batch: FirebaseFirestore.WriteBatch, data?: any) => {
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/letters`).doc(), {
    to: kingdomId,
    subject: subject,
    message: message,
    data: data,
    timestamp: admin.firestore.Timestamp.now(),
    from: from,
    read: false,
  });
}

/**
 * sends letter
 * @param kingdomId
 * @param subject
 * @param message
 * @param fromId
 */
const sendLetter = async (kingdomId: string, subject: string, message: string, fromId: string) => {
  const batch = angularFirestore.batch();
  const from = (await angularFirestore.doc(`kingdoms/${fromId}`).get()).data();
  addLetter(kingdomId, subject, message, from, batch, null);
  await batch.commit();
}

/**
 * mark letter as read
 * @param kingdomId
 * @param letterId
 */
const readLetter = async (kingdomId: string, letterId: string) => {
  await angularFirestore.doc(`kingdoms/${kingdomId}/letters/${letterId}`).update({ read: true });
}

/**
 * favors a guild
 * @param kingdomId
 * @param guildId
 */
const favorGuild = async (kingdomId: string, guildId: string) => {
  const guild = await (await angularFirestore.doc(`guilds/${guildId}`).get()).data();
  const guilded = moment(admin.firestore.Timestamp.now().toMillis()).add(GUILD_TIME, 'seconds');
  await angularFirestore.doc(`kingdoms/${kingdomId}`).update({
    guild: guild,
    guilded: guilded,
  });
}

/**
 * remove array of letters
 * @param kingdomId
 * @param letterIds
 */
const removeLetters = async (kingdomId: string, letterIds: string[]) => {
  const batch = angularFirestore.batch();
  letterIds.forEach(letterId => {
    batch.delete(angularFirestore.doc(`kingdoms/${kingdomId}/letters/${letterId}`));
  });
  await batch.commit();
}

/**
 * checks a shop in the world
 * @param fid
 * @param latitude
 * @param longitude
 * @param type
 * @param name
 */
const checkShop = async (fid?: string, latitude?: number, longitude?: number, type?: StoreType, name?: string) => {
  let update = false;
  const batch = angularFirestore.batch();
  const visited = moment(admin.firestore.Timestamp.now().toMillis()).add(VISITATION_TIME, 'seconds');
  const geopoint = latitude && longitude ? geofirex.point(latitude, longitude) : null;
  if (!fid) fid = geopoint.geohash;
  const shop = (await angularFirestore.doc(`shops/${fid}`).get()).data();
  if (shop) {
    if (moment().isAfter(moment(shop?.visited.toMillis()))) {
      batch.update(angularFirestore.doc(`shops/${fid}`), { visited: visited });
      update = true;
    }
  } else {
    const store = (await angularFirestore.doc(`stores/${type}`).get()).data();
    batch.create(angularFirestore.doc(`shops/${fid}`), { store: store, position: geopoint, coordinates: { latitude: latitude, longitude: longitude }, name: name, visited: visited });
    update = true;
  }
  if (update) {
    switch (type) {
      case StoreType.INN:
        const innContracts = await angularFirestore.collection(`shops/${fid}/contracts`).listDocuments();
        innContracts.map(contract => batch.delete(contract));
        const hero = (await angularFirestore.collection('heroes').where('random', '==', random(0, 19)).limit(1).get()).docs[0].data();
        const level = random(1, 10);
        batch.create(angularFirestore.collection(`shops/${fid}/contracts`).doc(), { id: hero.id, hero: hero, gold: 1000000 * level, level: level });
        break;
      case StoreType.MERCENARY:
        const mercenaryTroops = await angularFirestore.collection(`shops/${fid}/troops`).listDocuments();
        mercenaryTroops.map(troop => batch.delete(troop));
        const unit = (await angularFirestore.collection('units').where('random', '==', random(0, 64)).limit(1).get()).docs[0].data();
        const quantity = random(Math.min(...unit.amount), Math.max(...unit.amount));
        batch.create(angularFirestore.collection(`shops/${fid}/troops`).doc(), { id: unit.id, unit: unit, gold: 1000000 + (quantity * unit.power), quantity: quantity });
        break;
      case StoreType.MERCHANT:
        const merchantArtifacts = await angularFirestore.collection(`shops/${fid}/artifacts`).listDocuments();
        merchantArtifacts.map(artifact => batch.delete(artifact));
        const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
        const lot = random(1, 3);
        batch.create(angularFirestore.collection(`shops/${fid}/artifacts`).doc(), { id: item.id, item: item, gold: 1000000 * lot, quantity: lot });
        break;
      case StoreType.SORCERER:
        const sorcererCharms = await angularFirestore.collection(`shops/${fid}/charms`).listDocuments();
        sorcererCharms.map(charm => batch.delete(charm));
        const spell = (await angularFirestore.collection('spells').where('random', '==', random(0, 100)).limit(1).get()).docs[0].data();
        batch.create(angularFirestore.collection(`shops/${fid}/charms`).doc(), { id: spell.id, spell: spell, gold: 1000000 * spell.level });
        break;
    }
  }
  await batch.commit();
}

/**
 * checks a quest in the world
 * @param fid
 * @param latitude
 * @param longitude
 * @param type
 * @param name
 */
const checkQuest = async (fid?: string, latitude?: number, longitude?: number, type?: LocationType, name?: string) => {
  let update = false;
  const batch = angularFirestore.batch();
  const visited = moment(admin.firestore.Timestamp.now().toMillis()).add(VISITATION_TIME, 'seconds');
  const geopoint = latitude && longitude ? geofirex.point(latitude, longitude) : null;
  if (!fid) fid = geopoint.geohash;
  const quest = (await angularFirestore.doc(`quests/${fid}`).get()).data();
  if (quest) {
    if (moment().isAfter(moment(quest?.visited.toMillis()))) {
      batch.update(angularFirestore.doc(`quests/${fid}`), { visited: visited });
      update = true;
    }
  } else {
    const location = (await angularFirestore.doc(`locations/${type}`).get()).data();
    batch.create(angularFirestore.doc(`quests/${fid}`), { location: location, position: geopoint, coordinates: { latitude: latitude, longitude: longitude }, name: name, visited: visited });
    update = true;
  }
  if (update) {
    const questContracts = await angularFirestore.collection(`quests/${fid}/contracts`).listDocuments();
    questContracts.map(contract => batch.delete(contract));
    const questTroops = await angularFirestore.collection(`quests/${fid}/troops`).listDocuments();
    questTroops.map(troop => batch.delete(troop));
    const questArtifacts = await angularFirestore.collection(`quests/${fid}/artifacts`).listDocuments();
    questArtifacts.map(artifact => batch.delete(artifact));
    let questHeroes: string[] = [];
    let questUnits: string[] = [];
    let questItems: string[] = [];
    const legendaries: string[] = ['wisdom-tome', 'dragon-egg', 'voodoo-doll', 'golden-feather', 'lucky-coin', 'lucky-horseshoe', 'lucky-paw', 'magic-compass', 'magic-scroll', 'rattle'];
    const items: string[] = ['treasure-chest', 'necronomicon', 'enchanted-lamp', 'wisdom-tome', 'demon-horn', 'lightning-orb', 'dragon-egg', 'crystal-ball', 'agility-potion', 'defense-potion', 'cold-orb', 'earth-orb', 'fire-orb', 'mana-potion', 'light-orb', 'strength-potion', 'love-potion', 'spider-web', 'animal-fang', 'bone-necklace', 'crown-thorns', 'voodoo-doll', 'cursed-skull', 'cursed-mask', 'cursed-idol', 'golem-book', 'letter-thieves', 'lucky-coin', 'lucky-horseshoe', 'lucky-paw', 'magic-beans', 'magic-compass', 'mana-vortex', 'rattle', 'rotten-food', 'snake-eye', 'treasure-map', 'valhalla-horn', 'fairy-wings', 'vampire-teeth', 'holy-grenade', 'powder-barrel', 'vial-venom', 'ancient-rune', 'ice-stone', 'fire-scroll', 'cold-scroll', 'light-scroll', 'earth-scroll', 'lightning-scroll'];
    switch (type) {
      case LocationType.VOLCANO:
      case LocationType.DUNGEON:
        questHeroes = ['demon-prince'];
        questUnits = ['nightmare', 'medusa', 'cyclop', 'minotaur', 'devil', 'ogre', 'imp'];
        questItems = _.difference(items, legendaries);
        break;
      case LocationType.CAVE:
      case LocationType.MINE:
        questHeroes = ['orc-king'];
        questUnits = ['cave-troll', 'centaur', 'goblin', 'ogre', 'orc'];
        questItems = _.difference(items, legendaries);
        break;
      case LocationType.MOUNTAIN:
      case LocationType.RUIN:
        questHeroes = ['golem-golem'];
        questUnits = ['crystal-golem', 'iron-golem', 'stone-golem'];
        questItems = _.difference(items, legendaries);
        break;
      case LocationType.MONOLITH:
      case LocationType.PYRAMID:
        questHeroes = ['elementalist'];
        questUnits = ['lightning-elemental', 'djinni', 'ice-elemental', 'earth-elemental', 'fire-elemental', 'phoenix', 'light-elemental'];
        questItems = _.difference(items, legendaries);
        break;
      case LocationType.SHRINE:
      case LocationType.FOREST:
        questHeroes = ['beast-master'];
        questUnits = ['werewolf', 'giant-snail', 'werebear', 'spider', 'carnivorous-plant', 'griffon', 'pegasus', 'cavalry', 'trained-elephant', 'wolf'];
        questItems = _.difference(items, legendaries);
        break;
      case LocationType.LAKE:
      case LocationType.SHIP:
        questHeroes = ['illusionist', 'swamp-thing'];
        questUnits = ['medusa', 'leviathan', 'lizardman', 'hydra'];
        questItems = _.difference(items, legendaries);
        break;
      case LocationType.NEST:
      case LocationType.TOTEM:
        questHeroes = ['dragon-rider'];
        questUnits = ['bone-dragon', 'blue-dragon', 'white-dragon', 'red-dragon', 'golden-dragon', 'baby-dragon'];
        questItems = legendaries;
        break;
      case LocationType.CATHEDRAL:
      case LocationType.CASTLE:
        questHeroes = ['commander', 'colossus'];
        questUnits = ['angel', 'knight', 'monk', 'templar', 'pegasus', 'paladin', 'cavalry', 'fanatic', 'pikeman', 'fighter', 'archer'];
        questItems = _.difference(items, legendaries);
        break;
      case LocationType.BARRACK:
      case LocationType.ISLAND:
        questHeroes = ['golem-golem'];
        questUnits = ['frost-giant', 'leviathan', 'yeti', 'giant-snail', 'carnivorous-plant', 'hydra', 'cyclop', 'ogre', 'titan'];
        questItems = _.difference(items, legendaries);
        break;
      case LocationType.GRAVEYARD:
      case LocationType.TOWN:
        questHeroes = ['necrophage', 'soul-reaper'];
        questItems = _.difference(items, legendaries);
        questUnits = ['wraith', 'bone-dragon', 'nightmare', 'ghoul', 'lich', 'skeleton', 'vampire', 'werewolf', 'zombie'];
        break;
    }
    questHeroes = _.shuffle(questHeroes);
    questUnits = _.shuffle(questUnits);
    questItems = _.shuffle(questItems);
    for (const i of [0]) {
      const hero = (await angularFirestore.doc(`heroes/${questHeroes[i]}`).get()).data();
      batch.create(angularFirestore.collection(`quests/${fid}/contracts`).doc(), { id: hero?.id, hero: hero, level: random(1, 20) });
    };
    for (const j of [0,1,2]) {
      const unit = (await angularFirestore.doc(`units/${questUnits[j]}`).get()).data();
      batch.create(angularFirestore.collection(`quests/${fid}/troops`).doc(), { id: unit?.id, unit: unit, quantity: random(Math.min(...unit?.amount), Math.max(...unit?.amount)) });
    }
    for (const k of [0]) {
      const item = (await angularFirestore.doc(`items/${questItems[k]}`).get()).data();
      batch.create(angularFirestore.collection(`quests/${fid}/artifacts`).doc(), { id: item?.id, item: item, quantity: random(1, 3), turns: random(1, 5) });
    }
  }
  await batch.commit();
}

/**
 * refreshes the auction house
 */
const refreshAuctions = async () => {
  const batch = angularFirestore.batch();
  const kingdomAuctions = await angularFirestore.collection('auctions').get();
  if (kingdomAuctions.docs.length) {
    for (const kingdomAuction of kingdomAuctions.docs) { // cannot use forEach due to async/await of batch.commit
      const auction = kingdomAuction.data();
      if (moment().isAfter(moment(auction.auctioned.toMillis()))) {
        if (auction.kingdom) {
          if (auction.type === AuctionType.ARTIFACT) await addArtifact(auction.kingdom, auction.item, auction.quantity, batch);
          if (auction.type === AuctionType.CHARM) await addCharm(auction.kingdom, auction.spell, 0, batch);
          if (auction.type === AuctionType.CONTRACT) await addContract(auction.kingdom, auction.hero, auction.level, batch);
          if (auction.type === AuctionType.TROOP) await addTroop(auction.kingdom, auction.unit, auction.quantity, batch);
          const data = {
            item: auction.item || null,
            spell: auction.spell || null,
            hero: auction.hero || null,
            unit: auction.unit || null,
            quantity: auction.quantity || null,
            level: auction.level || null,
            gold: auction.gold || null,
          };
          const from = (await angularFirestore.doc(`kingdoms/${auction.kingdom}`).get()).data();
          await addLetter(auction.kingdom, 'kingdom.auction.subject', 'kingdom.auction.won', from, batch, data);
        }
        await startAuction(auction.type, batch);
        batch.delete(kingdomAuction.ref);
      }
    };
  } else {
    await startAuction(AuctionType.ARTIFACT, batch);
    await startAuction(AuctionType.ARTIFACT, batch);
    await startAuction(AuctionType.CHARM, batch);
    await startAuction(AuctionType.CONTRACT, batch);
    await startAuction(AuctionType.TROOP, batch);
  }
  await batch.commit();
}

/**
 * starts an auction
 * @param type
 * @param batch
 */
const startAuction = async (type: AuctionType, batch: FirebaseFirestore.WriteBatch) => {
  const auctioned = moment(admin.firestore.Timestamp.now().toMillis()).add(AUCTION_TIME, 'seconds');
  switch (type) {
    case AuctionType.ARTIFACT:
      const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
      batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.ARTIFACT, item: item, quantity: random(1, 2), gold: 1000000, auctioned: auctioned, kingdom: null /*'jEL0oPaXu9Unz0pfjxqOEJ9Y2Gy1'*/ });
      break;
    case AuctionType.CHARM:
      const spell = (await angularFirestore.collection('spells').where('random', '==', random(0, 99)).limit(1).get()).docs[0].data();
      batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.CHARM, spell: spell, gold: 1000000, auctioned: auctioned, kingdom: 'jEL0oPaXu9Unz0pfjxqOEJ9Y2Gy1' });
      break;
    case AuctionType.CONTRACT:
      const hero = (await angularFirestore.collection('heroes').where('random', '==', random(0, 19)).limit(1).get()).docs[0].data();
      batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.CONTRACT, hero: hero, level: random(1, 10), gold: 1000000, auctioned: auctioned, kingdom: 'jEL0oPaXu9Unz0pfjxqOEJ9Y2Gy1' });
      break;
    case AuctionType.TROOP:
      const unit = (await angularFirestore.collection('units').where('random', '==', random(0, 64)).limit(1).get()).docs[0].data();
      batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.TROOP, unit: unit, quantity: random(Math.min(...unit.amount), Math.max(...unit.amount)), gold: 1000000, auctioned: auctioned, kingdom: 'jEL0oPaXu9Unz0pfjxqOEJ9Y2Gy1' });
      break;
  }
}

/**
 * foundates a clan
 * @param kingdomId
 * @param name
 * @param description
 * @param image
 */
const foundateClan = async (kingdomId: string, name: string, description: string, image: string) => {
  const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0].data();
  if (CLAN_COST <= kingdomGold.quantity) {
    const batch = angularFirestore.batch();
    const leader = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
    const clan = (await (await angularFirestore.collection('clans').add({
      name: name,
      description: description,
      image: image,
      leader: leader,
      power: leader?.power,
    })).get());
    batch.create(angularFirestore.collection(`clans/${clan.id}/members`).doc(leader?.id), leader);
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}`), { clan: { ...clan.data(), fid: clan.id } });
    await addSupply(kingdomId, 'gold', -CLAN_COST, batch);
    await batch.commit();
  } else throw new Error('api.error.clan');
}

/**
 * joins a clan
 * @param kingdomId
 * @param clanId
 */
const joinClan = async (kingdomId: string, clanId: string) => {
  const kingdom = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
  const clan = await angularFirestore.doc(`clans/${clanId}`).get();
  const batch = angularFirestore.batch();
  batch.update(angularFirestore.doc(`clans/${clanId}`), { power: admin.firestore.FieldValue.increment(kingdom?.power) });
  batch.create(angularFirestore.doc(`clans/${clanId}/members/${kingdom?.id}`), kingdom);
  batch.update(angularFirestore.doc(`kingdoms/${kingdomId}`), { clan: { ...clan.data(), fid: clan.id } });
  await batch.commit();
}

/**
 * leaves a clan
 * @param kingdomId
 * @param clanId
 */
const leaveClan = async (kingdomId: string, clanId: string) => {
  const kingdom = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
  const batch = angularFirestore.batch();
  batch.update(angularFirestore.doc(`clans/${clanId}`), { power: admin.firestore.FieldValue.increment(-kingdom?.power) });
  batch.delete(angularFirestore.doc(`clans/${clanId}/members/${kingdomId}`));
  batch.update(angularFirestore.doc(`kingdoms/${kingdomId}`), { clan: null });
  await batch.commit();
}

/**
 * assigns a charm into an assignment
 * @param kingdomId
 * @param charmId
 * @param assignmentId
 */
const assignCharm = async (kingdomId: string, charmId: string, assignmentId: string) => {
  const batch = angularFirestore.batch();
  batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/charms/${charmId}`), { assignment: Number(assignmentId) });
  await batch.commit();
}

/**
 * assigns an artifact into an assignment
 * @param kingdomId
 * @param artifactId
 * @param assignmentId
 */
const assignArtifact = async (kingdomId: string, artifactId: string, assignmentId: string) => {
  const batch = angularFirestore.batch();
  batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${artifactId}`), { assignment: Number(assignmentId) });
  await batch.commit();
}

/**
 * kingdom offers a resource to a god in exchange of some random rewards, good and bad
 * @param kingdomId
 * @param godId
 * @param sacrifice
 */
const offerGod = async (kingdomId: string, godId: string, sacrifice: number) => {
  let result = {};
  const kingdomGod = (await angularFirestore.doc(`gods/${godId}`).get()).data();
  if (kingdomGod) {
    const resource = kingdomGod.gold
      ? 'gold'
      : kingdomGod.mana
        ? 'mana'
        : kingdomGod.population
          ? 'population'
          : kingdomGod.land
            ? 'land'
            : 'turn';
    const kingdomSupply = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', resource).limit(1).get()).docs[0].data();
    if (resource === 'turn') kingdomSupply.quantity = calculate(kingdomSupply.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomSupply.resource.max, kingdomSupply.resource.ratio);
    if (sacrifice >= kingdomGod.increment && sacrifice <= kingdomSupply.quantity) {
      const batch = angularFirestore.batch();
      batch.update(angularFirestore.doc(`gods/${godId}`), { sacrifice: admin.firestore.FieldValue.increment(sacrifice), armageddon: (kingdomGod.sacrifice + sacrifice) >= kingdomGod[resource] });
      await addSupply(kingdomId, resource, -sacrifice, batch, resource === 'turn' ? kingdomSupply.resource.ratio : null);
      const rewards = ['supply', 'artifact', 'contract', 'enchantment', 'troop', 'building', 'charm'];
      const reward = rewards[random(0, rewards.length - 1)];
      switch (reward) {
        case 'enchantment':
          const enchantments = (await angularFirestore.collection('spells').where('type', '==', 'enchantment').where('multiple', '==', false).get());
          const enchantment = enchantments.docs[random(0, enchantments.docs.length - 1)].data();
          await addEnchantment(kingdomId, enchantment, kingdomId, enchantment.turnDuration, batch);
          result = { enchantment: `spell.${enchantment.id}.name`, turns: enchantment.turnDuration };
          break;
        case 'contract':
          const hero = (await angularFirestore.collection('heroes').where('random', '==', random(0, 19)).limit(1).get()).docs[0].data();
          const level = Math.floor(Math.random() * 9) + 1;
          await addContract(kingdomId, hero, level, batch);
          result = { hero: `hero.${hero.id}.name`, level: level };
          break;
        case 'artifact':
          const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
          const lot = 1;
          await addArtifact(kingdomId, item, lot, batch);
          result = { item: `item.${item.id}.name`, quantity: lot };
          break;
        case 'troop':
          const unit = (await angularFirestore.collection('units').where('random', '==', random(0, 64)).limit(1).get()).docs[0].data();
          const size = random(Math.min(...unit.amount), Math.max(...unit.amount));
          await addTroop(kingdomId, unit, size, batch);
          result = { unit: `unit.${unit.id}.name`, quantity: size };
          break;
        case 'supply':
          const resource = (await angularFirestore.collection('resources').where('random', '==', random(0, 5)).limit(1).get()).docs[0].data();
          let amount = 0;
          if (resource.id === 'gem') amount = random(-5, 25);
          if (resource.id === 'turn') amount = random(-25, 50);
          if (resource.id === 'land') amount = random(-50, 100);
          if (resource.id === 'gold') amount = random(-1000000, 2000000);
          if (resource.id === 'mana') amount = random(-500000, 1000000);
          if (resource.id === 'population') amount = random(-250000, 500000);
          await addSupply(kingdomId, resource.id, amount, batch);
          result = { [resource.id]: amount };
          break;
        case 'building':
          const structure = (await angularFirestore.collection('structures').where('random', '==', random(0, 6)).limit(1).get()).docs[0].data();
          const number = random(-50, 150);
          await addBuilding(kingdomId, structure.id, number, batch);
          result = { building: `structure.${structure.id}.name`, number: number };
          break;
        case 'charm':
          const spell = (await angularFirestore.collection('spells').where('random', '==', random(0, 99)).limit(1).get()).docs[0].data();
          const turns = random(0, 300);
          await addCharm(kingdomId, spell, turns, batch);
          result = { spell: `spell.${spell.id}.name`, turns: turns };
          break;
      }
      await batch.commit();
      return result;
    } else throw new Error('api.error.offer');
  } else throw new Error('api.error.offer');
}

/**
 * tries to dispel an enchantment
 * @param kingdomId
 * @param enchantmentId
 */
const dispelEnchantment = async (kingdomId: string, enchantmentId: string) => {
  const kingdomEnchantment = (await angularFirestore.doc(`kingdoms/${kingdomId}/enchantments/${enchantmentId}`).get()).data();
  if (kingdomEnchantment) {
    const batch = angularFirestore.batch();
    batch.delete(angularFirestore.doc(`kingdoms/${kingdomId}/enchantments/${enchantmentId}`));
    // origin
    const goldBalanceOrigin = kingdomEnchantment.spell.goldMaintenance;
    if (goldBalanceOrigin) {
      const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomEnchantment.from}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
      batch.update(kingdomGold.ref, { balance: admin.firestore.FieldValue.increment(goldBalanceOrigin) });
    }
    const manaBalanceOrigin = kingdomEnchantment.spell.manaMaintenance;
    if (manaBalanceOrigin) {
      const kingdomMana = (await angularFirestore.collection(`kingdoms/${kingdomEnchantment.from}/supplies`).where('id', '==', 'mana').limit(1).get()).docs[0];
      batch.update(kingdomMana.ref, { balance: admin.firestore.FieldValue.increment(manaBalanceOrigin) });
    }
    const populationBalanceOrigin = kingdomEnchantment.spell.populationMaintenance;
    if (populationBalanceOrigin) {
      const kingdomPopulation = (await angularFirestore.collection(`kingdoms/${kingdomEnchantment.from}/supplies`).where('id', '==', 'population').limit(1).get()).docs[0];
      batch.update(kingdomPopulation.ref, { balance: admin.firestore.FieldValue.increment(populationBalanceOrigin) });
    }
    // target
    const goldBalance = -kingdomEnchantment.spell.goldProduction;
    if (goldBalance) {
      const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0];
      batch.update(kingdomGold.ref, { balance: admin.firestore.FieldValue.increment(goldBalance) });
    }
    const manaBalance = -kingdomEnchantment.spell.manaProduction;
    if (manaBalance) {
      const kingdomMana = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'mana').limit(1).get()).docs[0];
      batch.update(kingdomMana.ref, { balance: admin.firestore.FieldValue.increment(manaBalance) });
    }
    const populationBalance = -kingdomEnchantment.spell.populationProduction;
    if (populationBalance) {
      const kingdomPopulation = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'population').limit(1).get()).docs[0];
      batch.update(kingdomPopulation.ref, { balance: admin.firestore.FieldValue.increment(populationBalance) });
    }
    const landProduction = -kingdomEnchantment.spell.landProduction;
    if (landProduction) {
      const kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').limit(1).get()).docs[0];
      batch.update(kingdomLand.ref, { balance: admin.firestore.FieldValue.increment(landProduction) });
    }
    const buildBonus = -kingdomEnchantment.spell.buildBonus;
    if (buildBonus) {
      const kingdomWorkshop = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'workshop').limit(1).get()).docs[0];
      batch.update(kingdomWorkshop.ref, { bonus: admin.firestore.FieldValue.increment(buildBonus) });
    }
    const researchBonus = -kingdomEnchantment.spell.researchBonus;
    if (researchBonus) {
      const kingdomAcademy = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'academy').limit(1).get()).docs[0];
      batch.update(kingdomAcademy.ref, { bonus: admin.firestore.FieldValue.increment(researchBonus) });
    }
    batch.commit();
    return { success: true };
  } else throw new Error('api.error.dispel');
}
