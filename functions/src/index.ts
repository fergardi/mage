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

const resources = ['gold', 'mana', 'population', 'land', 'turn'];
const structures = ['barrier', 'farm', 'fortress', 'academy', 'node', 'village', 'workshop'];
const spells = ['animate-skeleton', 'animate-zombie', 'animate-ghoul', 'vampirism', 'terror', 'night-living-dead', 'necromancy', 'summon-wraith', 'summon-lich', 'summon-vampire', 'death-decay', 'shroud-darkness', 'corruption', 'soul-pact', 'chain-lightning', 'full-moon', 'witchcraft', 'plague', 'curse', 'blood-ritual', 'fireball', 'battle-chant', 'call-berserker', 'call-orc', 'succubus-kiss', 'destroy-artifact', 'inferno', 'flame-shield', 'flame-blade', 'flame-arrow', 'gravity', 'meteor-storm', 'fatigue', 'summon-minotaur', 'summon-ogre', 'summon-lizardman', 'call-cyclop', 'volcano', 'fire-wall', 'frenzy', 'call-frost-giant', 'call-cave-troll', 'call-yeti', 'summon-mage', 'summon-medusa', 'summon-djinni', 'concentration', 'confuse', 'conjure-elemental', 'levitation', 'fog', 'avarice', 'hallucination', 'freeze', 'ice-wall', 'invisibility', 'laziness', 'celerity', 'spy', 'steal-artifact', 'accuracy', 'ambush', 'druidism', 'beast-council', 'call-giant-snail', 'call-carnivorous-plant', 'call-centaur', 'climate-control', 'cure', 'growth', 'locust-swarm', 'natures-favor', 'invigorate', 'calm', 'serenity', 'venom', 'summon-goblin', 'summon-werebear', 'summon-spider', 'sunray', 'wrath', 'call-pegasus', 'call-knight', 'call-templar', 'blaze', 'prayer', 'healing', 'divine-protection', 'exorcism', 'endurance', 'locate-artifact', 'miracle', 'peace-prosperity', 'resurrection', 'shield-light', 'summon-angel', 'summon-titan', 'summon-monk', 'sword-light', 'tranquility'];
const enchantments = ['death-decay', 'shroud-darkness', 'soul-pact', 'plague', 'blood-ritual', 'meteor-storm', 'fire-wall', 'concentration', 'confuse', 'ice-wall', 'laziness', 'druidism', 'climate-control', 'locust-swarm', 'natures-favor', 'sunray', 'divine-protection', 'peace-prosperity'];
const units = ['lightning-elemental', 'wraith', 'bone-dragon', 'nightmare', 'ghoul', 'lich', 'skeleton', 'vampire', 'werewolf', 'zombie', 'blue-dragon', 'crystal-golem', 'djinni', 'frost-giant', 'ice-elemental', 'cave-troll', 'medusa', 'leviathan', 'mage', 'yeti', 'lizardman', 'giant-snail', 'centaur', 'goblin', 'golden-dragon', 'werebear', 'spider', 'carnivorous-plant', 'earth-elemental', 'hydra', 'cyclop', 'minotaur', 'devil', 'fire-elemental', 'berserker', 'ogre', 'orc', 'phoenix', 'red-dragon', 'griffon', 'behemoth', 'white-dragon', 'angel', 'knight', 'light-elemental', 'titan', 'monk', 'templar', 'pegasus', 'paladin', 'cavalry', 'fanatic', 'pikeman', 'fighter', 'archer', 'frog', 'sheep', 'bat', 'rat', 'imp', 'trained-elephant', 'wolf', 'iron-golem', 'stone-golem', 'baby-dragon'];
const items = ['treasure-chest', 'necronomicon', 'enchanted-lamp', 'wisdom-tome', 'demon-horn', 'lightning-orb', 'dragon-egg', 'crystal-ball', 'agility-potion', 'defense-potion', 'cold-orb', 'earth-orb', 'fire-orb', 'mana-potion', 'light-orb', 'strength-potion', 'love-potion', 'spider-web', 'animal-fang', 'bone-necklace', 'crown-thorns', 'voodoo-doll', 'cursed-skull', 'golden-feather', 'golden-idol', 'golem-book', 'letter-thieves', 'lucky-coin', 'lucky-horseshoe', 'lucky-paw', 'magic-beans', 'magic-compass', 'mana-vortex', 'rattle', 'rotten-food', 'snake-eye', 'treasure-map', 'valhalla-horn', 'fairy-wings', 'vampire-teeth', 'holy-grenade', 'powder-barrel', 'vial-venom', 'ancient-rune', 'ice-stone', 'fire-scroll', 'cold-scroll', 'light-scroll', 'earth-scroll', 'lightning-scroll'];
const heroes = ['dragon-rider', 'demon-prince', 'pyromancer', 'orc-king', 'commander', 'trader', 'colossus', 'engineer', 'beast-master', 'leprechaunt', 'golem-golem', 'swamp-thing', 'shaman', 'elementalist', 'sage', 'illusionist', 'necrophage', 'necromancer', 'soul-reaper', 'crypt-keeper'];

