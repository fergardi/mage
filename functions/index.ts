'use strict';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import * as express from 'express';
import * as ash from 'express-async-handler';
import * as moment from 'moment';
import * as _ from 'lodash';

//========================================================================================
/*                                                                                      *
 *                                       FIRESTORE                                      *
 *                                                                                      */
//========================================================================================

// firestore
admin.initializeApp({ credential: admin.credential.cert(require('./credentials/key.json')) });
const angularFirestore: FirebaseFirestore.Firestore = admin.firestore();
const geo: any = require('geofirex');
const geofirex: any = geo.init(admin);

//========================================================================================
/*                                                                                      *
 *                                        EXPRESS                                       *
 *                                                                                      */
//========================================================================================

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
api.delete('/kingdom/:kingdomId/temple/:enchantmentId/dispel', ash(async (req: any, res: any) => res.json(await dispelIncantation(req.params.kingdomId, req.params.enchantmentId))));
api.delete('/kingdom/:kingdomId/temple/:enchantmentId/break', ash(async (req: any, res: any) => res.json(await breakEnchantment(req.params.kingdomId, req.params.enchantmentId))));
api.patch('/kingdom/:kingdomId/city/:buildingId/build/:quantity', ash(async (req: any, res: any) => res.json(await buildStructure(req.params.kingdomId, req.params.buildingId, parseInt(req.params.quantity)))));
api.patch('/kingdom/:kingdomId/city/:buildingId/demolish/:quantity', ash(async (req: any, res: any) => res.json(await demolishStructure(req.params.kingdomId, req.params.buildingId, parseInt(req.params.quantity)))));
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
api.get('/kingdom/:kingdomId/world/shop/:shopId/:collectionId/:dealId', ash(async (req: any, res: any) => res.json(await tradeDeal(req.params.kingdomId, req.params.shopId, req.params.collectionId, req.params.dealId))));
api.get('/kingdom/:kingdomId/world/quest/:questId', ash(async (req: any, res: any) => res.json(await adventureQuest(req.params.kingdomId, req.params.questId))));
// error handler
api.use((err: any, req: any, res: any, next: any) => res.status(500).json({ status: 500, error: err.message }));;

// https
exports.api = functions
.region('europe-west1')
.https
.onRequest(api);

//========================================================================================
/*                                                                                      *
 *                                       DEFAULTS                                       *
 *                                                                                      */
//========================================================================================

const MAX_TURNS: number = 300;
const MIN_LANDS: number = 1;
const MAX_LANDS: number = 3500;
// const BATTLE_TURNS: number = 2;
const BATTLE_ROUNDS: number = 5;
const BATTLE_POWER: number = 20;
// const PROTECTION_TIME: number = 60;
const VISITATION_TIME: number = 60;
const AUCTION_TIME: number = 60;
const GUILD_TIME: number = 60;
const CLAN_COST: number = 1000000;
const FACTION_MULTIPLIER: number = 2;

export type BattleReport = {
  attackerPowerLost: number;
  defenderPowerLost: number;
  victory: boolean;
  logs: any[];
}

export enum KingdomType {
  RED = 'red',
  GREEN = 'green',
  BLACK = 'black',
  BLUE = 'blue',
  WHITE = 'white',
  GREY = 'grey',
}

export enum BonusType {
  EXPLORE = 'explore',
  RESEARCH = 'research',
  BUILD = 'build',
}

export enum TargetType {
  ATTACKER = 'attacker',
  DEFENDER = 'defender',
}

export enum BattleType {
  SIEGE = 'siege',
  PILLAGE = 'pillage',
  ATTACK = 'attack',
  ADVENTURE = 'adventure',
}

enum StoreType {
  INN = 'inn',
  MERCENARY = 'mercenary',
  SORCERER = 'sorcerer',
  MERCHANT = 'merchant',
}

export enum CategoryType {
  MELEE = 'melee',
  RANGED = 'ranged',
  MAGIC = 'magic',
  PSYCHIC = 'psychic',
  BREATH = 'breath',
  FIRE = 'fire',
  POISON = 'poison',
  COLD = 'cold',
  LIGHTNING = 'lightning',
  HOLY = 'holy',
}

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
}

enum AuctionType {
  ARTIFACT = 'artifact',
  CHARM = 'charm',
  CONTRACT = 'contract',
  TROOP = 'troop',
}

export enum SupplyType {
  GOLD = 'gold',
  MANA = 'mana',
  POPULATION = 'population',
  LAND = 'land',
  TURN = 'turn',
  GEM = 'gem',
}

enum AssignmentType {
  NONE,
  ATTACK,
  DEFENSE,
}

//========================================================================================
/*                                                                                      *
 *                                        HELPERS                                       *
 *                                                                                      */
//========================================================================================

/**
 * random
 * @param min
 * @param max
 */
export const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * calculate remaining turns
 * @param from
 * @param to
 * @param max
 * @param ratio
 */
export const calculate = (from: any, to: any, max: number, ratio: number): number => {
  const start = moment(from);
  const end = moment(to);
  const minutes = moment.duration(end.diff(start)).asMinutes();
  return max
    ? Math.min(max, Math.floor(minutes / ratio))
    : Math.floor(minutes / ratio);
};

//========================================================================================
/*                                                                                      *
 *                                       KINGDOMS                                       *
 *                                                                                      */
//========================================================================================

/**
 * creates a new kingdom
 * @param kingdomId
 * @param factionId
 * @param name
 * @param latitude
 * @param longitude
 */
export const createKingdom = async (kingdomId: string, factionId: KingdomType, name: string, latitude: number, longitude: number) => {
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

//========================================================================================
/*                                                                                      *
 *                                       SUPPLIES                                       *
 *                                                                                      */
//========================================================================================

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
      timestamp: moment(admin.firestore.Timestamp.now().toMillis()).subtract((total + quantity) * ratio, 'minutes').subtract(1, 'seconds'),
    });
    if (quantity < 0) await payMaintenance(kingdomId, Math.abs(quantity), batch);
  } else {
    const q = s.max && (s.quantity + quantity > s.max) ? s.max : s.quantity + quantity <= 0 ? 0 : admin.firestore.FieldValue.increment(quantity);
    if (max) batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomSupply.id}`), { quantity: q, max: max });
    else batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomSupply.id}`), { quantity: q });
  }
}

/**
 * kingdom charges mana a given number of turns
 * @param kingdomId
 * @param turns
 */