const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

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
api.get('/kingdom/:kingdomId/auction/:auctionId/bid/:gold', ash(async (req: any, res: any) => res.json(await bidAuction(req.params.kingdomId, req.params.auctionId, parseInt(req.params.gold)))));
api.get('/kingdom/:kingdomId/temple/:godId/offer/:gold', ash(async (req: any, res: any) => res.json(await offerGod(req.params.kingdomId, req.params.godId, parseInt(req.params.gold)))));
api.get('/kingdom/:kingdomId/city/:buildingId/build/:quantity', ash(async (req: any, res: any) => res.json(await buildStructure(req.params.kingdomId, req.params.buildingId, parseInt(req.params.quantity)))));
api.get('/kingdom/:kingdomId/tavern/:contractId/assign/:assignmentId', ash(async (req: any, res: any) => res.json(await assignContract(req.params.kingdomId, req.params.contractId, parseInt(req.params.assignmentId)))));
api.get('/kingdom/:kingdomId/tavern/:contractId/discharge', ash(async (req: any, res: any) => res.json(await dischargeContract(req.params.kingdomId, req.params.contractId))));
api.get('/kingdom/:kingdomId/emporium/:itemId', ash(async (req: any, res: any) => res.json(await buyEmporium(req.params.kingdomId, req.params.itemId))));
api.patch('/kingdom/:kingdomId/archive/:letterId', ash(async (req: any, res: any) => res.json(await readLetter(req.params.kingdomId, req.params.letterId))));
api.patch('/kingdom/:kingdomId/guild/:guildId', ash(async (req: any, res: any) => res.json(await favorGuild(req.params.kingdomId, req.params.guildId))));
api.delete('/kingdom/:kingdomId/archive', ash(async (req: any, res: any) => res.json(await removeLetters(req.params.kingdomId, req.body.letterIds))));
api.put('/kingdom/auction', ash(async (req: any, res: any) => res.json(await refreshAuctions())));
api.post('/world/kingdom', ash(async (req: any, res: any) => res.json(await createKingdom(req.body.kingdomId, req.body.factionId, req.body.name, parseFloat(req.body.latitude), parseFloat(req.body.longitude)))));
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
    payMaintenance(kingdomId, quantity, batch);
  } else {
    const q = s.max && (s.quantity + quantity > s.max) ? s.max : s.quantity + quantity <= 0 ? 0 : admin.firestore.FieldValue.increment(quantity);
    if (max) batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomSupply.id}`), { quantity: q, max: max });
    else batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomSupply.id}`), { quantity: q });
  }
}

/**
 * pay the maintenances if turns are spent
 * @param kingdomId
 * @param quantity
 * @param batch
 */
const payMaintenance = async (kingdomId: string, quantity: number, batch: FirebaseFirestore.WriteBatch) => {
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
  let kingdomTroop = await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).where('id', '==', unit.id).limit(1).get();
  if (kingdomTroop.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/troops/${kingdomTroop.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: unit.id, quantity: quantity, unit: unit });
  }
}

/**
 * add artifact to a kingdom
 * @param kingdomId
 * @param itemId
 * @param quantity
 * @param batch
 */