export const chargeMana = async (kingdomId: string, turns: number) => {
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
export const taxGold = async (kingdomId: string, turns: number) => {
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
 * kingdom explores lands on a given number of turns
 * @param kingdomId
 * @param turns
 */
export const exploreLands = async (kingdomId: string, turns: number) => {
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

//========================================================================================
/*                                                                                      *
 *                                     MAINTENANCES                                     *
 *                                                                                      */
//========================================================================================

/**
 * balances a supply
 * @param kingdomId
 * @param supply
 * @param balance
 * @param batch
 */
export const balanceSupply = async (kingdomId: string, supply: SupplyType, balance: number, batch: FirebaseFirestore.WriteBatch) => {
  if (balance) {
    const kingdomSupply = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', supply).limit(1).get()).docs[0];
    batch.update(kingdomSupply.ref, { balance: admin.firestore.FieldValue.increment(balance) });
  }
}

/**
 * balances the power
 * @param kingdomId
 * @param power
 * @param batch
 */
export const balancePower = async (kingdomId: string, power: number, batch: FirebaseFirestore.WriteBatch) => {
  if (power) {
    const kingdom = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}`), { power: kingdom?.power + power <= 0 ? 0 : admin.firestore.FieldValue.increment(power) });
  }
}

/**
 * balances a bonus
 * @param kingdomId
 * @param type
 * @param bonus
 * @param batch
 */
export const balanceBonus = async (kingdomId: string, type: BonusType, bonus: number, batch: FirebaseFirestore.WriteBatch) => {
  if (bonus) {
    switch (type) {
      case BonusType.EXPLORE:
        const kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').limit(1).get()).docs[0];
        batch.update(kingdomLand.ref, { bonus: admin.firestore.FieldValue.increment(bonus) });
        break;
      case BonusType.RESEARCH:
        const kingdomAcademy = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'academy').limit(1).get()).docs[0];
        batch.update(kingdomAcademy.ref, { bonus: admin.firestore.FieldValue.increment(bonus) });
        break;
      case BonusType.BUILD:
        const kingdomWorkshop = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'workshop').limit(1).get()).docs[0];
        batch.update(kingdomWorkshop.ref, { bonus: admin.firestore.FieldValue.increment(bonus) });
        break;
    }
  }
}

/**
 * pay the maintenances if turns are spent
 * @param kingdomId
 * @param turns
 * @param batch
 */
export const payMaintenance = async (kingdomId: string, turns: number, batch: FirebaseFirestore.WriteBatch) => {
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
  // letter
  const from = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
  // units
  const kingdomTroop = await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).limit(1).get();
  if (!kingdomTroop.empty) {
    const troop = kingdomTroop.docs[0].data();
    await removeTroop(kingdomId, kingdomTroop.docs[0].id, troop.quantity, batch);
    const data = {
      unit: troop.unit,
      quantity: troop.quantity,
    };
    await addLetter(kingdomId, 'kingdom.disband.subject', 'kingdom.disband.message', from, batch, data);
    return;
  }
  // heroes
  const kingdomContract = await angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).limit(1).get();
  if (!kingdomContract.empty) {
    const contract = kingdomContract.docs[0].data();
    await removeContract(kingdomId, kingdomContract.docs[0].id, batch);
    const data = {
      hero: contract.hero,
      level: contract.level,
    };
    await addLetter(kingdomId, 'kingdom.discharge.subject', 'kingdom.discharge.message', from, batch, data);
    return;
  }
  // enchantments
  const kingdomIncantation = await angularFirestore.collection(`kingdoms/${kingdomId}/incantations`).limit(1).get();
  if (!kingdomIncantation.empty) {
    const enchantment = kingdomIncantation.docs[0].data();
    await removeEnchantment(kingdomId, kingdomIncantation.docs[0].id, batch);
    const data = {
      spell: enchantment.spell,
      level: enchantment.level,
    };
    await addLetter(kingdomId, 'kingdom.dispel.subject', 'kingdom.dispel.message', from, batch, data);
    return;
  }
}

//========================================================================================
/*                                                                                      *
 *                                        TROOPS                                        *
 *                                                                                      */
//========================================================================================

/**
 * add troop to a kingdom
 * @param kingdomId
 * @param unitId
 * @param quantity
 * @param batch
 */
export const addTroop = async (kingdomId: string, unit: any, quantity: number, batch: FirebaseFirestore.WriteBatch) => {
  const kingdomTroop = await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).where('id', '==', unit.id).limit(1).get();
  if (kingdomTroop.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/troops/${kingdomTroop.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: unit.id, quantity: quantity, unit: unit, assignment: 0 });
  }
  await balanceSupply(kingdomId, SupplyType.GOLD, -Math.floor(unit.goldMaintenance * quantity), batch);
  await balanceSupply(kingdomId, SupplyType.MANA, -Math.floor(unit.manaMaintenance * quantity), batch);
  await balanceSupply(kingdomId, SupplyType.POPULATION, -Math.floor(unit.populationMaintenance * quantity), batch);
  await balancePower(kingdomId, Math.floor(unit.power * quantity), batch);
}

/**
 * kingdom disbands troops on a given number
 * @param kingdomId
 * @param troopId
 * @param quantity
 */
export const disbandTroop = async (kingdomId: string, troopId: string, quantity: number) => {
  const batch = angularFirestore.batch();
  const response = await removeTroop(kingdomId, troopId, quantity, batch);
  await batch.commit();
  return response;
}

/**
 * removes a troop
 * @param kingdomId
 * @param troopId
 * @param quantity
 * @param batch
 */
export const removeTroop = async (kingdomId: string, troopId: string, quantity: number, batch: FirebaseFirestore.WriteBatch, questId?: string) => {
  if (!questId) {
    const kingdomTroop = (await angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troopId}`).get()).data();
    if (kingdomTroop) {
      const unit = kingdomTroop?.unit;
      // if (unit.populationMaintenance <= 0) {
        if (quantity >= kingdomTroop?.quantity) {
          quantity = kingdomTroop?.quantity;
          batch.delete(angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troopId}`));
        } else {
          batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troopId}`), { quantity: admin.firestore.FieldValue.increment(-quantity) });
        }
        await balanceSupply(kingdomId, SupplyType.GOLD, Math.floor(unit.goldMaintenance * quantity), batch);
        await balanceSupply(kingdomId, SupplyType.MANA, Math.floor(unit.manaMaintenance * quantity), batch);
        await balanceSupply(kingdomId, SupplyType.POPULATION, Math.floor(unit.populationMaintenance * quantity), batch);
        await balancePower(kingdomId, -Math.floor(unit.power * quantity), batch);
        return { quantity: quantity, unit: unit.name };
      // } else throw new Error('api.error.troop');
    } else throw new Error('api.error.troop');
  } else {
    const questTroop = (await angularFirestore.doc(`quests/${questId}/troops/${troopId}`).get()).data();
    if (questTroop) {
      if (quantity >= questTroop?.quantity) {
        batch.delete(angularFirestore.doc(`quests/${questId}/troops/${troopId}`));
      } else {
        batch.update(angularFirestore.doc(`quests/${questId}/troops/${troopId}`), { quantity: admin.firestore.FieldValue.increment(-quantity) });
      }
      return;
    } else throw new Error('api.error.troop');
  }
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
 * kingdom assigns troops to their assignments with proper sorting
 * @param kingdomId
 * @param army
 */
const assignArmy = async (kingdomId: string, army: any[]) => {
  const batch = angularFirestore.batch();
  army.forEach(troop => batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troop.troopId}`), { sort: troop.sort, assignment: troop.assignment }));
  await batch.commit();
}

//========================================================================================
/*                                                                                      *
 *                                       CONTRACTS                                      *
 *                                                                                      */
//========================================================================================

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
    await balanceSupply(kingdomId, SupplyType.GOLD, Math.floor((hero.goldProduction - hero.goldMaintenance) * level), batch);
    await balanceSupply(kingdomId, SupplyType.MANA, Math.floor((hero.manaProduction - hero.manaMaintenance) * level), batch);
    await balanceSupply(kingdomId, SupplyType.POPULATION, Math.floor((hero.populationProduction - hero.populationMaintenance) * level), batch);
    await balanceBonus(kingdomId, BonusType.EXPLORE, Math.floor(hero.exploreBonus * level), batch);
    await balanceBonus(kingdomId, BonusType.BUILD, Math.floor(hero.buildBonus * level), batch);
    await balanceBonus(kingdomId, BonusType.RESEARCH, Math.floor(hero.researchBonus * level), batch);
    await balancePower(kingdomId, Math.floor(hero.power * level), batch);
  }
}

/**
 * kingdom break a contract with a hero
 * @param kingdomId
 * @param contractId
 */
const dischargeContract = async (kingdomId: string, contractId: string) => {
  const batch = angularFirestore.batch();
  await removeContract(kingdomId, contractId, batch);
  await batch.commit();
}

/**
 * removes a contract
 * @param kingdomId
 * @param contractId
 */
const removeContract = async (kingdomId: string, contractId: string, batch: FirebaseFirestore.WriteBatch) => {
  const kingdomContract = (await angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${contractId}`).get()).data();
  if (kingdomContract) {
    batch.delete(angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${contractId}`));
    await balanceSupply(kingdomId, SupplyType.GOLD, Math.floor((kingdomContract.hero.goldMaintenance - kingdomContract.hero.goldProduction) * kingdomContract.level), batch);
    await balanceSupply(kingdomId, SupplyType.MANA, Math.floor((kingdomContract.hero.manaMaintenance - kingdomContract.hero.manaProduction) * kingdomContract.level), batch);
    await balanceSupply(kingdomId, SupplyType.POPULATION, Math.floor((kingdomContract.hero.populationMaintenance - kingdomContract.hero.populationProduction) * kingdomContract.level), batch);
    await balanceBonus(kingdomId, BonusType.EXPLORE, -Math.floor(kingdomContract.hero.exploreBonus * kingdomContract.level), batch);
    await balanceBonus(kingdomId, BonusType.BUILD, -Math.floor(kingdomContract.hero.buildBonus * kingdomContract.level), batch);
    await balanceBonus(kingdomId, BonusType.RESEARCH, -Math.floor(kingdomContract.hero.researchBonus * kingdomContract.level), batch);
    await balancePower(kingdomId, -Math.floor(kingdomContract.hero.power * kingdomContract.level), batch);
  } else throw new Error('api.error.discharge');
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

//========================================================================================
/*                                                                                      *
 *                                        CHARMS                                        *
 *                                                                                      */
//========================================================================================

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

//========================================================================================
/*                                                                                      *
 *                                       ARTIFACTS                                      *
 *                                                                                      */
//========================================================================================

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
        gems: item.gems,
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
            spell = (await angularFirestore.collection('spells').where('random', '==', random(0, 99)).limit(1).get()).docs[0].data();
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

//========================================================================================
/*                                                                                      *
 *                                       BUILDINGS                                      *
 *                                                                                      */
//========================================================================================

/**
 * kingdom builds a structure
 * @param kingdomId
 * @param buildingId
 * @param quantity
 */
const buildStructure = async (kingdomId: string, buildingId: string, quantity: number) => {
  const kingdomBuilding = (await angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${buildingId}`).get()).data();
  if (kingdomBuilding) {
    const batch = angularFirestore.batch();
    const kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').limit(1).get()).docs[0].data();
    const structure = kingdomBuilding.structure;
    const kingdomWorkshop = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'workshop').limit(1).get()).docs[0].data();
    const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0].data();
    const resourceTurn = (await angularFirestore.doc(`resources/turn`).get()).data();
    const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
    const gold = structure?.goldCost * quantity;
    const turn = Math.ceil(quantity / Math.ceil((kingdomWorkshop.quantity + 1) / structure?.turnRatio))
    const maxTurns = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), resourceTurn?.max, resourceTurn?.ratio);
    if (quantity > 0 && quantity <= kingdomLand.quantity && gold <= kingdomGold.quantity && turn <= maxTurns) {
      await addSupply(kingdomId, 'turn', -turn, batch, resourceTurn?.ratio);
      await addSupply(kingdomId, 'gold', -gold, batch);
      await addSupply(kingdomId, 'land', -quantity, batch);
      if (kingdomBuilding.id === 'node') await addSupply(kingdomId, 'mana', 0, batch, 0, (kingdomBuilding.quantity + quantity) * structure?.manaCapacity);
      if (kingdomBuilding.id === 'village') await addSupply(kingdomId, 'population', 0, batch, 0, (kingdomBuilding.quantity + quantity) * structure?.populationCapacity);
      await addBuilding(kingdomId, kingdomBuilding.id, quantity, batch);
      await batch.commit();
      return { quantity: quantity, structure: structure?.name };
    } else throw new Error('api.error.build');
  } else throw new Error('api.error.build');
}

/**
 * kingdom demolishes a structure
 * @param kingdomId
 * @param buildingId
 * @param quantity
 */