const addArtifact = async (kingdomId: string, item: any, quantity: number, batch: FirebaseFirestore.WriteBatch) => {
  let kingdomArtifact = await angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).where('id', '==', item.id).limit(1).get();
  if (kingdomArtifact.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${kingdomArtifact.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).doc(), { id: item.id, quantity: quantity, item: item });
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
  let kingdomContract = await angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).where('id', '==', hero.id).limit(1).get();
  if (kingdomContract.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${kingdomContract.docs[0].id}`), { level: admin.firestore.FieldValue.increment(level) });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).doc(), { id: hero.id, level: level, hero: hero });
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
const addEnchantment = async (kingdomId: string, enchantment: any, level: number, originId: string|null = null, turns: number, batch: FirebaseFirestore.WriteBatch) => {
  let kingdomEnchantment = await angularFirestore.collection(`kingdoms/${kingdomId}/enchantments`).where('id', '==', enchantment.id).limit(1).get();
  if (kingdomEnchantment.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/enchantments/${kingdomEnchantment.docs[0].id}`), { from: originId, turns: admin.firestore.FieldValue.increment(turns) });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/enchantments`).doc(), { id: enchantment.id, enchantment: enchantment, from: originId, turns: turns, level: level });
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
  let kingdomCharm = await angularFirestore.collection(`kingdoms/${kingdomId}/charms`).where('id', '==', spell.id).limit(1).get();
  if (kingdomCharm.size > 0) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/charms/${kingdomCharm.docs[0].id}`), {
      turns: admin.firestore.FieldValue.increment(turns),
      completed: (kingdomCharm.docs[0]?.data().turns + turns) >= spell?.turnResearch,
    });
  } else {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: spell.id, spell: spell, turns: 0 });
  }
}

/**
 * kingdom researchs charm a given number of turns
 * @param kingdomId
 * @param charmId
 * @param turns
 */
const researchCharm = async (kingdomId: string, charmId: string, turns: number) => {
  let resourceTurn = (await angularFirestore.doc(`resources/turn`).get()).data();
  let kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
  const max = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), resourceTurn?.max, resourceTurn?.ratio);
  if (turns <= max) {
    let spell = (await angularFirestore.doc(`kingdoms/${kingdomId}/charms/${charmId}`).get()).data();
    const batch = angularFirestore.batch();
    await addSupply(kingdomId, 'turn', -turns, batch, resourceTurn?.ratio);
    await addCharm(kingdomId, spell, turns, batch);
    await batch.commit();
  }
  return { turns: turns };
}

/**
 * create a new kingdom of a specific faction
 * @param kingdomId
 * @param factionId
 */