const demolishStructure = async (kingdomId: string, buildingId: string, quantity: number) => {
  const kingdomBuilding = (await angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${buildingId}`).get()).data();
  if (kingdomBuilding) {
    if (quantity > 0 && quantity <= kingdomBuilding.quantity) {
      const batch = angularFirestore.batch();
      await addBuilding(kingdomId, kingdomBuilding.id, -quantity, batch);
      await addSupply(kingdomId, 'land', quantity, batch);
      await batch.commit();
      return { quantity: quantity, structure: kingdomBuilding.structure.name };
    } else throw new Error('api.error.demolish');
  } else throw new Error('api.error.demolish');
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
    if (quantity >= 0) {
      await balanceSupply(kingdomId, SupplyType.GOLD, Math.floor((building.structure.goldProduction - building.structure.goldMaintenance) * quantity), batch);
      await balanceSupply(kingdomId, SupplyType.MANA, Math.floor((building.structure.manaProduction - building.structure.manaMaintenance) * quantity), batch);
      await balanceSupply(kingdomId, SupplyType.POPULATION, Math.floor((building.structure.populationProduction - building.structure.populationMaintenance) * quantity), batch);
      await balancePower(kingdomId, Math.floor(building.structure.power * quantity), batch);
    } else {
      await balanceSupply(kingdomId, SupplyType.GOLD, Math.floor((building.structure.goldMaintenance - building.structure.goldProduction) * Math.abs(quantity)), batch);
      await balanceSupply(kingdomId, SupplyType.MANA, Math.floor((building.structure.manaMaintenance - building.structure.manaProduction) * Math.abs(quantity)), batch);
      await balanceSupply(kingdomId, SupplyType.POPULATION, Math.floor((building.structure.populationMaintenance - building.structure.populationProduction) * Math.abs(quantity)), batch);
      await balancePower(kingdomId, Math.floor(building.structure.power * Math.abs(quantity)), batch);
    }
  } else throw new Error('api.error.building');
}

//========================================================================================
/*                                                                                      *
 *                                        LETTERS                                       *
 *                                                                                      */
//========================================================================================

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
  await addLetter(kingdomId, subject, message, from, batch, null);
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

//========================================================================================
/*                                                                                      *
 *                                         SHOPS                                        *
 *                                                                                      */
//========================================================================================

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
        const spell = (await angularFirestore.collection('spells').where('random', '==', random(0, 99)).limit(1).get()).docs[0].data();
        batch.create(angularFirestore.collection(`shops/${fid}/charms`).doc(), { id: spell.id, spell: spell, gold: 1000000 * spell.level });
        break;
    }
  }
  await batch.commit();
}

/**
 * kingdom buys a deal from a shop
 * @param kingdomId
 * @param shopId
 * @param collectionId
 * @param dealId
 */
const tradeDeal = async (kingdomId: string, shopId: string, collectionId: string, dealId: string) => {
  const worldDeal = (await angularFirestore.doc(`shops/${shopId}/${collectionId}/${dealId}`).get()).data();
  if (worldDeal) {
    const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0].data();
    if (worldDeal.gold <= kingdomGold.quantity) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, 'gold', -worldDeal.gold, batch);
      let data = {};
      switch (collectionId) {
        case 'troops':
          data = {
            unit: worldDeal.unit,
            quantity: worldDeal.quantity,
          };
          await addTroop(kingdomId, worldDeal.unit, worldDeal.quantity, batch);
          break;
        case 'contracts':
          data = {
            hero: worldDeal.hero,
            level: worldDeal.level,
          };
          await addContract(kingdomId, worldDeal.hero, worldDeal.level, batch);
          break;
        case 'charms':
          data = {
            spell: worldDeal.spell,
            level: 0,
          };
          await addCharm(kingdomId, worldDeal.spell, 0, batch);
          break;
        case 'artifacts':
          data = {
            artifact: worldDeal.artifact,
            quantity: worldDeal.quantity,
          };
          await addArtifact(kingdomId, worldDeal.item, worldDeal.quantity, batch);
          break;
      }
      const from = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
      await addLetter(kingdomId, 'world.deal.subject', 'world.deal.message', from, batch, data);
      await batch.commit();
      await checkShop(shopId);
    } else throw new Error('api.error.deal');
  } else throw new Error('api.error.deal');
}

//========================================================================================
/*                                                                                      *
 *                                        QUESTS                                        *
 *                                                                                      */
//========================================================================================

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
      batch.update(angularFirestore.doc(`quests/${fid}`), { visited: visited, turns: random(1, 3) });
      update = true;
    }
  } else {
    const location = (await angularFirestore.doc(`locations/${type}`).get()).data();
    batch.create(angularFirestore.doc(`quests/${fid}`), { location: location, position: geopoint, coordinates: { latitude: latitude, longitude: longitude }, name: name, turns: random(1, 3), visited: visited });
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
      batch.create(angularFirestore.collection(`quests/${fid}/contracts`).doc(), { id: hero?.id, hero: hero, level: random(1, 20), assignment: AssignmentType.DEFENSE });
    };
    for (const j of [0,1,2]) {
      const unit = (await angularFirestore.doc(`units/${questUnits[j]}`).get()).data();
      batch.create(angularFirestore.collection(`quests/${fid}/troops`).doc(), { id: unit?.id, unit: unit, quantity: random(Math.min(...unit?.amount), Math.max(...unit?.amount)), sort: j, assignment: AssignmentType.DEFENSE });
    }
    for (const k of [0]) {
      const item = (await angularFirestore.doc(`items/${questItems[k]}`).get()).data();
      batch.create(angularFirestore.collection(`quests/${fid}/artifacts`).doc(), { id: item?.id, item: item, quantity: random(1, 3), turns: random(1, 5), assignment: AssignmentType.NONE });
    }
  }
  await batch.commit();
}

/**
 * kingdom adventures on a quest
 * @param kingdomId
 * @param questId
 */
const adventureQuest = async (kingdomId: string, questId: string) => {
  const worldQuest = (await angularFirestore.doc(`quests/${questId}`).get()).data();
  if (worldQuest) {
    const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
    kingdomTurn.quantity = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
    if (worldQuest.turns <= kingdomTurn.quantity) {
      const kingdomContracts = (await angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).where('assignment', '==', AssignmentType.ATTACK).limit(3).get()).docs.map(contract => ({ ...contract.data(), fid: contract.id }));
      const kingdomTroops = (await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).where('assignment', '==', AssignmentType.ATTACK).orderBy('sort', 'asc').limit(5).get()).docs.map(troop => ({ ...troop.data(), fid: troop.id, initialQuantity: troop.data().quantity }));
      const kingdomArtifacts = (await angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).where('assignment', '==', AssignmentType.ATTACK).limit(1).get()).docs.map(artifact => ({ ...artifact.data(), fid: artifact.id }));
      const kingdomCharms = (await angularFirestore.collection(`kingdoms/${kingdomId}/charms`).where('assignment', '==', AssignmentType.ATTACK).limit(1).get()).docs.map(charm => ({ ...charm.data(), fid: charm.id }));
      const questContracts = (await angularFirestore.collection(`quests/${questId}/contracts`).where('assignment', '==', AssignmentType.DEFENSE).limit(1).get()).docs.map(contract => ({ ...contract.data(), fid: contract.id }));
      const questTroops = (await angularFirestore.collection(`quests/${questId}/troops`).where('assignment', '==', AssignmentType.DEFENSE).orderBy('sort', 'asc').limit(3).get()).docs.map(troop => ({ ...troop.data(), fid: troop.id, initialQuantity: troop.data().quantity }));
      const questArtifact = (await angularFirestore.collection(`quests/${questId}/artifacts`).where('assignment', '==', AssignmentType.NONE).limit(1).get()).docs[0].data();
      if (kingdomTroops.length && questTroops.length) {
        let report: BattleReport = {
          attackerPowerLost: 0,
          defenderPowerLost: 0,
          victory: false,
          logs: [],
        };
        const batch = angularFirestore.batch();
        await resolveBattle(kingdomContracts, kingdomTroops, kingdomArtifacts, kingdomCharms, questContracts, questTroops, [], [], BattleType.ADVENTURE, report, kingdomId, batch, undefined, questId);
        await addSupply(kingdomId, 'turn', -worldQuest.turns, batch);
        const data: any = {
          logs: report.logs,
        };
        if (report.victory) {
          data.item = questArtifact.item;
          data.quantity = questArtifact.quantity;
          await addArtifact(kingdomId, questArtifact.item, questArtifact.quantity, batch);
          await checkQuest(questId);
        }
        const from = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
        await addLetter(kingdomId, 'world.adventure.subject', report.victory ? 'world.adventure.victory' : 'world.adventure.defeat', from, batch, data);
        await batch.commit();
      } else throw new Error('api.error.adventure');
    } else throw new Error('api.error.adventure');
  } else throw new Error('api.error.adventure');
}

//========================================================================================
/*                                                                                      *
 *                                        BATTLES                                       *
 *                                                                                      */
//========================================================================================

/**
 * applies an artifact over a target
 * @param artifact
 * @param targets
 * @param targetType
 * @param balance
 */
const applyArtifact = (artifact: any, targets: any[], targetType: TargetType, report: BattleReport) => {
  // skills
  if (artifact.item.skills.length) {
    if (artifact.item.multiple) {
      targets.forEach(troop => {
        artifact.item.skills.forEach((skill: any) => {
          if (!troop.unit.skills.find((ski: any) => ski.id === skill.id)) {
            troop.unit.skills.push(skill);
          }
        });
      });
    } else {
      const randomIndex = random(0, targets.length - 1);
      artifact.item.skills.forEach((skill: any) => {
        if (!targets[randomIndex].unit.skills.find((ski: any) => ski.id === skill.id)) {
          targets[randomIndex].unit.skills.push(skill);
        }
      });
    }
  }
  // resistances
  if (artifact.item.resistances.length) {
    if (artifact.item.multiple) {
      targets.forEach(troop => {
        artifact.item.resistances.forEach((resistance: any) => {
          if (!troop.unit.resistances.find((res: any) => res.id === resistance.id)) {
            troop.unit.resistances.push(resistance);
          }
        });
      });
    } else {
      const randomIndex = random(0, targets.length - 1);
      artifact.item.resistances.forEach((resistance: any) => {
        if (!targets[randomIndex].unit.resistances.find((res: any) => res.id === resistance.id)) {
          targets[randomIndex].unit.resistances.push(resistance);
        }
      });
    }
  }
  // damage
  if (artifact.item.categories.length && artifact.item.amount.length) {
    const damage = random(Math.min(...artifact.item.amount), Math.max(...artifact.item.amount));
    let powerLost = 0;
    if (artifact.item.multiple) {
      targets.forEach(troop => {
        const casualties = Math.max(0, Math.min(troop.quantity, Math.floor((damage - troop.unit.defense * troop.quantity) / troop.unit.health)));
        troop.quantity -= casualties;
        powerLost = casualties * troop.unit.power;
      });
    } else {
      const randomIndex = random(0, targets.length - 1);
      const casualties = Math.max(0, Math.min(targets[randomIndex].quantity, Math.floor((damage - targets[randomIndex].unit.defense * targets[randomIndex].quantity) / targets[randomIndex].unit.health)));
      targets[randomIndex].quantity -= casualties;
      powerLost = casualties * targets[randomIndex].unit.power;
    }
    if (targetType === TargetType.ATTACKER) {
      report.attackerPowerLost += powerLost;
    } else {
      report.defenderPowerLost += powerLost;
    }
  }
}

/**
 * applies artifacts in battle
 * @param attackerTroops
 * @param attackerArtifacts
 * @param defenderTroops
 * @param defenderArtifacts
 * @param report
 */
export const applyArtifacts = (
  attackerTroops: any[],
  attackerArtifacts: any[],
  defenderTroops: any[],
  defenderArtifacts: any[],
  report: BattleReport,
) => {
  attackerArtifacts.forEach((artifact: any) => {
    if (artifact.item.battle) {
      const success = random(0, 100) <= 100;
      if (success) {
        if (artifact.item.self) applyArtifact(artifact, attackerTroops, TargetType.ATTACKER, report);
        else applyArtifact(artifact, defenderTroops, TargetType.DEFENDER, report);
      }
      report.logs.push({
        attackerArtifact: artifact,
        success: success,
      });
    }
  });
  defenderArtifacts.forEach((artifact: any) => {
    if (artifact.item.battle) {
      const success = random(0, 100) <= 100;
      if (success) {
        if (artifact.item.self) applyArtifact(artifact, defenderTroops, TargetType.DEFENDER, report);
        else applyArtifact(artifact, attackerTroops, TargetType.ATTACKER, report);
      }
      report.logs.push({
        defenderArtifact: artifact,
        success: success,
      });
    }
  });
}

/**
 * applies a charm on a target
 * @param charm
 * @param targets
 * @param targetType
 * @param report
 */
const applyCharm = (charm: any, targets: any[], targetType: TargetType, report: BattleReport) => {
  // skills
  if (charm.spell.skills.length) {
    if (charm.spell.multiple) {
      targets.forEach(troop => {
        charm.spell.skills.forEach((skill: any) => {
          if (!charm.spell.removes) {
            if (!troop.unit.skills.find((ski: any) => ski.id === skill.id)) {
              troop.unit.skills.push(skill);
            }
          } else {
            if (troop.unit.skills.find((ski: any) => ski.id === skill.id)) {
              troop.unit.skills.splice(troop.unit.skills.findIndex((ski: any) => ski.id === skill.id), 1);
            }
          }
        });
      });
    } else {
      const randomIndex = random(0, targets.length - 1);
      charm.spell.skills.forEach((skill: any) => {
        if (!charm.spell.removes) {
          if (!targets[randomIndex].unit.skills.find((ski: any) => ski.id === skill.id)) {
            targets[randomIndex].unit.skills.push(skill);
          }
        } else {
          if (targets[randomIndex].unit.skills.find((ski: any) => ski.id === skill.id)) {
            targets[randomIndex].unit.skills.splice(targets[randomIndex].unit.skills.findIndex((ski: any) => ski.id === skill.id), 1);
          }
        }
      });
    }
  }
  // resistances
  if (charm.spell.resistances.length) {
    if (charm.spell.multiple) {
      targets.forEach(troop => {
        charm.spell.resistances.forEach((resistance: any) => {
          if (!troop.unit.resistances.find((res: any) => res.id === resistance.id)) {
            troop.unit.resistances.push(resistance);
          }
        });
      });
    } else {
      const randomIndex = random(0, targets.length - 1);
      charm.spell.resistances.forEach((resistance: any) => {
        if (!targets[randomIndex].unit.resistances.find((res: any) => res.id === resistance.id)) {
          targets[randomIndex].unit.resistances.push(resistance);
        }
      });
    }
  }
  // damage
  if (charm.spell.categories.length && charm.spell.amount.length) {
    const damage = random(Math.min(...charm.spell.amount), Math.max(...charm.spell.amount));
    let powerLost = 0;
    if (charm.spell.multiple) {
      targets.forEach(troop => {
        const casualties = Math.max(0, Math.min(troop.quantity, Math.floor((damage - troop.unit.defense * troop.quantity) / troop.unit.health)));
        troop.quantity -= casualties;
        powerLost = casualties * troop.unit.power;
      });
    } else {
      const randomIndex = random(0, targets.length - 1);
      const casualties = Math.max(0, Math.min(targets[randomIndex].quantity, Math.floor((damage - targets[randomIndex].unit.defense * targets[randomIndex].quantity) / targets[randomIndex].unit.health)));
      targets[randomIndex].quantity -= casualties;
      powerLost = casualties * targets[randomIndex].unit.power;
    }
    if (targetType === TargetType.ATTACKER) {
      report.attackerPowerLost += powerLost;
    } else {
      report.defenderPowerLost += powerLost;
    }
  }
}

/**
 * applies charms in battle
 * @param attackerTroops
 * @param attackerCharms
 * @param defenderTroops
 * @param defenderCharms
 * @param report
 */
export const applyCharms = (
  attackerTroops: any[],
  attackerCharms: any[],
  defenderTroops: any[],
  defenderCharms: any[],
  report: BattleReport,
) => {
  attackerCharms.forEach((charm: any) => {
    if (charm.spell.battle) {
      const success = random(0, 100) <= 100;
      if (success) {
        if (charm.spell.self) applyCharm(charm, attackerTroops, TargetType.ATTACKER, report);
        else applyCharm(charm, defenderTroops, TargetType.DEFENDER, report);
      }
      report.logs.push({
        attackerCharm: charm,
        success: success,
      });
    }
  });
  defenderCharms.forEach((charm: any) => {
    if (charm.spell.battle) {
      const success = random(0, 100) <= 100;
      if (success) {
        if (charm.spell.self) applyCharm(charm, defenderTroops, TargetType.DEFENDER, report);
        else applyCharm(charm, attackerTroops, TargetType.ATTACKER, report);
      }
      report.logs.push({
        defenderCharm: charm,
        success: success,
      });
    }
  });
}

/**
 * applies a contract over targets
 * @param contract
 * @param targets
 * @param targetType
 * @param report
 */
const applyContract = (contract: any, targets: any[], targetType: TargetType, report: BattleReport) => {
  if (contract.hero.self) {
    // bonuses
    if (contract.hero.families.length) {
      contract.hero.families.forEach((family: any) => {
        targets.forEach(target => {
          target.unit.families.forEach((f: any) => {
            if (family.id === f.id) {
              target.unit.attackBonus = (target.unit.attackBonus || 0) + contract.hero.attackBonus * contract.level;
              target.unit.defenseBonus = (target.unit.defenseBonus || 0) + contract.hero.defenseBonus * contract.level;
              target.unit.healthBonus = (target.unit.healthBonus || 0) + contract.hero.healthBonus * contract.level;
            }
          });
        });
      });
      report.logs.push({
        defenderContract: JSON.parse(JSON.stringify(contract)),
      });
    }
  } else {
    // damage
    if (contract.hero.multiple) {
      let powerLost = 0;
      let totalCasualties = 0;
      const attackerCategory = contract.hero.categories[0];
      let damage = contract.hero.attack * contract.level;
      targets.forEach(defenderTroop => {
        // damage
        if (contract.hero.faction.opposites.find((faction: any) => faction.id === defenderTroop.unit.faction.id)) {
          damage *= FACTION_MULTIPLIER;
        }
        // resistance
        const defenderResistance = defenderTroop.unit.resistances.find((resistance: any) => resistance.id === attackerCategory.id);
        const property = attackerCategory.id + 'Resistance';
        const reduction = defenderResistance && defenderResistance.hasOwnProperty(property) ? defenderResistance[property] : 0;
        damage *= (100 - reduction) / 100;
        // casualties
        const targetCasualties = Math.max(0, Math.min(defenderTroop.quantity, Math.floor((damage - defenderTroop.unit.defense * defenderTroop.quantity) / defenderTroop.unit.health)));
        defenderTroop.quantity -= targetCasualties;
        totalCasualties += targetCasualties;
        powerLost += targetCasualties * defenderTroop.unit.power
      });
      if (targetType === TargetType.ATTACKER) {
        report.attackerPowerLost += powerLost;
      } else {
        report.defenderPowerLost += powerLost;
      }
      report.logs.push({
        defenderContract: JSON.parse(JSON.stringify(contract)),
        totalCasualties: totalCasualties,
      });
    }
  }
}

/**
 * applies contracts in battle
 * @param attackerTroops
 * @param attackerContracts
 * @param defenderTroops
 * @param defenderContracts
 * @param report
 */
export const applyContracts = (
  attackerTroops: any[],
  attackerContracts: any[],
  defenderTroops: any[],
  defenderContracts: any[],
  report: BattleReport,
) => {
  attackerContracts.forEach((contract: any) => {
    if (contract.hero.battle) {
      if (contract.hero.self) applyContract(contract, attackerTroops, TargetType.ATTACKER, report);
      else applyContract(contract, defenderTroops, TargetType.DEFENDER, report);
    }
  });
  defenderContracts.forEach((contract: any) => {
    if (contract.hero.battle) {
      if (contract.hero.self) applyContract(contract, defenderTroops, TargetType.DEFENDER, report);
      else applyContract(contract, attackerTroops, TargetType.ATTACKER, report);
    }
  });
}

/**
 * applies bonuses
 * @param troops
 */
const applyBonus = (
  troop: any,
) => {
  // skills
  troop.unit.skills.forEach((skill: any) => {
    troop.unit.attackBonus = (troop.unit.attackBonus || 0) + skill.attackBonus;
    troop.unit.defenseBonus = (troop.unit.defenseBonus || 0) + skill.defenseBonus;
    troop.unit.healthBonus = (troop.unit.healthBonus || 0) + skill.healthBonus;
    troop.unit.initiativeBonus = (troop.unit.initiativeBonus || 0) + skill.initiativeBonus;
  });
  // categories
  troop.unit.categories.forEach((category: any) => {
    // TODO
  });
  // resistances
  troop.unit.resistances.forEach((category: any) => {
    troop.unit.meleeResistance = (troop.unit.meleeResistance || 0) + category.meleeResistance;
    troop.unit.rangedResistance = (troop.unit.rangedResistance || 0) + category.rangedResistance;
    troop.unit.magicResistance = (troop.unit.magicResistance || 0) + category.magicResistance;
    troop.unit.psychicResistance = (troop.unit.psychicResistance || 0) + category.psychicResistance;
    troop.unit.breathResistance = (troop.unit.breathResistance || 0) + category.breathResistance;
    troop.unit.fireResistance = (troop.unit.fireResistance || 0) + category.fireResistance;
    troop.unit.poisonResistance = (troop.unit.poisonResistance || 0) + category.poisonResistance;
    troop.unit.coldResistance = (troop.unit.coldResistance || 0) + category.coldResistance;
    troop.unit.lightningResistance = (troop.unit.lightningResistance || 0) + category.lightningResistance;
    troop.unit.holyResistance = (troop.unit.holyResistance || 0) + category.holyResistance;
  });
}

/**
 * applies bonuses over troops
 * @param attackerTroops
 * @param defenderTroops
 * @param report
 */
export const applyBonuses = (
  attackerTroops: any[],
  defenderTroops: any[],
) => {
  attackerTroops.forEach((troop: any) => {
    applyBonus(troop);
  });
  defenderTroops.forEach((troop: any) => {
    applyBonus(troop);
  });
}

/**
 * applies category vs resitances to a troop
 * @param attackerTroop
 * @param defenderTroop
 */
export const applyDamage = (
  attackerTroop: any,
  defenderTroop: any,
  attackerCategory: any,
): number => {
  // category
  switch (attackerCategory.id) {
    case 'lightning':
      defenderTroop.unit.initiativeBonus += attackerCategory.initiativeBonus;
      break;
    case 'fire':
      attackerTroop.unit.attackWave *= ((100 + attackerCategory.attackBonus) / 100);
      break;
    case 'cold':
      defenderTroop.unit.attackWave *= ((100 + attackerCategory.attackBonus) / 100);
      break;
    case 'holy':
      attackerTroop.unit.healthWave *= ((100 + attackerCategory.healthBonus) / 100);
      break;
    case 'poison':
      defenderTroop.unit.healthWave *= ((100 + attackerCategory.healthBonus) / 100);
      break;
    case 'breath':
      defenderTroop.unit.defenseWave *= ((100 + attackerCategory.defenseBonus) / 100);
      break;
  }
  // factions
  if (attackerTroop.unit.faction.opposites.find((faction: any) => faction.id === defenderTroop.unit.faction.id)) {
    attackerTroop.unit.attackWave *= FACTION_MULTIPLIER;
  }
  // resistance
  const defenderResistance = defenderTroop.unit.resistances.find((resistance: any) => resistance.id === attackerCategory.id);
  const property = attackerCategory.id + 'Resistance';
  const reduction = defenderResistance && defenderResistance.hasOwnProperty(property) ? defenderResistance[property] : 0;
  const damage = attackerTroop.unit.attackWave * (100 - reduction) / 100;
  return damage;
}

/**
 * applies damage to a troop
 * @param attackerTroop
 * @param defenderTroop
 * @param damage
 */
export const applyCasualties = (
  attackerTroop: any,
  defenderTroop: any,
  damage: number,
) => {
  const casualties = Math.max(0, Math.min(defenderTroop.quantity, Math.floor((damage * attackerTroop.quantity - defenderTroop.unit.defenseWave * defenderTroop.quantity) / defenderTroop.unit.healthWave)));
  return casualties;
}

/**
 * fights a wave in battle
 * @param attackerTroop
 * @param defenderTroop
 * @param report
 * @param battleType
 */
export const applyWave = (
  attackerTroop: any,
  defenderTroop: any,
  report: BattleReport,
  battleType: BattleType,
) => {
  // variables
  let attackerCategory = null;
  let defenderQuantity = null;
  let attackerDamage = null;
  let defenderCasualties = null;
  let defenderCategory = null;
  let attackerQuantity = null;
  let defenderDamage = null;
  let attackerCasualties = null;
  let direction = null;
  // attacker statistics
  attackerTroop.unit.attackWave = attackerTroop.unit.attack * ((100 + (attackerTroop.unit.attackBonus || 0)) / 100);
  attackerTroop.unit.defenseWave = attackerTroop.unit.defense * ((100 + (attackerTroop.unit.defenseBonus || 0)) / 100);
  attackerTroop.unit.healthWave = attackerTroop.unit.health * ((100 + (attackerTroop.unit.healthBonus || 0)) / 100);
  attackerTroop.unit.initiativeWave = attackerTroop.unit.initiative + (attackerTroop.unit.initiativeBonus || 0);
  // defender statistics
  defenderTroop.unit.attackWave = defenderTroop.unit.attack * ((100 + (defenderTroop.unit.attackBonus || 0)) / 100);
  defenderTroop.unit.defenseWave = defenderTroop.unit.defense * ((100 + (defenderTroop.unit.defenseBonus || 0)) / 100);
  defenderTroop.unit.healthWave = defenderTroop.unit.health * ((100 + (defenderTroop.unit.healthBonus || 0)) / 100);
  defenderTroop.unit.initiativeWave = defenderTroop.unit.initiative + (defenderTroop.unit.initiativeBonus || 0);
  // initiative check
  if (attackerTroop.unit.initiativeWave >= (defenderTroop.unit.initiativeWave + (battleType === BattleType.SIEGE ? 1 : 0))) {
    direction = 'attacker-vs-defender';
    // attacker attacks defender
    attackerCategory = attackerTroop.unit.categories[random(0, attackerTroop.unit.categories.length - 1)];
    defenderQuantity = defenderTroop.quantity;
    attackerDamage = applyDamage(attackerTroop, defenderTroop, attackerCategory);
    defenderCasualties = applyCasualties(attackerTroop, defenderTroop, attackerDamage);
    defenderTroop.quantity -= defenderCasualties;
    report.defenderPowerLost += defenderCasualties * defenderTroop.unit.power;
    // defender counterattacks attacker
    defenderCategory = defenderTroop.unit.categories[random(0, defenderTroop.unit.categories.length - 1)];
    attackerQuantity = attackerTroop.quantity;
    defenderDamage = applyDamage(defenderTroop, attackerTroop, defenderCategory);
    attackerCasualties = applyCasualties(defenderTroop, attackerTroop, defenderDamage);
    attackerTroop.quantity -= attackerCasualties;
    report.attackerPowerLost += attackerCasualties * attackerTroop.unit.power;
  } else {
    direction = 'defender-vs-attacker';
    // defender attacks attacker
    defenderCategory = defenderTroop.unit.categories[random(0, defenderTroop.unit.categories.length - 1)];
    attackerQuantity = attackerTroop.quantity;
    defenderDamage = applyDamage(defenderTroop, attackerTroop, defenderCategory);
    attackerCasualties = applyCasualties(defenderTroop, attackerTroop, defenderDamage);
    attackerTroop.quantity -= attackerCasualties;
    report.attackerPowerLost += attackerCasualties * attackerTroop.unit.power;
    // attacker counterattacks defender
    attackerCategory = attackerTroop.unit.categories[random(0, attackerTroop.unit.categories.length - 1)];
    defenderQuantity = defenderTroop.quantity;
    attackerDamage = applyDamage(attackerTroop, defenderTroop, attackerCategory);
    defenderCasualties = applyCasualties(attackerTroop, defenderTroop, attackerDamage);
    defenderTroop.quantity -= defenderCasualties;
    report.defenderPowerLost += defenderCasualties * defenderTroop.unit.power;
  }
  // log
  report.logs.push({
    attackerTroop: JSON.parse(JSON.stringify(attackerTroop)),
    attackerCategory: attackerCategory,
    attackerDamage: attackerDamage,
    attackerQuantity: attackerQuantity,
    attackerCasualties: attackerCasualties,
    defenderTroop: JSON.parse(JSON.stringify(defenderTroop)),
    defenderCategory: defenderCategory,
    defenderDamage: defenderDamage,
    defenderQuantity: defenderQuantity,
    defenderCasualties: defenderCasualties,
    direction: direction,
  });
}

/**
 * applies waves over battle
 * @param attackerTroops
 * @param defenderTroops
 * @param battleType
 * @param report
 * @param attackerId
 * @param batch
 * @param defenderId
 * @param questId
 */
export const applyWaves = async (
  attackerTroops: any[],
  defenderTroops: any[],
  battleType: BattleType,
  report: BattleReport,
  attackerId?: string | undefined,
  batch?: FirebaseFirestore.WriteBatch | undefined,
  defenderId?: string | undefined,
  questId?: string | undefined,
) => {
  const rounds = Math.min(Math.max(attackerTroops.length, defenderTroops.length), BATTLE_ROUNDS);
  let attackerIndex = 0;
  let defenderIndex = 0;
  // waves
  for (const _round of new Array(rounds)) {
    // troops
    const attackerTroop = attackerTroops[attackerIndex];
    const defenderTroop = defenderTroops[defenderIndex];
    attackerTroop.initialQuantity = attackerTroop.quantity;
    attackerTroop.initialQuantity = attackerTroop.quantity;
    // wave
    const attackerQuantity = attackerTroop.quantity;
    const defenderQuantity = attackerTroop.quantity;
    applyWave(attackerTroop, defenderTroop, report, battleType);
    const attackerCasualties = attackerQuantity - attackerTroop.quantity;
    const defenderCasualties = defenderQuantity - defenderTroop.quantity;
    // updates
    if (batch) {
      if (attackerCasualties > 0) {
        if (attackerId) await removeTroop(attackerId, attackerTroop.fid, attackerCasualties, batch);
      }
      if (defenderCasualties > 0) {
        if (defenderId) await removeTroop(defenderId, defenderTroop.fid, defenderCasualties, batch);
        else if (attackerId) await removeTroop(attackerId, defenderTroop.fid, defenderCasualties, batch, questId);
      }
    }
    // deaths
    if (attackerTroop.quantity <= 0) attackerTroops.splice(attackerIndex, 1);
    if (defenderTroop.quantity <= 0) defenderTroops.splice(defenderIndex, 1);
    // next round
    attackerIndex = attackerTroops[attackerIndex + 1] !== undefined ? attackerIndex + 1 : random(0, attackerTroops.length - 1);
    defenderIndex = defenderTroops[defenderIndex + 1] !== undefined ? defenderIndex + 1 : random(0, defenderTroops.length - 1);
    if (attackerTroops[attackerIndex] === undefined || defenderTroops[defenderIndex] === undefined) break;
  }
}

/**
 * resolves a battle
 * @param attackerTroops
 * @param defenderArmy
 * @param batch
 */
export const resolveBattle = async (
  attackerContracts: any[],
  attackerTroops: any[],
  attackerArtifacts: any[],
  attackerCharms: any[],
  defenderContracts: any[],
  defenderTroops: any[],
  defenderArtifacts: any[],
  defenderCharms: any[],
  battleType: BattleType,
  report: BattleReport,
  attackerId?: string | undefined,
  batch?: FirebaseFirestore.WriteBatch | undefined,
  defenderId?: string | undefined,
  questId?: string | undefined,
): Promise<any> => {
  let discovered = true;
  if (defenderId) {
    discovered = random(0, 100) <= 100;
  }
  if (defenderTroops.length <= 0 || (battleType === BattleType.PILLAGE && !discovered)) {
    report.victory = true; // pillage undetected, instant victory
  } else {
    // artifacts
    await applyArtifacts(attackerTroops, attackerArtifacts, defenderTroops, defenderArtifacts, report);
    // charms
    await applyCharms(attackerTroops, attackerCharms, defenderTroops, defenderCharms, report);
    // contracts
    await applyContracts(attackerTroops, attackerContracts, defenderTroops, defenderContracts, report);
    // skills
    await applyBonuses(attackerTroops, defenderTroops);
    // waves
    await applyWaves(attackerTroops, defenderTroops, battleType, report, attackerId, batch, defenderId, questId);
    // victory conditions
    switch (battleType) {
      case BattleType.PILLAGE:
        // pillage is a normal attack if detected
      case BattleType.ATTACK:
        report.victory = attackerTroops.length > 0 // if attacker still has an army
          ? defenderTroops.length > 0 // if defender still has an army
            ? report.defenderPowerLost > report.attackerPowerLost * (1 + (BATTLE_POWER / 100)) // if defender loses more power than attacker by X%
            : true
          : false;
        break;
      case BattleType.SIEGE:
        // TODO
        report.victory = false;
        break;
      case BattleType.ADVENTURE:
        report.victory = attackerTroops.length > 0 && defenderTroops.length === 0; // if attacker obliterates defender
        break;
    }
  }
  return report.victory;
}

/**
 * kingdom attacks another kingdom with a battle type
 * @param kingdomId
 * @param targetId
 * @param battleId
 */
const battleKingdom = async (kingdomId: string, battleId: BattleType, targetId: string) => {
  // TODO
}

//========================================================================================
/*                                                                                      *
 *                                       AUCTIONS                                       *
 *                                                                                      */
//========================================================================================

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
      batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.ARTIFACT, item: item, quantity: random(1, 2), gold: 1000000, auctioned: auctioned, kingdom: 'wS6oK6Epj3XvavWFtngLZkgFx263' });
      break;
    case AuctionType.CHARM:
      const spell = (await angularFirestore.collection('spells').where('random', '==', random(0, 99)).limit(1).get()).docs[0].data();
      batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.CHARM, spell: spell, gold: 1000000, auctioned: auctioned, kingdom: 'wS6oK6Epj3XvavWFtngLZkgFx263' });
      break;
    case AuctionType.CONTRACT:
      const hero = (await angularFirestore.collection('heroes').where('random', '==', random(0, 19)).limit(1).get()).docs[0].data();
      batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.CONTRACT, hero: hero, level: random(1, 10), gold: 1000000, auctioned: auctioned, kingdom: 'wS6oK6Epj3XvavWFtngLZkgFx263' });
      break;
    case AuctionType.TROOP:
      const unit = (await angularFirestore.collection('units').where('random', '==', random(0, 64)).limit(1).get()).docs[0].data();
      batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.TROOP, unit: unit, quantity: random(Math.min(...unit.amount), Math.max(...unit.amount)), gold: 1000000, auctioned: auctioned, kingdom: 'wS6oK6Epj3XvavWFtngLZkgFx263' });
      break;
  }
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

//========================================================================================
/*                                                                                      *
 *                                         GODS                                         *
 *                                                                                      */
//========================================================================================

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

//========================================================================================
/*                                                                                      *
 *                                     ENCHANTMENTS                                     *
 *                                                                                      */
//========================================================================================

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
    batch.update(angularFirestore.doc(`kingdoms/${originId}/incantations/${kingdomEnchantment.docs[0].id}`), { turns: admin.firestore.FieldValue.increment(turns) });
  } else {
    const id = angularFirestore.collection(`kingdoms/${originId}/incantations`).doc().id;
    const kingdomTarget = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
    batch.create(angularFirestore.collection(`kingdoms/${originId}/incantations`).doc(id), { id: enchantment.id, spell: enchantment, to: kingdomTarget, turns: turns });
    const kingdomOrigin = (await angularFirestore.doc(`kingdoms/${originId}`).get()).data();
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/enchantments`).doc(id), { id: enchantment.id, spell: enchantment, from: kingdomOrigin, turns: turns });
    // origin
    await balanceSupply(originId, SupplyType.GOLD, -enchantment.goldMaintenance, batch);
    await balanceSupply(originId, SupplyType.MANA, -enchantment.manaMaintenance, batch);
    await balanceSupply(originId, SupplyType.POPULATION, -enchantment.populationMaintenance, batch);
    // target
    await balanceSupply(kingdomId, SupplyType.GOLD, enchantment.goldProduction, batch);
    await balanceSupply(kingdomId, SupplyType.MANA, enchantment.manaProduction, batch);
    await balanceSupply(kingdomId, SupplyType.POPULATION, enchantment.populationProduction, batch);
    await balanceBonus(kingdomId, BonusType.EXPLORE, enchantment.landProduction, batch);
    await balanceBonus(kingdomId, BonusType.BUILD, enchantment.buildBonus, batch);
    await balanceBonus(kingdomId, BonusType.RESEARCH, enchantment.researchBonus, batch);
  }
}

/**
 * tries to dispel an incantation owned by the kingdom
 * @param kingdomId
 * @param enchantmentId
 */
const dispelIncantation = async (kingdomId: string, enchantmentId: string) => {
  const batch = angularFirestore.batch();
  const response = await removeEnchantment(kingdomId, enchantmentId, batch);
  await batch.commit();
  return response;
}

/**
 * removes an enchantment
 * @param kingdomId
 * @param enchantmentId
 */
const removeEnchantment = async (kingdomId: string, enchantmentId: string, batch: FirebaseFirestore.WriteBatch) => {
  const kingdomEnchantment = (await angularFirestore.doc(`kingdoms/${kingdomId}/enchantments/${enchantmentId}`).get()).data();
  if (kingdomEnchantment) {
    // origin
    batch.delete(angularFirestore.doc(`kingdoms/${kingdomEnchantment.from.id}/incantations/${enchantmentId}`));
    await balanceSupply(kingdomEnchantment.from.id, SupplyType.GOLD, kingdomEnchantment.spell.goldMaintenance, batch);
    await balanceSupply(kingdomEnchantment.from.id, SupplyType.MANA, kingdomEnchantment.spell.manaMaintenance, batch);
    await balanceSupply(kingdomEnchantment.from.id, SupplyType.POPULATION, kingdomEnchantment.spell.populationMaintenance, batch);
    // target
    batch.delete(angularFirestore.doc(`kingdoms/${kingdomId}/enchantments/${enchantmentId}`));
    await balanceSupply(kingdomId, SupplyType.GOLD, -kingdomEnchantment.spell.goldProduction, batch);
    await balanceSupply(kingdomId, SupplyType.MANA, -kingdomEnchantment.spell.manaProduction, batch);
    await balanceSupply(kingdomId, SupplyType.POPULATION, -kingdomEnchantment.spell.populationProduction, batch);
    await balanceBonus(kingdomId, BonusType.EXPLORE, -kingdomEnchantment.spell.landProduction, batch);
    await balanceBonus(kingdomId, BonusType.BUILD, -kingdomEnchantment.spell.buildBonus, batch);
    await balanceBonus(kingdomId, BonusType.RESEARCH, -kingdomEnchantment.spell.researchBonus, batch);
    return { success: true };
  } else throw new Error('api.error.dispel');
}