const createKingdom = async (kingdomId: string, factionId: string, name: string, latitude: number, longitude: number) => {
  const batch = angularFirestore.batch();
  const faction = (await angularFirestore.doc(`factions/${factionId}`).get()).data();
  if (kingdomId) {
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}`), { id: kingdomId, faction: faction, guild: null, position: geofirex.point(latitude, longitude), coordinates: { latitude: latitude, longitude: longitude }, name: name, power: 1500, player: true });
  } else {
    kingdomId = angularFirestore.collection('kingdoms').doc().id;
    batch.create(angularFirestore.doc(`kingdoms/${kingdomId}`), { id: kingdomId, faction: faction, guild: null, position: geofirex.point(latitude, longitude), coordinates: { latitude: latitude, longitude: longitude }, name: name, power: 1500, plater: true });
  }
  switch (factionId) {
    case 'black': {
      // troops
      const skeleton = (await angularFirestore.doc(`units/skeleton`).get()).data();
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: skeleton?.id, unit: skeleton, quantity: 20000, assignment: 2 });
      // charms
      const animateSkeleton = (await angularFirestore.doc(`spells/animate-skeleton`).get()).data();
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: animateSkeleton?.id, spell: animateSkeleton, turns: 0 });
      const terror = (await angularFirestore.doc(`spells/terror`).get()).data();
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: terror?.id, spell: terror, turns: 0, completed: false, total: 200 });
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
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: 'pegasus', quantity: 20000, assignment: 2 });
      // charms
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: 'call-pegasus', turns: 0, completed: false, total: 200 });
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: 'healing-hand', turns: 0, completed: false, total: 200 });
      break;
    }
  }
  // artifacts
  const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).doc(), { id: item.id, item: item, quantity: 1, assignment: 0 });
  // supplies
  const gold = (await angularFirestore.doc(`resources/gold`).get()).data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).doc(), { id: 'gold', resource: gold, quantity: 20000, max: null, balance: 0 });
  const mana = (await angularFirestore.doc(`resources/mana`).get()).data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).doc(), { id: 'mana', resource: mana, quantity: 20000, max: 20000, balance: 0 });
  const population = (await angularFirestore.doc(`resources/population`).get()).data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).doc(), { id: 'population', resource: population, quantity: 20000, max: 20000, balance: 0 });
  const gem = (await angularFirestore.doc(`resources/gem`).get()).data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).doc(), { id: 'gem', resource: gem, quantity: 10, max: null, balance: 0 });
  const turn = (await angularFirestore.doc(`resources/turn`).get()).data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).doc(), { id: 'turn', resource: turn, quantity: 0, max: 300, balance: 0, timestamp: moment(admin.firestore.Timestamp.now().toMillis()).subtract(MAX_TURNS * turn?.ratio, 'minutes') });
  const land = (await angularFirestore.doc(`resources/land`).get()).data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).doc(), { id: 'land', resource: land, quantity: 300, max: null, balance: 0 });
  // buildings
  const barrier = (await angularFirestore.doc(`structures/barrier`).get()).data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'barrier', structure: barrier, quantity: 100 });
  const farm = (await angularFirestore.doc(`structures/farm`).get()).data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'farm', structure: farm, quantity: 100 });
  const fortress = (await angularFirestore.doc(`structures/fortress`).get()).data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'fortress', structure: fortress, quantity: 100 });
  const academy = (await angularFirestore.doc(`structures/academy`).get()).data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'academy', structure: academy, quantity: 100 });
  const node = (await angularFirestore.doc(`structures/node`).get()).data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'node', structure: node, quantity: 100 });
  const village = (await angularFirestore.doc(`structures/village`).get()).data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'village', structure: village, quantity: 100 });
  const workshop = (await angularFirestore.doc(`structures/workshop`).get()).data();
  batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).doc(), { id: 'workshop', structure: workshop, quantity: 100 });
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
  let resourceTurn = (await angularFirestore.doc(`resources/turn`).get()).data();
  let kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
  const max = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), resourceTurn?.max, resourceTurn?.ratio);
  if (turns <= max) {
    let kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').limit(1).get()).docs[0].data();
    for (let i = 0; i < turns; i++) {
      lands += Math.min(MAX_LANDS, Math.max(0, Math.floor((MAX_LANDS - (kingdomLand.quantity + lands)) / 100)));
    }
    const batch = angularFirestore.batch();
    await addSupply(kingdomId, 'turn', -turns, batch, resourceTurn?.ratio);
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
  let unit = (await angularFirestore.doc(`units/${unitId}`).get()).data();
  if (unit?.gold > 0) {
    // let kingdomTurn = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get();
    let kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0].data();
    // let kingdomBarrack = await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'barrack').get();
    // et turns = quantity; // TODO turns
    let gold = unit?.gold * quantity;
    if (gold <= kingdomGold.quantity) { // turns <= kingdomTurn.docs[0].data().quantity &&
      const batch = angularFirestore.batch();
      // await addSupply(kingdomId, 'turn', -turns, batch);
      await addSupply(kingdomId, 'gold', -gold, batch);
      // batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${kingdomBarrack.docs[0].id}`), { total: admin.firestore.FieldValue.increment(quantity) });
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
  let kingdomTroop = (await angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troopId}`).get()).data();
  if (kingdomTroop?.quantity > 0) {
    let kingdomUnit = (await angularFirestore.doc(`units/${kingdomTroop?.id}`).get()).data();
    if (kingdomUnit?.populationMaintenance <= 0) {
      if (quantity >= kingdomTroop?.quantity) {
        angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troopId}`).delete();
      } else {
        angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troopId}`).update({ quantity: admin.firestore.FieldValue.increment(-quantity) });
      }
      return { quantity: quantity, unit: kingdomUnit?.name };
    } else throw new Error('api.error.troop');
  } else throw new Error('api.error.troop');
}

/**
 * kingdom break a contract with a hero
 * @param kingdomId
 * @param contractId
 */
const dischargeContract = async (kingdomId: string, contractId: string) => {
  let kingdomContract = (await angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${contractId}`).get()).data();
  if (kingdomContract) {
    angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${contractId}`).delete();
  } else throw new Error('api.error.contract');
}

/**
 * kingdom charges mana a given number of turns
 * @param kingdomId
 * @param turns
 */
const chargeMana = async (kingdomId: string, turns: number) => {
  let mana = 0;
  let resourceTurn = (await angularFirestore.doc(`resources/turn`).get()).data();
  let kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
  const max = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), resourceTurn?.max, resourceTurn?.ratio);
  if (turns <= max) {
    const batch = angularFirestore.batch();
    let kingdomNode = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'node').limit(1).get()).docs[0].data();
    mana = kingdomNode.quantity * 10 * turns;
    await addSupply(kingdomId, 'turn', -turns, batch, resourceTurn?.ratio);
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
  let resourceTurn = (await angularFirestore.doc(`resources/turn`).get()).data();
  let kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
  const max = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), resourceTurn?.max, resourceTurn?.ratio);
  if (turns <= max) {
    let kingdomVillage = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'village').limit(1).get()).docs[0].data();
    gold = kingdomVillage.quantity * 10 * turns;
    const batch = angularFirestore.batch();
    await addSupply(kingdomId, 'turn', -turns, batch, resourceTurn?.ratio);
    await addSupply(kingdomId, 'gold', gold, batch);
    await batch.commit();
  } else throw new Error('api.error.turns');
  return { gold: gold };
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
      if (auction?.kingdom) await addSupply(auction?.kingdom, 'gold', Math.floor(auction?.gold * 0.90), batch);
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
  let kingdomBuilding = (await angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${buildingId}`).get()).data();
  if (kingdomBuilding) {
    let kingdomWorkshop = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'workshop').limit(1).get()).docs[0].data();
    let kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'gold').limit(1).get()).docs[0].data();
    let kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'land').limit(1).get()).docs[0].data();
    let resourceTurn = (await angularFirestore.doc(`resources/turn`).get()).data();
    let kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', 'turn').limit(1).get()).docs[0].data();
    let kingdomStructure = (await angularFirestore.doc(`structures/${kingdomBuilding.id}`).get()).data();
    let gold = kingdomStructure?.goldCost * quantity;
    let turn = Math.ceil(quantity / Math.ceil((kingdomWorkshop.quantity + 1) / kingdomStructure?.turnRatio))
    const maxTurns = calculate(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), resourceTurn?.max, resourceTurn?.ratio);
    if (quantity <= kingdomLand.quantity && gold <= kingdomGold.quantity && turn <= maxTurns) {
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, 'turn', -turn, batch, resourceTurn?.ratio);
      await addSupply(kingdomId, 'gold', -gold, batch);
      await addSupply(kingdomId, 'land', -quantity, batch);
      if (kingdomBuilding.id === 'node') await addSupply(kingdomId, 'mana', 0, batch, 0, (kingdomBuilding.quantity + quantity) * kingdomStructure?.manaCapacity);
      if (kingdomBuilding.id === 'village') await addSupply(kingdomId, 'population', 0, batch, 0, (kingdomBuilding.quantity + quantity) * kingdomStructure?.populationCapacity);
      await addBuilding(kingdomId, kingdomStructure?.id, quantity, batch);
      await batch.commit();
      return { quantity: quantity, structure: kingdomStructure?.name };
    } else throw new Error('api.error.build');
  } else throw new Error('api.error.build');
}

/**
 * add building to kingdom
 * @param kingdomId
 * @param structureId
 * @param quantity
 * @param batch
 */
const addBuilding = async (kingdomId: string, structureId: string, quantity: number, batch: FirebaseFirestore.WriteBatch) => {
  let kingdomBuilding = await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', structureId).limit(1).get();
  batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${kingdomBuilding.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
}

/**
 * kingdom offers a resource to a god in exchange of some random rewards, good and bad
 * @param kingdomId
 * @param godId
 * @param sacrifice
 */
const offerGod = async (kingdomId: string, godId: string, sacrifice: number) => {
  let result = {};
  let kingdomGod = (await angularFirestore.doc(`gods/${godId}`).get()).data();
  if (kingdomGod) {
    let resource = kingdomGod.gold
      ? 'gold'
      : kingdomGod.mana
        ? 'mana'
        : kingdomGod.population
          ? 'population'
          : kingdomGod.land
            ? 'land'
            : 'turn';
    let kingdomResource = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', resource).limit(1).get();
    if (sacrifice <= kingdomResource.docs[0].data().quantity && sacrifice >= 1) {
      const batch = angularFirestore.batch();
      batch.update(angularFirestore.doc(`gods/${godId}`), { sacrifice: admin.firestore.FieldValue.increment(sacrifice), armageddon: (kingdomGod.sacrifice + sacrifice) >= kingdomGod[resource] });
      await addSupply(kingdomId, resource, -sacrifice, batch);
      let rewards = ['resource', 'artifact', 'contract', 'enchantment', 'summon', 'building', 'charm'];
      let reward = rewards[Math.floor(Math.random() * rewards.length)];
      switch (reward) {
        case 'enchantment':
          let enchantmentId = enchantments[random(0, enchantments.length - 1)];
          await addEnchantment(kingdomId, enchantmentId, 10, null, 300, batch);
          result = { enchantment: `spell.${enchantmentId}.name`, turns: 300, level: 10 };
          break;
        case 'contract':
          let heroId = heroes[random(0, heroes.length - 1)];
          let level = Math.floor(Math.random() * 9) + 1;
          await addContract(kingdomId, heroId, level, batch);
          result = { hero: `hero.${heroId}.name`, level: level };
          break;
        case 'artifact':
          let itemId = items[random(0, items.length - 1)];
          await addArtifact(kingdomId, itemId, 1, batch);
          result = { item: `item.${itemId}.name`, quantity: 1 };
          break;
        case 'summon':
          let unitId = units[random(0, units.length - 1)];
          let quantity = Math.floor(Math.random() * 100);
          await addTroop(kingdomId, unitId, quantity, batch);
          result = { unit: `unit.${unitId}.name`, quantity: quantity };
          break;
        case 'resource':
          let resource = resources[random(0, resources.length - 1)];
          let amount = random(0, (resource === 'land' ? 100 : 100000));
          await addSupply(kingdomId, resource, amount, batch);
          result = { [resource]: amount };
          break;
        case 'building':
          let structureId = structures[random(0, structures.length - 1)];
          let number = random(-10, 20);
          await addBuilding(kingdomId, structureId, number, batch);
          result = { building: `structure.${structureId}.name`, quantity: number };
          break;
        case 'charm':
          let spellId = spells[random(0, spells.length - 1)];
          let turns = Math.floor(Math.random() * 100) + 1;
          await addCharm(kingdomId, spellId, turns, batch);
          result = { spell: `spell.${spellId}.name`, turns: turns };
          break;
      }
      await batch.commit();
      return result;
    } else throw new Error('api.error.god');
  } else throw new Error('api.error.god');
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
      return { quantity: 1, item: item?.name };
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
      batch.update(angularFirestore.doc(`kingdoms/${targetId}`), { attacked: moment(admin.firestore.Timestamp.now().toMillis()).add(PROTECTION_TIME, 'seconds') });
      await addSupply(kingdomId, 'turn', -BATTLE_TURNS, batch);
      await batch.commit();
    } else throw new Error('api.error.battle');
  } else throw new Error('api.error.battle');
}