/**
 * tries to break an enchantment not owned by the kingdom
 * @param kingdomId
 * @param enchantmentId
 */
const breakEnchantment = async (kingdomId: string, enchantmentId: string) => {
  const kingdomEnchantment = (await angularFirestore.doc(`kingdoms/${kingdomId}/enchantments/${enchantmentId}`).get()).data();
  if (kingdomEnchantment) {
    const kingdomMana = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'mana').limit(1).get()).docs[0].data();
    const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
    kingdomTurn.quantity = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
    if (kingdomEnchantment.spell.manaCost * 2 <= kingdomMana.quantity && kingdomEnchantment.spell.turnCost * 2 <= kingdomTurn.quantity) {
      // const kingdomOrigin = (await angularFirestore.doc(`kingdoms/${kingdomEnchantment.from}`).get()).data();
      // const kingdomTarget = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
      const chance = 100;
      if (random(0,100) <= chance) {
        const batch = angularFirestore.batch();
        // origin
        batch.delete(angularFirestore.doc(`kingdoms/${kingdomEnchantment.from.id}/incantations/${enchantmentId}`));
        await balanceSupply(kingdomEnchantment.from.id, SupplyType.GOLD, kingdomEnchantment.spell.goldMaintenance, batch);
        await balanceSupply(kingdomEnchantment.from.id, SupplyType.MANA, kingdomEnchantment.spell.manaMaintenance, batch);
        await balanceSupply(kingdomEnchantment.from.id, SupplyType.POPULATION, kingdomEnchantment.spell.populationMaintenance, batch);
        // target
        batch.delete(angularFirestore.doc(`kingdoms/${kingdomId}/enchantments/${enchantmentId}`));
        await balanceSupply(kingdomId, SupplyType.GOLD, -kingdomEnchantment.spell.goldProduction, batch);
        await balanceSupply(kingdomId, SupplyType.MANA, -kingdomEnchantment.spell.manaProduction, batch);
        await balanceSupply(kingdomId, SupplyType.POPULATION, -kingdomEnchantment.spell.populationProduction, batch);
        await balanceBonus(kingdomId, BonusType.EXPLORE, -kingdomEnchantment.spell.landProduction, batch);
        await balanceBonus(kingdomId, BonusType.BUILD, -kingdomEnchantment.spell.buildBonus, batch);
        await balanceBonus(kingdomId, BonusType.RESEARCH, -kingdomEnchantment.spell.researchBonus, batch);
        await batch.commit();
        return { success: true };
      } else {
        return { success: false };
      }
    } else throw new Error('api.error.break');
  } else throw new Error('api.error.break');
}

//========================================================================================
/*                                                                                      *
 *                                         CLANS                                        *
 *                                                                                      */
//========================================================================================

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

//========================================================================================
/*                                                                                      *
 *                                        GUILDS                                        *
 *                                                                                      */
//========================================================================================

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