/**
 * add letter to a kingdom from a source
 * @param kingdomId
 * @param subject
 * @param message
 * @param batch
 * @param fromId
 */
const addLetter = async (targetId: string, subject: string, message: object, batch: FirebaseFirestore.WriteBatch, sourceId: any) => {
  batch.create(angularFirestore.collection(`kingdoms/${targetId}/letters`).doc(), {
    to: targetId,
    subject: subject,
    message: message,
    timestamp: admin.firestore.Timestamp.now(),
    from: sourceId,
    read: false,
  });
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
  const guilded = moment(admin.firestore.Timestamp.now().toMillis()).add(GUILD_TIME, 'seconds');
  await angularFirestore.doc(`kingdoms/${kingdomId}`).update({ guild: guildId, guilded: guilded });
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
  let shop = (await angularFirestore.doc(`shops/${fid}`).get()).data();
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
        batch.create(angularFirestore.collection(`shops/${fid}/contracts`).doc(), { id: hero.id, hero: hero, gold: random(1000000, 10000000), level: random(1, 10) });
        break;
      case StoreType.MERCENARY:
        const mercenaryTroops = await angularFirestore.collection(`shops/${fid}/troops`).listDocuments();
        mercenaryTroops.map(troop => batch.delete(troop));
        const unit = (await angularFirestore.collection('units').where('random', '==', random(0, 64)).limit(1).get()).docs[0].data();
        batch.create(angularFirestore.collection(`shops/${fid}/troops`).doc(), { id: unit.id, unit: unit, gold: random(1000000, 10000000), quantity: random(1, 1000) });
        break;
      case StoreType.MERCHANT:
        const merchantArtifacts = await angularFirestore.collection(`shops/${fid}/artifacts`).listDocuments();
        merchantArtifacts.map(artifact => batch.delete(artifact));
        const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
        batch.create(angularFirestore.collection(`shops/${fid}/artifacts`).doc(), { id: item.id, item: item, gold: random(1000000, 10000000), quantity: random(1, 3) });
        break;
      case StoreType.SORCERER:
        const sorcererCharms = await angularFirestore.collection(`shops/${fid}/charms`).listDocuments();
        sorcererCharms.map(charm => batch.delete(charm));
        const spell = (await angularFirestore.collection('spells').where('random', '==', random(0, 100)).limit(1).get()).docs[0].data();
        batch.create(angularFirestore.collection(`shops/${fid}/charms`).doc(), { id: spell.id, spell: spell, gold: random(10000000, 100000000), level: 0 });
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
  let quest = (await angularFirestore.doc(`quests/${fid}`).get()).data();
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
    let questHeroes: any[] = [];
    let questUnits: any[] = [];
    let questItems: any[] = [];
    let questLegendaries: any[] = ['wisdom-tome', 'dragon-egg', 'voodoo-doll', 'golden-feather', 'lucky-coin', 'lucky-horseshoe', 'lucky-paw', 'magic-compass', 'magic-scroll', 'rattle'];
    switch (type) {
      case LocationType.VOLCANO:
      case LocationType.DUNGEON:
        questHeroes = ['demon-prince'];
        questUnits = ['nightmare', 'medusa', 'cyclop', 'minotaur', 'devil', 'ogre', 'imp'];
        questItems = _.difference(items, questLegendaries);
        break;
      case LocationType.CAVE:
      case LocationType.MINE:
        questHeroes = ['orc-king'];
        questUnits = ['cave-troll', 'centaur', 'goblin', 'ogre', 'orc'];
        questItems = _.difference(items, questLegendaries);
        break;
      case LocationType.MOUNTAIN:
      case LocationType.RUIN:
        questHeroes = ['golem-golem'];
        questUnits = ['crystal-golem', 'iron-golem', 'stone-golem'];
        questItems = _.difference(items, questLegendaries);
        break;
      case LocationType.MONOLITH:
      case LocationType.PYRAMID:
        questHeroes = ['elementalist'];
        questUnits = ['lightning-elemental', 'djinni', 'ice-elemental', 'earth-elemental', 'fire-elemental', 'phoenix', 'light-elemental'];
        questItems = _.difference(items, questLegendaries);
        break;
      case LocationType.SHRINE:
      case LocationType.FOREST:
        questHeroes = ['beast-master'];
        questUnits = ['werewolf', 'giant-snail', 'werebear', 'spider', 'carnivorous-plant', 'griffon', 'pegasus', 'cavalry', 'trained-elephant', 'wolf'];
        questItems = _.difference(items, questLegendaries);
        break;
      case LocationType.LAKE:
      case LocationType.SHIP:
        questHeroes = ['illusionist', 'swamp-thing'];
        questUnits = ['medusa', 'leviathan', 'lizardman', 'hydra'];
        questItems = _.difference(items, questLegendaries);
        break;
      case LocationType.NEST:
      case LocationType.TOTEM:
        questHeroes = ['dragon-rider'];
        questUnits = ['bone-dragon', 'blue-dragon', 'white-dragon', 'red-dragon', 'golden-dragon', 'baby-dragon'];
        questItems = questLegendaries;
        break;
      case LocationType.CATHEDRAL:
      case LocationType.CASTLE:
        questHeroes = ['commander', 'colossus'];
        questUnits = ['angel', 'knight', 'monk', 'templar', 'pegasus', 'paladin', 'cavalry', 'fanatic', 'pikeman', 'fighter', 'archer'];
        questItems = _.difference(items, questLegendaries);
        break;
      case LocationType.BARRACK:
      case LocationType.ISLAND:
        questHeroes = ['golem-golem'];
        questUnits = ['frost-giant', 'leviathan', 'yeti', 'giant-snail', 'carnivorous-plant', 'hydra', 'cyclop', 'ogre', 'titan'];
        questItems = _.difference(items, questLegendaries);
        break;
      case LocationType.GRAVEYARD:
      case LocationType.TOWN:
        questHeroes = ['necrophage', 'soul-reaper'];
        questItems = _.difference(items, questLegendaries);
        questUnits = ['wraith', 'bone-dragon', 'nightmare', 'ghoul', 'lich', 'skeleton', 'vampire', 'werewolf', 'zombie'];
        break;
    }
    questHeroes = _.shuffle(questHeroes);
    questUnits = _.shuffle(questUnits);
    questItems = _.shuffle(questItems);
    for (let i of [0]) {
      let hero = (await angularFirestore.doc(`heroes/${questHeroes[i]}`).get()).data();
      batch.create(angularFirestore.collection(`quests/${fid}/contracts`).doc(), { id: hero?.id, hero: hero, level: random(1, 20) });
    };
    for (let j of [0,1,2]) {
      let unit = (await angularFirestore.doc(`units/${questUnits[j]}`).get()).data();
      batch.create(angularFirestore.collection(`quests/${fid}/troops`).doc(), { id: unit?.id, unit: unit, quantity: random(10, 10000) });
    }
    for (let k of [0]) {
      let item = (await angularFirestore.doc(`items/${questItems[k]}`).get()).data();
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
  const auctioned = moment(admin.firestore.Timestamp.now().toMillis()).add(AUCTION_TIME, 'seconds');
  const from = (await angularFirestore.doc('kingdoms/auction').get()).data();
  const kingdomAuctions = await angularFirestore.collection('auctions').get();
  for (const kingdomAuction of kingdomAuctions.docs) { // cannot use forEach due to async/await of batch.commit
    const auction = kingdomAuction.data();
    if (moment().isAfter(moment(auction.auctioned.toMillis()))) {
      if (auction.kingdom) {
        const message = {
          item: auction.item || null,
          spell: auction.spell || null,
          hero: auction.hero || null,
          unit: auction.unit || null,
          quantity: auction.quantity || null,
          level: auction.level || null,
        };
        await addLetter(auction.kingdom, 'kingdom.report.auction', message, batch, from);
      }
      switch (auction.type) {
        case AuctionType.ARTIFACT:
          if (auction.kingdom) await addArtifact(auction.kingdom, auction.item, auction.quantity, batch);
          const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
          batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.ARTIFACT, item: item, quantity: random(1, 3), gold: random(1000000, 5000000), auctioned: auctioned, kingdom: null /*'wS6oK6Epj3XvavWFtngLZkgFx263'*/ });
          break;
        case AuctionType.CHARM:
          if (auction.kingdom) await addCharm(auction.kingdom, auction.spell, auction.level, batch);
          const spell = (await angularFirestore.collection('spells').where('random', '==', random(0, 100)).limit(1).get()).docs[0].data();
          batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.CHARM, spell: spell, level: 0, gold: random(1000000, 5000000), auctioned: auctioned, kingdom: 'wS6oK6Epj3XvavWFtngLZkgFx263' });
          break;
        case AuctionType.CONTRACT:
          if (auction.kingdom) await addContract(auction.kingdom, auction.hero, auction.level, batch);
          const hero = (await angularFirestore.collection('heroes').where('random', '==', random(0, 19)).limit(1).get()).docs[0].data();
          batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.CONTRACT, hero: hero, level: random(1, 10), gold: random(5000000, 15000000), auctioned: auctioned, kingdom: 'wS6oK6Epj3XvavWFtngLZkgFx263' });
          break;
        case AuctionType.TROOP:
          const unit = (await angularFirestore.collection('units').where('random', '==', random(0, 64)).limit(1).get()).docs[0].data();
          if (auction.kingdom) await addTroop(auction.kingdom, auction.unit, auction.quantity, batch);
          batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.TROOP, unit: unit, quantity: random(1, 1000), gold: random(1000000, 10000000), auctioned: auctioned, kingdom: 'wS6oK6Epj3XvavWFtngLZkgFx263' });
          break;
      }
      batch.delete(kingdomAuction.ref);
    }
  };
  await batch.commit();
}
