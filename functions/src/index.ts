'use strict';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as axios from 'axios';
import * as moment from 'moment';
import server from './server';
import * as mapboxgl from 'mapbox-gl';
import * as _ from 'lodash';
// https://stackoverflow.com/a/66124761/2477303
import {
  KingdomType,
  SupplyType,
  BonusType,
  AssignmentType,
  StoreType,
  LocationType,
  BattleReport,
  TargetType,
  BattleType,
  AuctionType,
  MarkerType,
  MAX_TURNS,
  MIN_LANDS,
  MAX_LANDS,
  VISITATION_TIME,
  FACTION_MULTIPLIER,
  BATTLE_ROUNDS,
  BATTLE_POWER,
  BATTLE_TURNS,
  AUCTION_TIME,
  AUCTION_TIME_OUTBID,
  OUTBID_RATIO,
  BID_RATIO,
  CLAN_COST,
  GUILD_TIME,
  MAP_RADIUS,
  PILLAGE_RATIO,
  SIEGE_RATIO,
  ATTACK_RATIO,
  QUEST_GEMS,
} from './config';

//========================================================================================
/*                                                                                      *
 *                                       FIRESTORE                                      *
 *                                                                                      */
//========================================================================================

// firestore
admin.initializeApp({ credential: admin.credential.cert(require('../credentials/key.json')) });
const angularFirestore: FirebaseFirestore.Firestore = admin.firestore();
const geo: any = require('geofirex');
const geofirex: any = geo.init(admin);

//========================================================================================
/*                                                                                      *
 *                                       FUNCTIONS                                      *
 *                                                                                      */
//========================================================================================

// functions
exports.api = functions
.region('europe-west1')
.https
.onRequest(server);

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
export const calculateTurns = (from: any, to: any, max: number, ratio: number): number => {
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
export const createKingdom = async (kingdomId: string, factionId: KingdomType, name: string, latitude: number, longitude: number): Promise<any> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to be CREATED from ${factionId} into ${latitude}, ${longitude}`);
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
        charms = ['animate-skeleton', 'animate-zombie', 'animate-ghoul', 'vampirism', 'terror', 'night-living-dead', 'necromancy', 'summon-wraith', 'summon-lich', 'summon-vampire', 'death-decay', 'shroud-darkness', 'corruption', 'soul-pact', 'chain-lightning', 'full-moon', 'witchcraft', 'plague', 'curse', 'blood-ritual'];
        break;
      }
      case KingdomType.GREEN: {
        troops = ['elf'];
        charms = ['accuracy', 'ambush', 'druidism', 'beast-council', 'summon-spider', 'call-carnivorous-plant', 'call-centaur', 'climate-control', 'cure', 'hurricane', 'locust-swarm', 'natures-favor', 'invigorate', 'calm', 'serenity', 'venom', 'call-elf', 'summon-werebear', 'summon-druid', 'sunray'];
        break;
      }
      case KingdomType.RED: {
        troops = ['orc'];
        charms = ['fireball', 'battle-chant', 'call-berserker', 'call-orc', 'succubus-kiss', 'destroy-artifact', 'inferno', 'flame-shield', 'flame-blade', 'flame-arrow', 'gravity', 'meteor-storm', 'fatigue', 'summon-minotaur', 'summon-ogre', 'summon-lizardman', 'call-cyclop', 'volcano', 'fire-wall', 'frenzy'];
        break;
      }
      case KingdomType.BLUE: {
        troops = ['mage'];
        charms = ['call-frost-giant', 'call-cave-troll', 'call-yeti', 'summon-mage', 'summon-medusa', 'summon-djinni', 'concentration', 'confuse', 'conjure-elemental', 'levitation', 'fog', 'avarice', 'hallucination', 'freeze', 'ice-wall', 'invisibility', 'laziness', 'celerity', 'spy', 'steal-artifact'];
        break;
      }
      case KingdomType.WHITE: {
        troops = ['knight'];
        charms = ['wrath', 'call-pegasus', 'call-knight', 'call-templar', 'blaze', 'prayer', 'healing', 'divine-protection', 'exorcism', 'endurance', 'locate-artifact', 'miracle', 'peace-prosperity', 'resurrection', 'shield-light', 'summon-angel', 'summon-titan', 'summon-monk', 'sword-light', 'tranquility'];
        break;
      }
    }
    // troops
    for (const troop of troops) {
      const unit = (await angularFirestore.doc(`units/${troop}`).get()).data();
      const quantity = Math.max(...unit?.amount);
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: unit?.id, unit: unit, quantity: quantity, assignment: AssignmentType.DEFENSE, sort: 0 });
      goldBalance -= unit?.goldMaintenance * quantity;
      manaBalance -= unit?.manaMaintenance * quantity;
      populationBalance -= unit?.populationMaintenance * quantity;
      power += unit?.power * quantity;
    }
    // charms
    for (const charm of charms) {
      const spell = (await angularFirestore.doc(`spells/${charm}`).get()).data();
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: spell?.id, spell: spell, turns: 0, completed: false });
    }
    // artifacts
    const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).doc(), { id: item.id, item: item, quantity: 1, assignment: AssignmentType.NONE });
    // supplies
    const supplies = [
      { id: SupplyType.GOLD, quantity: 1000000, max: null, balance: Math.floor(goldBalance), timestamp: null },
      { id: SupplyType.MANA, quantity: 100000, max: manaMax, balance: Math.floor(manaBalance), timestamp: null },
      { id: SupplyType.POPULATION, quantity: 10000, max: populationMax, balance: Math.floor(populationBalance), timestamp: null },
      { id: SupplyType.GEM, quantity: 10, max: null, balance: 0, timestamp: null },
      { id: SupplyType.TURN, quantity: 300, max: MAX_TURNS, balance: 0, timestamp: moment(admin.firestore.Timestamp.now().toMillis()).subtract(MAX_TURNS, 'minutes') },
      { id: SupplyType.LAND, quantity: 300, max: null, balance: 0, timestamp: null },
    ];
    for (const supply of supplies) {
      const resource = (await angularFirestore.doc(`resources/${supply.id}`).get()).data();
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).doc(), { id: supply.id, resource: resource, quantity: supply.quantity, max: supply.max, balance: supply.balance, timestamp: supply.timestamp });
    }
    // perks
    const tree = (await angularFirestore.doc(`perks/strategy`).get()).data();
    // kingdom
    const faction = (await angularFirestore.doc(`factions/${factionId}`).get()).data();
    const guild = (await angularFirestore.collection('guilds').where('random', '==', random(0, 8)).limit(1).get()).docs[0].data();
    batch.create(angularFirestore.doc(`kingdoms/${kingdomId}`), {
      id: kingdomId,
      faction: faction,
      guild: guild,
      clan: null,
      guilded: moment(admin.firestore.Timestamp.now().toMillis()),
      position: geofirex.point(latitude,longitude),
      coordinates: { latitude: latitude, longitude: longitude },
      name: name,
      power: power,
      tree: tree,
    });
    console.log(`KINGDOM ${kingdomId} succesfully CREATED`);
    // commit
    return batch.commit();
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not be CREATED`, error);
    throw error;
  }
};

/**
 * deletes a kingdom (for testing purposes only)
 * @param kingdomId
 */
export const deleteKingdom = async (kingdomId: string): Promise<void> => {
  const batch: FirebaseFirestore.WriteBatch = angularFirestore.batch();
  const artifacts = await angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).listDocuments();
  artifacts.forEach(artifact => batch.delete(artifact));
  const contracts = await angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).listDocuments();
  contracts.forEach(contract => batch.delete(contract));
  const buildings = await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).listDocuments();
  buildings.forEach(building => batch.delete(building));
  const troops = await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).listDocuments();
  troops.forEach(troop => batch.delete(troop));
  const supplies = await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).listDocuments();
  supplies.forEach(supply => batch.delete(supply));
  const charms = await angularFirestore.collection(`kingdoms/${kingdomId}/charms`).listDocuments();
  charms.forEach(charm => batch.delete(charm));
  const letters = await angularFirestore.collection(`kingdoms/${kingdomId}/letters`).listDocuments();
  letters.forEach(letter => batch.delete(letter));
  const enchantments = await angularFirestore.collection(`kingdoms/${kingdomId}/enchantments`).listDocuments();
  enchantments.forEach(letter => batch.delete(letter));
  const incantations = await angularFirestore.collection(`kingdoms/${kingdomId}/incantations`).listDocuments();
  incantations.forEach(letter => batch.delete(letter));
  batch.delete(angularFirestore.doc(`kingdoms/${kingdomId}`));
  await batch.commit();
};

/**
 * searchs a tree node by perk name
 * @param node
 * @param perk
 */
export const searchPerk = (node: any, perk: string): any | null => {
  if (node.id === perk) {
    return node;
  } else if (node.perks) {
    let found = null;
    for (let i = 0; found === null && i < node.perks.length; i++) {
      found = searchPerk(node.perks[i], perk);
    }
    return found;
  }
  return null;
};

/**
 * updates the tree node with a level
 * @param node
 * @param perk
 * @param level
 */
export const updatePerk = (node: any, perk: string, level: number): boolean => {
  if (node.id === perk) {
    node.level = level;
    return true;
  } else if (node.perks) {
    let found = false;
    for (let i = 0; found === false && i < node.perks.length; i++) {
      found = updatePerk(node.perks[i], perk, level);
    }
    return found;
  }
  return false;
};

/**
 * updates the kingdom tree
 * @param kingdomId
 * @param tree
 * @param gems
 */
export const plantTree = async (kingdomId: string, tree: any, gems: number): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to plant the TREE for ${gems} GEMS`);
    const kingdomGem = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.GEM).limit(1).get()).docs[0].data();
    if (gems <= kingdomGem.quantity) {
      const batch: FirebaseFirestore.WriteBatch = angularFirestore.batch();
      const baseTree = (await angularFirestore.doc(`perks/strategy`).get()).data();
      Object.keys(tree).forEach((key: string) => updatePerk(baseTree, key, tree[key]));
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}`), { tree: baseTree });
      await addSupply(kingdomId, SupplyType.GEM, -gems, batch);
      await batch.commit();
      console.log(`KINGDOM ${kingdomId} succesfully plants the TREE for ${gems} GEMS`);
    } else throw new Error(`KINGDOM ${kingdomId} has not enought GEMS ${gems}`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not plant the TREE`, error);
    throw error;
  }
};

/**
 * kingdom spies another kingdom
 * @param kingdomId
 * @param targetId
 * @param batch
 */
export const spyKingdom = async (kingdomId: string, targetId: string, batch: FirebaseFirestore.WriteBatch): Promise<void> => {
  try {
    const targetFrom = (await angularFirestore.doc(`kingdoms/${targetId}`).get()).data();
    const targetSupplies = (await angularFirestore.collection(`kingdoms/${targetId}/supplies`).where('id', 'in', [SupplyType.GOLD, SupplyType.MANA, SupplyType.POPULATION, SupplyType.LAND]).get()).docs;
    const targetBuildings = (await angularFirestore.collection(`kingdoms/${targetId}/buildings`).get()).docs;
    const targetTroops = (await angularFirestore.collection(`kingdoms/${targetId}/troops`).where('assignment', '==', AssignmentType.DEFENSE).get()).docs;
    const targetContracts = (await angularFirestore.collection(`kingdoms/${targetId}/contracts`).where('assignment', '==', AssignmentType.DEFENSE).get()).docs;
    const data = {
      intel: {
        supplies: targetSupplies.map((supply: FirebaseFirestore.DocumentData) => supply.data()),
        buildings: targetBuildings.map((building: FirebaseFirestore.DocumentData) => building.data()),
        troops: targetTroops.map((troop: FirebaseFirestore.DocumentData) => troop.data()),
        contracts: targetContracts.map((contract: FirebaseFirestore.DocumentData) => contract.data()),
      },
    };
    await addLetter(kingdomId, 'kingdom.espionage.subject', 'kingdom.espionage.message', targetFrom, batch, data);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not SPY ${targetId}`, error);
    throw error;
  }
};

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
 * @param ratio
 * @param max
 */
export const addSupply = async (kingdomId: string, supply: string, quantity: number, batch: FirebaseFirestore.WriteBatch, ratio?: number, max?: number): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to ADD ${quantity} of ${supply}`);
    const kingdom = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
    const tree = kingdom?.tree;
    // const guild = kingdom?.guild;
    const kingdomSupply = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', supply).limit(1).get()).docs[0];
    const s = kingdomSupply.data();
    switch (supply) {
      case SupplyType.TURN:
        if (ratio) {
          const total = calculateTurns(s.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), MAX_TURNS, ratio);
          batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomSupply.id}`), {
            quantity: 0,
            timestamp: moment(admin.firestore.Timestamp.now().toMillis()).subtract((total + quantity) * ratio, 'minutes').subtract(1, 'seconds'),
          });
          if (quantity < 0) {
            await payMaintenance(kingdomId, Math.abs(quantity), batch);
          }
        }
        break;
      case SupplyType.GOLD:
        if (quantity > 0) {
          const agriculture = searchPerk(tree, 'agriculture');
          // tslint:disable-next-line: no-parameter-reassignment
          quantity = Math.ceil(quantity * (1 + (agriculture.goldBonus * agriculture.level) / 100));
          // if (guild.id === 'thieft')
        }
        break;
      case SupplyType.MANA:
        if (quantity > 0) {
          const alchemy = searchPerk(tree, 'alchemy');
          // tslint:disable-next-line: no-parameter-reassignment
          quantity = Math.ceil(quantity * (1 + (alchemy.manaBonus * alchemy.level) / 100));
        }
        break;
      case SupplyType.POPULATION:
        if (quantity > 0) {
          const culture = searchPerk(tree, 'culture');
          // tslint:disable-next-line: no-parameter-reassignment
          quantity = Math.ceil(quantity * (1 + (culture.populationBonus * culture.level) / 100));
        }
        break;
      case SupplyType.LAND:
        if (quantity > 0) {
          const cartography = searchPerk(tree, 'cartography');
          // tslint:disable-next-line: no-parameter-reassignment
          quantity = Math.ceil(quantity * (1 + (cartography.explorationBonus * cartography.level) / 100));
        }
        break;
      case SupplyType.GEM:
        // nothing
        break;
    }
    const q = s.max && (s.quantity + quantity > s.max) ? s.max : s.quantity + quantity <= 0 ? 0 : admin.firestore.FieldValue.increment(quantity);
    if (max) batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomSupply.id}`), { quantity: q, max: max });
    else batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/supplies/${kingdomSupply.id}`), { quantity: q });
    console.log(`KINGDOM ${kingdomId} succesfully ADDS ${quantity} of ${supply}`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not ADD ${quantity} of ${supply}`, error);
    throw error;
  }
};

/**
 * kingdom charges mana a given number of turns
 * @param kingdomId
 * @param turns
 */
export const chargeMana = async (kingdomId: string, turns: number): Promise<any> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to CHARGE ${turns} turns`);
    const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.TURN).limit(1).get()).docs[0].data();
    kingdomTurn.quantity = calculateTurns(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
    if (turns <= kingdomTurn.quantity) {
      const batch = angularFirestore.batch();
      const kingdomNode = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'node').limit(1).get()).docs[0].data();
      const mana = kingdomNode.quantity * kingdomNode.structure.manaProduction * turns;
      await addSupply(kingdomId, SupplyType.TURN, -turns, batch, kingdomTurn.resource.ratio);
      await addSupply(kingdomId, SupplyType.MANA, mana, batch);
      await batch.commit();
      console.log(`KINGDOM ${kingdomId} succesfully CHARGES ${mana} mana`);
      return { mana: mana };
    } else throw new Error(`KINGDOM ${kingdomId} has not enought TURNS`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not CHARGE ${turns} turns`, error);
    throw error;
  }
};

/**
 * kingdom taxes gold a given number of turns
 * @param kingdomId
 * @param turns
 */
export const taxGold = async (kingdomId: string, turns: number): Promise<any> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to TAX ${turns} turns`);
    const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.TURN).limit(1).get()).docs[0].data();
    kingdomTurn.quantity = calculateTurns(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
    if (turns <= kingdomTurn.quantity) {
      const kingdomVillage = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'village').limit(1).get()).docs[0].data();
      const gold = Math.floor(kingdomVillage.quantity * kingdomVillage.structure.goldProduction * turns);
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, SupplyType.TURN, -turns, batch, kingdomTurn.resource.ratio);
      await addSupply(kingdomId, SupplyType.GOLD, gold, batch);
      await batch.commit();
      console.log(`KINGDOM ${kingdomId} succesfully TAXES ${gold} gold`);
      return { gold: gold };
    } else throw new Error(`KINGDOM ${kingdomId} has not enought TURNS`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not TAX ${turns} turns`, error);
    throw error;
  }
};

/**
 * kingdom explores lands on a given number of turns
 * @param kingdomId
 * @param turns
 */
export const exploreLands = async (kingdomId: string, turns: number): Promise<any> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to EXPLORE ${turns} turns`);
    let lands = MIN_LANDS;
    const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.TURN).limit(1).get()).docs[0].data();
    const max = calculateTurns(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
    if (turns <= max) {
      const kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.LAND).limit(1).get()).docs[0].data();
      for (let i = 0; i < turns; i++) {
        lands += Math.min(MAX_LANDS, Math.max(0, Math.floor((MAX_LANDS - (kingdomLand.quantity + lands)) / 100)));
      }
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, SupplyType.TURN, -turns, batch, kingdomTurn.resource.ratio);
      await addSupply(kingdomId, SupplyType.LAND, lands, batch);
      await batch.commit();
      console.log(`KINGDOM ${kingdomId} succesfully EXPLORES ${lands} lands`);
      return { lands: lands };
    } else throw new Error(`KINGDOM ${kingdomId} has not enought TURNS`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not EXPLORE ${turns} turns`, error);
    throw error;
  }
};

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
export const balanceSupply = async (kingdomId: string, supply: SupplyType, balance: number, batch: FirebaseFirestore.WriteBatch): Promise<void> => {
  try {
    if (balance) {
      const kingdomSupply = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', supply).limit(1).get()).docs[0];
      batch.update(kingdomSupply.ref, { balance: admin.firestore.FieldValue.increment(balance) });
    }
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not BALANCE the supply ${supply}`, error);
    throw error;
  }
};

/**
 * balances the power
 * @param kingdomId
 * @param power
 * @param batch
 */
export const balancePower = async (kingdomId: string, power: number, batch: FirebaseFirestore.WriteBatch): Promise<void> => {
  try {
    if (power) {
      const kingdom = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}`), { power: kingdom?.power + power <= 0 ? 0 : admin.firestore.FieldValue.increment(power) });
    }
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not BALANCE the power`, error);
    throw error;
  }
};

/**
 * balances a bonus
 * @param kingdomId
 * @param type
 * @param bonus
 * @param batch
 */
export const balanceBonus = async (kingdomId: string, type: BonusType, bonus: number, batch: FirebaseFirestore.WriteBatch): Promise<void> => {
  try {
    if (bonus) {
      switch (type) {
        case BonusType.EXPLORE:
          const kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.LAND).limit(1).get()).docs[0];
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
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not BALANCE the bonus ${type}`, error);
    throw error;
  }
};

/**
 * pay the maintenances if turns are spent
 * @param kingdomId
 * @param turns
 * @param batch
 */
export const payMaintenance = async (kingdomId: string, turns: number, batch: FirebaseFirestore.WriteBatch): Promise<void> => {
  try {
    const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.GOLD).limit(1).get()).docs[0];
    const kingdomMana = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.MANA).limit(1).get()).docs[0];
    const kingdomPopulation = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.POPULATION).limit(1).get()).docs[0];
    const kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.LAND).limit(1).get()).docs[0];
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
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not PAY the maintenance`, error);
    throw error;
  }
};

/**
 * evict something to pay the maintenance
 * @param kingdomId
 * @param batch
 */
const evictMaintenance = async (kingdomId: string, batch: FirebaseFirestore.WriteBatch): Promise<void> => {
  try {
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
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not EVICT`, error);
    throw error;
  }
};

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
export const addTroop = async (kingdomId: string, unit: any, quantity: number, batch: FirebaseFirestore.WriteBatch): Promise<void> => {
  try {
    const kingdomTroop = await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).where('id', '==', unit.id).limit(1).get();
    const tree = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data()?.tree;
    const strategy = searchPerk(tree, 'strategy');
    // tslint:disable-next-line: no-parameter-reassignment
    if (strategy) quantity = Math.ceil(quantity * (1 + (strategy.troopBonus * strategy.level) / 100));
    if (kingdomTroop.size > 0) {
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/troops/${kingdomTroop.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
    } else {
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/troops`).doc(), { id: unit.id, quantity: quantity, unit: unit, assignment: AssignmentType.NONE, sort: 0 });
    }
    await balanceSupply(kingdomId, SupplyType.GOLD, -Math.floor(unit.goldMaintenance * quantity), batch);
    await balanceSupply(kingdomId, SupplyType.MANA, -Math.floor(unit.manaMaintenance * quantity), batch);
    await balanceSupply(kingdomId, SupplyType.POPULATION, -Math.floor(unit.populationMaintenance * quantity), batch);
    await balancePower(kingdomId, Math.floor(unit.power * quantity), batch);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not ADD the TROOP ${unit.id}`, error);
    throw error;
  }
};

/**
 * kingdom disbands troops on a given number
 * @param kingdomId
 * @param troopId
 * @param quantity
 */
export const disbandTroop = async (kingdomId: string, troopId: string, quantity: number): Promise<any> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to DISBAND the TROOP ${troopId}`);
    const batch = angularFirestore.batch();
    const response = await removeTroop(kingdomId, troopId, quantity, batch);
    await batch.commit();
    console.log(`KINGDOM ${kingdomId} succesfully DISBANDS the TROOP ${troopId}`);
    return response;
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not DISBAND the TROOP ${troopId}`, error);
    throw error;
  }
};

/**
 * removes a troop
 * @param kingdomId
 * @param troopId
 * @param quantity
 * @param batch
 */
export const removeTroop = async (kingdomId: string, troopId: string, quantity: number, batch: FirebaseFirestore.WriteBatch, questId?: string): Promise<any> => {
  try {
    if (!questId) {
      const kingdomTroop = (await angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troopId}`).get()).data();
      if (kingdomTroop) {
        const unit = kingdomTroop?.unit;
        if (unit.populationMaintenance <= 0) {
          if (quantity >= kingdomTroop?.quantity) {
            // tslint:disable-next-line: no-parameter-reassignment
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
        } else throw new Error(`TROOP ${troopId} is not disbandable`);
      } else throw new Error(`TROOP ${troopId} does not exists`);
    } else {
      const questTroop = (await angularFirestore.doc(`quests/${questId}/troops/${troopId}`).get()).data();
      if (questTroop) {
        if (quantity >= questTroop?.quantity) {
          batch.delete(angularFirestore.doc(`quests/${questId}/troops/${troopId}`));
        } else {
          batch.update(angularFirestore.doc(`quests/${questId}/troops/${troopId}`), { quantity: admin.firestore.FieldValue.increment(-quantity) });
        }
        return;
      } else throw new Error(`QUEST ${questId} does not exists`);
    }
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not REMOVE the TROOP ${troopId}`, error);
    throw error;
  }
};

/**
 * kingdom recruits units on a given number
 * @param kingdomId
 * @param unitId
 * @param quantity
 */
export const recruitUnit = async (kingdomId: string, unitId: string, quantity: number): Promise<any> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to RECRUIT the TROOP ${unitId}`);
    const unit = (await angularFirestore.doc(`units/${unitId}`).get()).data();
    if (unit?.gold > 0) {
      const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.GOLD).limit(1).get()).docs[0].data();
      const gold = unit?.gold * quantity;
      if (gold <= kingdomGold.quantity) {
        const batch = angularFirestore.batch();
        await addSupply(kingdomId, SupplyType.GOLD, -gold, batch);
        await addTroop(kingdomId, unit, quantity, batch);
        await batch.commit();
        console.log(`KINGDOM ${kingdomId} succesfully RECRUITS the TROOP ${unitId}`);
        return { quantity: quantity, unit: unit?.name };
      } else throw new Error(`KINGDOM ${kingdomId} has not enought GOLD`);
    } else throw new Error(`UNIT ${unitId} is not recruitable`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not RECRUIT the TROOP ${unitId}`, error);
    throw error;
  }
};

/**
 * kingdom assigns troops to their assignments with proper sorting
 * @param kingdomId
 * @param army
 */
export const assignArmy = async (kingdomId: string, army: any[]): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to ASSIGN the ARMY`);
    const batch = angularFirestore.batch();
    army.forEach(troop => batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/troops/${troop.troopId}`), { sort: troop.sort, assignment: troop.assignment }));
    await batch.commit();
    console.log(`KINGDOM ${kingdomId} succesfully ASSIGNS the ARMY`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not ASSIGN the ARMY`, error);
    throw error;
  }
};

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
export const addContract = async (kingdomId: string, hero: any, level: number, batch: FirebaseFirestore.WriteBatch): Promise<void> => {
  try {
    const kingdomContract = await angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).where('id', '==', hero.id).limit(1).get();
    if (kingdomContract.size > 0) {
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${kingdomContract.docs[0].id}`), { level: admin.firestore.FieldValue.increment(level) });
      // TODO update balances with leveling
    } else {
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).doc(), { id: hero.id, level: level, hero: hero, assignment: AssignmentType.NONE });
      await balanceSupply(kingdomId, SupplyType.GOLD, Math.floor((hero.goldProduction - hero.goldMaintenance) * level), batch);
      await balanceSupply(kingdomId, SupplyType.MANA, Math.floor((hero.manaProduction - hero.manaMaintenance) * level), batch);
      await balanceSupply(kingdomId, SupplyType.POPULATION, Math.floor((hero.populationProduction - hero.populationMaintenance) * level), batch);
      await balanceBonus(kingdomId, BonusType.EXPLORE, Math.floor(hero.exploreBonus * level), batch);
      await balanceBonus(kingdomId, BonusType.BUILD, Math.floor(hero.buildBonus * level), batch);
      await balanceBonus(kingdomId, BonusType.RESEARCH, Math.floor(hero.researchBonus * level), batch);
      await balancePower(kingdomId, Math.floor(hero.power * level), batch);
    }
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not ADD the CONTRACT`, error);
    throw error;
  }
};

/**
 * kingdom break a contract with a hero
 * @param kingdomId
 * @param contractId
 */
export const dischargeContract = async (kingdomId: string, contractId: string): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to DISCHARGE the CONTRACT ${contractId}`);
    const batch = angularFirestore.batch();
    await removeContract(kingdomId, contractId, batch);
    await batch.commit();
    console.log(`KINGDOM ${kingdomId} succesfully DISCHARGES the CONTRACT ${contractId}`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not DISCHARGE the CONTRACT ${contractId}`, error);
    throw error;
  }
};

/**
 * removes a contract
 * @param kingdomId
 * @param contractId
 */
export const removeContract = async (kingdomId: string, contractId: string, batch: FirebaseFirestore.WriteBatch): Promise<void> => {
  try {
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
    } else throw new Error(`CONTRACT ${contractId} does not exists`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not REMOVE the CONTRACT ${contractId}`, error);
    throw error;
  }
};

/**
 * kingdom assigns contract to an assignment
 * @param kingdomId
 * @param contractId
 * @param assignmentId
 */
export const assignContract = async (kingdomId: string, contractId: string, assignmentId: number): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to ASSIGN the CONTRACT ${contractId}`);
    const kingdomContract = (await angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${contractId}`).get()).data();
    if (kingdomContract) {
      const batch = angularFirestore.batch();
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/contracts/${contractId}`), { assignment: assignmentId });
      await batch.commit();
      console.log(`KINGDOM ${kingdomId} succesfully ASSIGNS the CONTRACT ${contractId}`);
    } else throw new Error(`CONTRACT ${contractId} does not exists`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not ASSIGN the CONTRACT ${contractId}`, error);
    throw error;
  }
};

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
export const addCharm = async (kingdomId: string, spell: any, turns: number, batch: FirebaseFirestore.WriteBatch): Promise<void> => {
  try {
    const tree = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data()?.tree;
    const science = searchPerk(tree, 'science');
    // tslint:disable-next-line: no-parameter-reassignment
    if (science) turns = Math.ceil(turns * (1 + (science.researchBonus * science.level) / 100));
    const kingdomCharm = await angularFirestore.collection(`kingdoms/${kingdomId}/charms`).where('id', '==', spell.id).limit(1).get();
    if (kingdomCharm.size > 0) {
      const charm = kingdomCharm.docs[0]?.data();
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/charms/${kingdomCharm.docs[0].id}`), {
        turns: admin.firestore.FieldValue.increment(turns),
        completed: (charm.turns + turns) >= spell.turnResearch,
      });
    } else {
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/charms`).doc(), { id: spell.id, spell: spell, turns: turns, assignment: AssignmentType.NONE, completed: turns >= spell.turnResearch });
    }
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not ADD the CHARM ${spell.id}`, error);
    throw error;
  }
};

/**
 * kingdom researchs charm a given number of turns
 * @param kingdomId
 * @param charmId
 * @param turns
 */
export const researchCharm = async (kingdomId: string, charmId: string, turns: number): Promise<any> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to RESEARCH the CHARM ${charmId}`);
    const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.TURN).limit(1).get()).docs[0].data();
    kingdomTurn.quantity = calculateTurns(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
    if (turns <= kingdomTurn.quantity) {
      const charm = (await angularFirestore.doc(`kingdoms/${kingdomId}/charms/${charmId}`).get()).data();
      const batch = angularFirestore.batch();
      await addSupply(kingdomId, SupplyType.TURN, -turns, batch, kingdomTurn.resource.ratio);
      await addCharm(kingdomId, charm?.spell, turns, batch);
      await batch.commit();
      console.log(`KINGDOM ${kingdomId} succesfully RESEARCHES the CHARM ${charmId} by ${turns} turns`);
      return { turns: turns };
    } else throw new Error(`KINGDOM ${kingdomId} has not enought turns`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not RESEARCH the CHARM ${charmId}`, error);
    throw error;
  }
};

/**
 * assigns a charm into an assignment
 * @param kingdomId
 * @param charmId
 * @param assignmentId
 */
export const assignCharm = async (kingdomId: string, charmId: string, assignmentId: number): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to ASSIGN the CHARM ${charmId}`);
    const charm = (await angularFirestore.doc(`kingdoms/${kingdomId}/charms/${charmId}`).get()).data();
    if (charm && charm.completed) {
      const batch = angularFirestore.batch();
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/charms/${charmId}`), { assignment: assignmentId });
      await batch.commit();
      console.log(`KINGDOM ${kingdomId} succesfully ASSIGNS the CHARM ${charmId}`);
    } else throw new Error('api.error.charm');
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not ASSIGN the CHARM ${charmId}`, error);
    throw error;
  }
};

/**
 * kingdom conjure spell on target kingdom, even on itself
 * @param kingdomId
 * @param charmId
 * @param targetId
 */
export const conjureCharm = async (kingdomId: string, charmId: string, targetId: string): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to CONJURE the CHARM ${charmId}`);
    let result: any = {};
    const charm = (await angularFirestore.doc(`kingdoms/${kingdomId}/charms/${charmId}`).get()).data();
    if (charm) {
      const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.TURN).limit(1).get()).docs[0].data();
      const kingdomMana = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.MANA).limit(1).get()).docs[0].data();
      const turns = calculateTurns(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
      if (charm.completed && charm.spell.turnCost <= turns && charm.spell.manaCost <= kingdomMana.quantity) {
        const batch = angularFirestore.batch();
        await addSupply(kingdomId, SupplyType.TURN, -charm.spell.turnCost, batch, kingdomTurn.resource.ratio);
        await addSupply(kingdomId, SupplyType.MANA, -charm.spell.manaCost, batch);
        switch (charm.spell.subtype) {
          case 'summon': {
            const unit = charm.spell.units[random(0, charm.spell.units.length - 1)];
            const size = random(Math.min(...unit.amount), Math.max(...unit.amount));
            await addTroop(targetId, unit, size, batch);
            result = { unit: `unit.${unit.id}.name`, size: size };
            console.log(`KINGDOM ${kingdomId} succesfully CONJURES ${charm.spell.id} with ${size} ${unit.id}`);
            break;
          }
          case 'item': {
            const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
            const lot = 1;
            await addArtifact(targetId, item, lot, batch);
            result = { item: `item.${item.id}.name`, quantity: lot };
            console.log(`KINGDOM ${kingdomId} succesfully CONJURES ${charm.spell.id} with ${lot} ${item.id}`);
            break;
          }
          case 'enchantment': {
            if (!charm.spell.multiple) {
              await addEnchantment(targetId, charm.spell, kingdomId, charm.spell.turnDuration, batch);
              result = { enchantment: `spell.${charm.spell.id}.name`, turns: charm.spell.turnDuration };
              console.log(`KINGDOM ${kingdomId} succesfully ENCHANTS ${targetId} with ${charm.spell.id}`);
            } else {
              const kingdomEnchantments = await angularFirestore.collection(`kingdoms/${targetId}/enchantments`).listDocuments();
              kingdomEnchantments.map(enchantment => batch.delete(enchantment));
              console.log(`KINGDOM ${kingdomId} succesfully DISENCHANTS ${targetId} enchantments`);
            }
            break;
          }
          case 'espionage': {
            await spyKingdom(kingdomId, targetId, batch);
            console.log(`KINGDOM ${kingdomId} succesfully SPIES ${targetId}`);
            break;
          }
          case 'resource': {
            // TODO
            break;
          }
          case 'armageddon': {
            // this is done in the gods section
            break;
          }
          case 'battle': {
            // this is done in the battle section
            break;
          }
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
        console.log(`KINGDOM ${kingdomId} succesfully CONJURES ${charmId}`);
        return result;
      } else throw new Error(`CHARM ${charmId} cannot be conjured due to lack of resources or incompletedness`);
    } else throw new Error(`CHARM ${charmId} does not exists`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not CONJURE the CHARM ${charmId}`, error);
    throw error;
  }
};

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
export const buyEmporium = async (kingdomId: string, itemId: string): Promise<any> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to BUY ${itemId}`);
    const item = (await angularFirestore.doc(`items/${itemId}`).get()).data();
    if (item) {
      const kingdomGem = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.GEM).limit(1).get()).docs[0].data();
      if (item.gems <= kingdomGem.quantity) {
        const batch = angularFirestore.batch();
        const quantity = 1;
        const data = {
          item: item,
          quantity: quantity,
          gems: item.gems,
        };
        const from = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
        await addLetter(kingdomId, 'kingdom.emporium.subject', 'kingdom.emporium.message', from, batch, data);
        await addSupply(kingdomId, SupplyType.GEM, -item.gems, batch);
        await addArtifact(kingdomId, item, quantity, batch);
        await batch.commit();
        console.log(`KINGDOM ${kingdomId} succesfully BUYS ${itemId}`);
        return { quantity: quantity, item: item.name };
      } else throw new Error(`KINGDOM ${kingdomId} has not enought GEMS`);
    } else throw new Error(`ITEM ${itemId} does not exists`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not BUY the ITEM ${itemId}`, error);
    throw error;
  }
};

/**
 * add artifact to a kingdom
 * @param kingdomId
 * @param itemId
 * @param quantity
 * @param batch
 */
export const addArtifact = async (kingdomId: string, item: any, quantity: number, batch: FirebaseFirestore.WriteBatch): Promise<void> => {
  try {
    const kingdomArtifact = await angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).where('id', '==', item.id).limit(1).get();
    if (kingdomArtifact.size > 0) {
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${kingdomArtifact.docs[0].id}`), { quantity: admin.firestore.FieldValue.increment(quantity) });
    } else {
      batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).doc(), { id: item.id, quantity: quantity, item: item, assignment: AssignmentType.NONE });
    }
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not ADD the ARTIFACT ${item.id}`, error);
    throw error;
  }
};

/**
 * assigns an artifact into an assignment
 * @param kingdomId
 * @param artifactId
 * @param assignmentId
 */
export const assignArtifact = async (kingdomId: string, artifactId: string, assignmentId: number): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to ASSIGN the ARTIFACT ${artifactId}`);
    const batch = angularFirestore.batch();
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${artifactId}`), { assignment: assignmentId });
    await batch.commit();
    console.log(`KINGDOM ${kingdomId} succesfully ASSIGNS ${artifactId}`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not ASSIGN the ARTIFACT ${artifactId}`, error);
    throw error;
  }
};

/**
 * kingdom activates artifacts on target kingdom, even on itself
 * @param kingdomId
 * @param artifactId
 * @param targetId
 */
export const activateArtifact = async (kingdomId: string, artifactId: string, targetId: string): Promise<any> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to ACTIVATE the ARTIFACT ${artifactId} on ${targetId}`);
    let result = {};
    const artifact = (await angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${artifactId}`).get()).data();
    if (artifact && !artifact.item.battle) {
      const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.TURN).limit(1).get()).docs[0].data();
      const max = calculateTurns(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
      if (artifact.quantity > 0 && artifact.item.turns <= max) {
        const batch = angularFirestore.batch();
        await addSupply(kingdomId, SupplyType.TURN, -artifact.item.turns, batch, kingdomTurn.resource.ratio);
        if (artifact.quantity > 1) {
          batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${artifactId}`), { quantity: admin.firestore.FieldValue.increment(-1) });
        } else {
          batch.delete(angularFirestore.doc(`kingdoms/${kingdomId}/artifacts/${artifactId}`));
        }
        switch (artifact.item.subtype) {
          case 'summon': {
            const unit = artifact.item.units[random(0, artifact.item.units.length - 1)];
            const size = random(Math.min(...unit.amount), Math.max(...unit.amount));
            await addTroop(targetId, unit, size, batch);
            result = { unit: `unit.${unit.id}.name`, size: size };
            console.log(`KINGDOM ${kingdomId} succesfully ACTIVATES ${artifact.item.id} on ${targetId} with ${size} ${unit.id}`);
            break;
          }
          case 'resource': {
            const resource = artifact.item.resources[0];
            const amount = random(Math.min(...artifact.item.amount), Math.max(...artifact.item.amount));
            await addSupply(targetId, resource.id, amount, batch, resource.id === SupplyType.TURN ? kingdomTurn.resource.ratio : null);
            result = { resource: `resource.${resource.id}.name`, amount: amount };
            console.log(`KINGDOM ${kingdomId} succesfully ACTIVATES ${artifact.item.id} on ${targetId} with ${amount} ${resource.id}`);
            break;
          }
          case 'enchantment': {
            if (artifact.item.spells.length) {
              const enchantment = artifact.item.spells[random(0, artifact.item.spells.length - 1)];
              await addEnchantment(targetId, enchantment, kingdomId, enchantment.turnDuration, batch);
              result = { enchantment: `spell.${enchantment.id}.name`, turns: enchantment.turnDuration };
              console.log(`KINGDOM ${kingdomId} succesfully ACTIVATES ${artifact.item.id} on ${targetId} with ${enchantment.id}`);
            } else {
              const kingdomEnchantments = await angularFirestore.collection(`kingdoms/${targetId}/enchantments`).listDocuments();
              kingdomEnchantments.map(enchantment => batch.delete(enchantment));
              console.log(`KINGDOM ${kingdomId} succesfully ACTIVATES ${artifact.item.id} on ${targetId}}`);
            }
            break;
          }
          case 'item': {
            const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
            const quantity = 1;
            await addArtifact(targetId, item, quantity, batch);
            result = { item: `item.${item.id}.name`, quantity: quantity };
            console.log(`KINGDOM ${kingdomId} succesfully ACTIVATES ${artifact.item.id} on ${targetId} with ${quantity} ${item.id}`);
            break;
          }
          case 'spell': {
            let spell: any = false;
            let tries: number = 0;
            while (!spell && tries <= 99) {
              spell = (await angularFirestore.collection('spells').where('random', '==', random(0, 99)).limit(1).get()).docs[0].data();
              spell = (await angularFirestore.collection(`kingdoms/${targetId}/charms`).where('spell.id', '==', spell.id).limit(1).get()).empty ? spell : false;
              tries++;
            }
            if (spell) {
              await addCharm(targetId, spell, 0, batch);
              result = { spell: `spell.${spell.id}.name` };
              console.log(`KINGDOM ${kingdomId} succesfully ACTIVATES ${artifact.item.id} on ${targetId} with ${spell.id}`);
            }
            break;
          }
          case 'espionage': {
            await spyKingdom(kingdomId, targetId, batch);
            console.log(`KINGDOM ${kingdomId} succesfully SPIES ${targetId}`);
            break;
          }
          case 'battle': {
            // this is done in the battle section
            break;
          }
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
        console.log(`KINGDOM ${kingdomId} succesfully ACTIVATES ${artifactId}`);
        return result;
      } else throw new Error(`KINGDOM ${kingdomId} has not enought TURNS or QUANTITY`);
    } else throw new Error(`KINGDOM ${kingdomId} does not exists or is only for BATTLES`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not ACTIVATE the ARTIFACT ${artifactId}`, error);
    throw error;
  }
};

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
export const buildStructure = async (kingdomId: string, buildingId: string, quantity: number): Promise<any> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to BUILD the STRUCTURE ${buildingId}`);
    const kingdomBuilding = (await angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${buildingId}`).get()).data();
    if (kingdomBuilding) {
      const batch = angularFirestore.batch();
      const kingdomLand = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.LAND).limit(1).get()).docs[0].data();
      const structure = kingdomBuilding.structure;
      const kingdomWorkshop = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', 'workshop').limit(1).get()).docs[0].data();
      const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.GOLD).limit(1).get()).docs[0].data();
      const resourceTurn = (await angularFirestore.doc(`resources/turn`).get()).data();
      const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.TURN).limit(1).get()).docs[0].data();
      const gold = structure?.goldCost * quantity;
      const turn = Math.ceil(quantity / Math.ceil((kingdomWorkshop.quantity + 1) / structure?.turnRatio));
      const maxTurns = calculateTurns(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), resourceTurn?.max, resourceTurn?.ratio);
      if (quantity > 0 && quantity <= kingdomLand.quantity && gold <= kingdomGold.quantity && turn <= maxTurns) {
        await addSupply(kingdomId, SupplyType.TURN, -turn, batch, resourceTurn?.ratio);
        await addSupply(kingdomId, SupplyType.GOLD, -gold, batch);
        await addSupply(kingdomId, SupplyType.LAND, -quantity, batch);
        if (kingdomBuilding.id === 'node') await addSupply(kingdomId, SupplyType.MANA, 0, batch, 0, (kingdomBuilding.quantity + quantity) * structure?.manaCapacity);
        if (kingdomBuilding.id === 'village') await addSupply(kingdomId, SupplyType.POPULATION, 0, batch, 0, (kingdomBuilding.quantity + quantity) * structure?.populationCapacity);
        await addBuilding(kingdomId, kingdomBuilding.id, quantity, batch);
        await batch.commit();
        console.log(`KINGDOM ${kingdomId} succesfully BUILDS the ${buildingId}`);
        return { quantity: quantity, structure: structure?.name };
      } else throw new Error(`KINGDOM ${kingdomId} has not enought resources`);
    } else throw new Error(`BUILDING ${buildingId} doest not exists`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not BUILD ${buildingId}`, error);
    throw error;
  }
};

/**
 * kingdom demolishes a structure
 * @param kingdomId
 * @param buildingId
 * @param quantity
 */
export const demolishStructure = async (kingdomId: string, buildingId: string, quantity: number): Promise<any> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to DEMOLISH the STRUCTURE ${buildingId}`);
    const kingdomBuilding = (await angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${buildingId}`).get()).data();
    if (kingdomBuilding) {
      if (quantity > 0 && quantity <= kingdomBuilding.quantity) {
        const batch = angularFirestore.batch();
        await addBuilding(kingdomId, kingdomBuilding.id, -quantity, batch);
        await addSupply(kingdomId, SupplyType.LAND, quantity, batch);
        await batch.commit();
        console.log(`KINGDOM ${kingdomId} succesfully BUILDS ${quantity} ${buildingId}`);
        return { quantity: quantity, structure: kingdomBuilding.structure.name };
      } else throw new Error(`KINGDOM ${kingdomId} has not enought ${buildingId}`);
    } else throw new Error(`BUILDING ${buildingId} doest not exists`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not DEMOLISH ${buildingId}`, error);
    throw error;
  }
};

/**
 * add building to kingdom
 * @param kingdomId
 * @param structureId
 * @param quantity
 * @param batch
 */
export const addBuilding = async (kingdomId: string, buildingId: string, quantity: number, batch: FirebaseFirestore.WriteBatch): Promise<void> => {
  try {
    const kingdomBuilding = (await angularFirestore.collection(`kingdoms/${kingdomId}/buildings`).where('id', '==', buildingId).limit(1).get()).docs[0];
    if (kingdomBuilding) {
      const building = kingdomBuilding.data();
      if (quantity >= 0) {
        const tree = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data()?.tree;
        const architecture = searchPerk(tree, 'architecture');
        // tslint:disable-next-line: no-parameter-reassignment
        if (architecture) quantity = Math.ceil(quantity * (1 + (architecture.constructionBonus * architecture.level) / 100));
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
      const stack = building.quantity + quantity <= 0 ? 0 : admin.firestore.FieldValue.increment(quantity);
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/buildings/${kingdomBuilding.id}`), { quantity: stack });
    } else throw new Error(`BUILDING ${buildingId} does not exists`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not ADD the BUILDING ${buildingId}`, error);
    throw error;
  }
};

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
export const addLetter = async (kingdomId: string, subject: string, message: string, from: any, batch: FirebaseFirestore.WriteBatch, data?: any): Promise<void> => {
  try {
    batch.create(angularFirestore.collection(`kingdoms/${kingdomId}/letters`).doc(), {
      to: kingdomId,
      subject: subject,
      message: message,
      data: data,
      timestamp: admin.firestore.Timestamp.now(),
      from: from,
      read: false,
    });
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not ADD the LETTER`, error);
    throw error;
  }
};

/**
 * sends letter
 * @param kingdomId
 * @param subject
 * @param message
 * @param fromId
 */
export const sendLetter = async (kingdomId: string, subject: string, message: string, fromId: string): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to SEND the LETTER`);
    const batch = angularFirestore.batch();
    const from = (await angularFirestore.doc(`kingdoms/${fromId}`).get()).data();
    await addLetter(kingdomId, subject, message, from, batch, null);
    await batch.commit();
    console.log(`KINGDOM ${kingdomId} succesfully SENDS the LETTER`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not SEND the LETTER`, error);
    throw error;
  }
};

/**
 * mark letter as read
 * @param kingdomId
 * @param letterId
 */
export const readLetter = async (kingdomId: string, letterId: string): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to READ the LETTER ${letterId}`);
    await angularFirestore.doc(`kingdoms/${kingdomId}/letters/${letterId}`).update({ read: true });
    console.log(`KINGDOM ${kingdomId} succesfully READS the LETTER`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not READ the LETTER ${letterId}`, error);
    throw error;
  }
};

/**
 * remove array of letters
 * @param kingdomId
 * @param letterIds
 */
export const removeLetters = async (kingdomId: string, letterIds: string[]): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to REMOVE the LETTERS`);
    const batch = angularFirestore.batch();
    letterIds.forEach(letterId => {
      batch.delete(angularFirestore.doc(`kingdoms/${kingdomId}/letters/${letterId}`));
    });
    await batch.commit();
    console.log(`KINGDOM ${kingdomId} tries to REMOVE the LETTERS`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not REMOVE the LETTERS`, error);
    throw error;
  }
};

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
export const checkShop = async (fid?: string, latitude?: number, longitude?: number, type?: StoreType, name?: string): Promise<void> => {
  try {
    console.log(`SHOP ${fid} tries to CHECK for refresh`);
    let update = false;
    const batch = angularFirestore.batch();
    const visited = moment(admin.firestore.Timestamp.now().toMillis()).add(VISITATION_TIME, 'seconds');
    const geopoint =  latitude && longitude ? geofirex.point(latitude, longitude) : null;
    // tslint:disable-next-line: no-parameter-reassignment
    if (!fid) fid = geopoint.geohash;
    const shop = (await angularFirestore.doc(`shops/${fid}`).get()).data();
    if (shop) {
      if (moment().isAfter(moment(shop.visited.toMillis()))) {
        batch.update(angularFirestore.doc(`shops/${fid}`), { visited: visited });
        update = true;
      }
    } else {
      const store = (await angularFirestore.doc(`stores/${type}`).get()).data();
      batch.create(angularFirestore.doc(`shops/${fid}`), { store: store, position: geopoint, coordinates: { latitude: latitude, longitude: longitude }, name: name, visited: visited, type: type });
      update = true;
    }
    if (update) {
      switch (type) {
        case StoreType.INN: {
          const innContracts = await angularFirestore.collection(`shops/${fid}/contracts`).listDocuments();
          innContracts.map(contract => batch.delete(contract));
          const hero = (await angularFirestore.collection('heroes').where('random', '==', random(0, 19)).limit(1).get()).docs[0].data();
          const level = random(1, 10);
          batch.create(angularFirestore.collection(`shops/${fid}/contracts`).doc(), { id: hero.id, hero: hero, gold: 1000000 * level, level: level });
          break;
        }
        case StoreType.MERCENARY: {
          const mercenaryTroops = await angularFirestore.collection(`shops/${fid}/troops`).listDocuments();
          mercenaryTroops.map(troop => batch.delete(troop));
          const unit = (await angularFirestore.collection('units').where('random', '==', random(0, 64)).limit(1).get()).docs[0].data();
          const quantity = random(Math.min(...unit.amount), Math.max(...unit.amount));
          batch.create(angularFirestore.collection(`shops/${fid}/troops`).doc(), { id: unit.id, unit: unit, gold: 1000000 + (quantity * unit.power), quantity: quantity });
          break;
        }
        case StoreType.MERCHANT: {
          const merchantArtifacts = await angularFirestore.collection(`shops/${fid}/artifacts`).listDocuments();
          merchantArtifacts.map(artifact => batch.delete(artifact));
          const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
          const lot = random(1, 3);
          batch.create(angularFirestore.collection(`shops/${fid}/artifacts`).doc(), { id: item.id, item: item, gold: 1000000 * lot, quantity: lot });
          break;
        }
        case StoreType.SORCERER: {
          const sorcererCharms = await angularFirestore.collection(`shops/${fid}/charms`).listDocuments();
          sorcererCharms.map(charm => batch.delete(charm));
          const spell = (await angularFirestore.collection('spells').where('random', '==', random(0, 99)).limit(1).get()).docs[0].data();
          batch.create(angularFirestore.collection(`shops/${fid}/charms`).doc(), { id: spell.id, spell: spell, gold: 1000000 * spell.level });
          break;
        }
      }
    }
    await batch.commit();
    console.log(`SHOP ${fid} succesfully CHECKS for refresh`);
  } catch (error) {
    console.error(`SHOP ${fid} could not CHECK for refresh`, error);
    throw error;
  }
};

/**
 * kingdom buys a deal from a shop
 * @param kingdomId
 * @param shopId
 * @param collectionId
 * @param dealId
 */
export const tradeDeal = async (kingdomId: string, shopId: string, collectionId: string, dealId: string): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to TRADE ${shopId} ${collectionId} ${dealId}`);
    const worldDeal = (await angularFirestore.doc(`shops/${shopId}/${collectionId}/${dealId}`).get()).data();
    if (worldDeal) {
      const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.GOLD).limit(1).get()).docs[0].data();
      if (worldDeal.gold <= kingdomGold.quantity) {
        const batch = angularFirestore.batch();
        await addSupply(kingdomId, SupplyType.GOLD, -worldDeal.gold, batch);
        let data = {};
        switch (collectionId) {
          case 'troops': {
            data = {
              unit: worldDeal.unit,
              quantity: worldDeal.quantity,
            };
            await addTroop(kingdomId, worldDeal.unit, worldDeal.quantity, batch);
            break;
          }
          case 'contracts': {
            data = {
              hero: worldDeal.hero,
              level: worldDeal.level,
            };
            await addContract(kingdomId, worldDeal.hero, worldDeal.level, batch);
            break;
          }
          case 'charms': {
            data = {
              spell: worldDeal.spell,
              level: 0,
            };
            await addCharm(kingdomId, worldDeal.spell, 0, batch);
            break;
          }
          case 'artifacts': {
            data = {
              item: worldDeal.item,
              quantity: worldDeal.quantity,
            };
            await addArtifact(kingdomId, worldDeal.item, worldDeal.quantity, batch);
            break;
          }
        }
        const from = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
        await addLetter(kingdomId, 'world.deal.subject', 'world.deal.message', from, batch, data);
        await batch.commit();
        await checkShop(shopId);
        console.log(`KINGDOM ${kingdomId} succesfully TRADES ${shopId} ${collectionId} ${dealId}`);
      } else throw new Error(`KINGDOM ${kingdomId} has not enought GOLD`);
    } else throw new Error(`DEAL ${dealId} does not exists`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} succesfully TRADES ${shopId} ${collectionId} ${dealId}`, error);
    throw error;
  }
};

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
export const checkQuest = async (fid?: string, latitude?: number, longitude?: number, type?: LocationType, name?: string): Promise<void> => {
  try {
    console.log(`QUEST ${fid} tries to CHECK for refresh`);
    let update = false;
    const batch = angularFirestore.batch();
    const visited = moment(admin.firestore.Timestamp.now().toMillis()).add(VISITATION_TIME, 'seconds');
    const geopoint = latitude && longitude ? geofirex.point(latitude, longitude) : null;
    // tslint:disable-next-line: no-parameter-reassignment
    if (!fid) fid = geopoint.geohash;
    const quest = (await angularFirestore.doc(`quests/${fid}`).get()).data();
    if (quest) {
      if (moment().isAfter(moment(quest?.visited.toMillis()))) {
        batch.update(angularFirestore.doc(`quests/${fid}`), { visited: visited, turns: random(1, 3) });
        update = true;
      }
    } else {
      const location = (await angularFirestore.doc(`locations/${type}`).get()).data();
      batch.create(angularFirestore.doc(`quests/${fid}`), { location: location, position: geopoint, coordinates: { latitude: latitude, longitude: longitude }, name: name, turns: random(1, 3), visited: visited, type: type });
      update = true;
    }
    if (update) {
      const questContracts = await angularFirestore.collection(`quests/${fid}/contracts`).listDocuments();
      questContracts.map((contract: any) => batch.delete(contract));
      const questTroops = await angularFirestore.collection(`quests/${fid}/troops`).listDocuments();
      questTroops.map((troop: any) => batch.delete(troop));
      const questArtifacts = await angularFirestore.collection(`quests/${fid}/artifacts`).listDocuments();
      questArtifacts.map((artifact: any) => batch.delete(artifact));
      let questHeroes: string[] = [];
      let questUnits: string[] = [];
      let questItems: string[] = [];
      const legendaries: string[] = ['enchanted-lamp', 'wisdom-tome', 'dragon-egg', 'voodoo-doll', 'cursed-skull', 'cursed-mask', 'cursed-idol', 'lucky-coin', 'lucky-horseshoe', 'lucky-paw', 'magic-compass', 'rattle', ];
      const items: string[] = ['treasure-chest', 'necronomicon', 'enchanted-lamp', 'wisdom-tome', 'demon-horn', 'lightning-orb', 'dragon-egg', 'crystal-ball', 'agility-potion', 'defense-potion', 'cold-orb', 'earth-orb', 'fire-orb', 'mana-potion', 'light-orb', 'strength-potion', 'love-potion', 'spider-web', 'animal-fang', 'bone-necklace', 'crown-thorns', 'voodoo-doll', 'cursed-skull', 'cursed-mask', 'cursed-idol', 'golem-book', 'letter-thieves', 'lucky-coin', 'lucky-horseshoe', 'lucky-paw', 'magic-beans', 'magic-compass', 'mana-vortex', 'rattle', 'rotten-food', 'snake-eye', 'treasure-map', 'valhalla-horn', 'fairy-wings', 'vampire-teeth', 'holy-grenade', 'powder-barrel', 'vial-venom', 'ancient-rune', 'ice-stone', 'fire-scroll', 'cold-scroll', 'light-scroll', 'earth-scroll', 'lightning-scroll'];
      const demon = ['nightmare', 'medusa', 'cyclop', 'minotaur', 'devil', 'ogre'];
      const undead = ['wraith', 'bone-dragon', 'nightmare', 'ghoul', 'lich', 'skeleton', 'vampire', 'werewolf', 'zombie'];
      const golem = ['iron-golem', 'stone-golem', 'meat-golem', 'wood-golem', 'crystal-golem'];
      const orkish = ['cave-troll', 'centaur', 'druid', 'ogre', 'orc'];
      const elemental = ['lightning-elemental', 'djinni', 'ice-elemental', 'earth-elemental', 'fire-elemental', 'phoenix', 'light-elemental', 'air-elemental', 'water-elemental'];
      const giant = ['frost-giant', 'leviathan', 'yeti', 'spider', 'carnivorous-plant', 'hydra', 'cyclop', 'ogre', 'titan'];
      const dragon = ['bone-dragon', 'blue-dragon', 'golden-dragon', 'hydra', 'red-dragon', 'behemoth', 'white-dragon', 'baby-dragon'];
      const animal = ['werewolf', 'spider', 'centaur', 'elf', 'werebear', 'carnivorous-plant', 'griffon', 'pegasus', 'cavalry', 'sheep', 'trained-elephant'];
      const reptile = ['siren', 'medusa', 'leviathan', 'lizardman', 'hydra'];
      const human = ['werewolf', 'siren', 'mage', 'lizardman', 'elf', 'werebear', 'druid', 'berserker', 'angel', 'knight', 'monk', 'templar', 'pegasus', 'paladin', 'cavalry', 'fanatic', 'pikeman', 'fighter', 'archer', 'sheep'];
      switch (type) {
        case LocationType.VOLCANO:
          questHeroes = ['demon-prince', 'pyromancer'];
          questUnits = demon;
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.DUNGEON:
          questHeroes = ['necrophage', 'golem-golem'];
          questUnits = undead.concat(golem);
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.CAVE:
          questHeroes = ['orc-king', 'illusionist'];
          questUnits = orkish;
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.MINE:
          questHeroes = ['elementalist'];
          questUnits = elemental;
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.MOUNTAIN:
          questHeroes = ['golem-golem', 'colossus'];
          questUnits = giant;
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.RUIN:
          questHeroes = ['golem-golem', 'demon-prince', 'pyromancer'];
          questUnits = giant.concat(demon);
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.MONOLITH:
          questHeroes = ['golem-golem'];
          questUnits = giant.concat(golem);
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.PYRAMID:
          questHeroes = ['necrophage', 'soul-reaper'];
          questUnits = undead;
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.SHRINE:
          questHeroes = ['necrophage', 'dragon-rider'];
          questUnits = elemental.concat(dragon);
          questItems = legendaries;
        case LocationType.FOREST:
          questHeroes = ['beast-master', 'swamp-thing'];
          questUnits = animal.concat(reptile);
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.LAKE:
          questHeroes = ['beast-master', 'illusionist'];
          questUnits = reptile;
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.SHIP:
          questHeroes = ['beast-master'];
          questUnits = reptile;
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.NEST:
          questHeroes = ['dragon-rider'];
          questUnits = dragon;
          questItems = legendaries;
          break;
        case LocationType.TOTEM:
          questHeroes = ['orc-king', 'golem-golem'];
          questUnits = orkish.concat(giant);
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.CATHEDRAL:
          questHeroes = ['commander', 'colossus'];
          questUnits = human;
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.CASTLE:
          questHeroes = ['commander', 'dragon-rider'];
          questUnits = human.concat(dragon);
          questItems = legendaries;
          break;
        case LocationType.BARRACK:
          questHeroes = ['commander'];
          questUnits = human;
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.ISLAND:
          questHeroes = ['beast-master', 'swamp-thing'];
          questUnits = animal.concat(reptile);
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.GRAVEYARD:
          questHeroes = ['necrophage', 'soul-reaper'];
          questUnits = undead;
          questItems = _.difference(items, legendaries);
          break;
        case LocationType.TOWN:
          questHeroes = ['necrophage', 'commander'];
          questUnits = undead.concat(human);
          questItems = _.difference(items, legendaries);
          break;
      }
      // shuffle
      questHeroes = _.shuffle(questHeroes);
      questUnits = _.shuffle(questUnits);
      questItems = _.shuffle(questItems);
      for (const i of [0]) {
        const hero = (await angularFirestore.doc(`heroes/${questHeroes[i]}`).get()).data();
        batch.create(angularFirestore.collection(`quests/${fid}/contracts`).doc(), { id: hero?.id, hero: hero, level: random(1, 20), assignment: AssignmentType.DEFENSE });
      }
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
    console.log(`QUEST ${fid} succesfully CHECKS for refresh`);
  } catch (error) {
    console.error(`QUEST ${fid} could not CHECK for refresh`, error);
    throw error;
  }
};

/**
 * kingdom adventures on a quest
 * @param kingdomId
 * @param questId
 */
export const adventureQuest = async (kingdomId: string, questId: string): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to ADVENTURE ${questId}`);
    const defenderQuest = (await angularFirestore.doc(`quests/${questId}`).get()).data();
    if (defenderQuest) {
      const attackerTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.TURN).limit(1).get()).docs[0].data();
      attackerTurn.quantity = calculateTurns(attackerTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), attackerTurn.resource.max, attackerTurn.resource.ratio);
      if (defenderQuest.turns <= attackerTurn.quantity) {
        // attacker
        const attackerKingdom = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get());
        const attackerKingdomTree = attackerKingdom.data()?.tree;
        const attackerKingdomGuild = attackerKingdom.data()?.guild;
        const attackerKingdomContracts = (await angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).where('assignment', '==', AssignmentType.ATTACK).limit(3).get()).docs.map(contract => ({ ...contract.data(), fid: contract.id }));
        const attackerKingdomTroops = (await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).where('assignment', '==', AssignmentType.ATTACK).orderBy('sort', 'asc').limit(5).get()).docs.map(troop => ({ ...troop.data(), fid: troop.id, initialQuantity: troop.data().quantity }));
        const attackerKingdomArtifacts = (await angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).where('assignment', '==', AssignmentType.ATTACK).limit(1).get()).docs.map(artifact => ({ ...artifact.data(), fid: artifact.id }));
        const attackerKingdomCharms = (await angularFirestore.collection(`kingdoms/${kingdomId}/charms`).where('assignment', '==', AssignmentType.ATTACK).limit(1).get()).docs.map(charm => ({ ...charm.data(), fid: charm.id }));
        // defender
        const defenderQuestContracts = (await angularFirestore.collection(`quests/${questId}/contracts`).where('assignment', '==', AssignmentType.DEFENSE).limit(1).get()).docs.map(contract => ({ ...contract.data(), fid: contract.id }));
        const defenderQuestTroops = (await angularFirestore.collection(`quests/${questId}/troops`).where('assignment', '==', AssignmentType.DEFENSE).orderBy('sort', 'asc').limit(3).get()).docs.map(troop => ({ ...troop.data(), fid: troop.id, initialQuantity: troop.data().quantity }));
        const defenderQuestArtifact = (await angularFirestore.collection(`quests/${questId}/artifacts`).where('assignment', '==', AssignmentType.NONE).limit(1).get()).docs[0].data();
        // battle
        if (attackerKingdomTroops.length && defenderQuestTroops.length) {
          const report: BattleReport = {
            attackerPowerLost: 0,
            defenderPowerLost: 0,
            victory: false,
            logs: [],
          };
          const batch = angularFirestore.batch();
          await resolveBattle(
            attackerKingdomTree,
            attackerKingdomGuild,
            attackerKingdomContracts,
            attackerKingdomTroops,
            attackerKingdomArtifacts,
            attackerKingdomCharms,
            null,
            null,
            defenderQuestContracts,
            defenderQuestTroops,
            [],
            [],
            BattleType.ADVENTURE,
            report,
            kingdomId,
            batch,
            undefined,
            questId,
          );
          await addSupply(kingdomId, SupplyType.TURN, -defenderQuest.turns, batch);
          const data: any = {
            logs: report.logs,
          };
          if (report.victory) {
            data.item = defenderQuestArtifact.item;
            data.quantity = defenderQuestArtifact.quantity;
            await addArtifact(kingdomId, defenderQuestArtifact.item, defenderQuestArtifact.quantity, batch);
            await addSupply(kingdomId, SupplyType.GEM, QUEST_GEMS, batch);
            await checkQuest(questId);
          }
          const from = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
          await addLetter(kingdomId, 'world.adventure.subject', report.victory ? 'world.adventure.victory' : 'world.adventure.defeat', from, batch, data);
          await batch.commit();
          console.log(`KINGDOM ${kingdomId} succesfully ADVENTURES ${questId}`);
        } else throw new Error(`KINGDOM ${kingdomId} has no TROOPS`);
      } else throw new Error(`KINGDOM ${kingdomId} has not enought TURNS`);
    } else throw new Error(`QUEST ${questId} does not exists`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not ADVENTURE ${questId}`, error);
    throw error;
  }
};

//========================================================================================
/*                                                                                      *
 *                                         MAPS                                         *
 *                                                                                      */
//========================================================================================

/**
 * player scans the map by given coordinates and radius
 * @param latitude
 * @param longitude
 * @param radius
 */
export const scanMap = async (latitude: number, longitude: number, radius: number): Promise<any> => {
  try {
    const elements: any[] = [
      // shops
      { type: MarkerType.SHOP, subtype: StoreType.INN, query: '[building=hotel]', radius: 2000 },
      { type: MarkerType.SHOP, subtype: StoreType.MERCENARY, query: '[amenity=police]', radius: 5000 },
      { type: MarkerType.SHOP, subtype: StoreType.SORCERER, query: '[building=university]', radius: 2000 },
      { type: MarkerType.SHOP, subtype: StoreType.MERCHANT, query: '[shop=mall]', radius: 5000 },
      // quests
      { type: MarkerType.QUEST, subtype: LocationType.GRAVEYARD, query: '[landuse=cemetery]', radius: 5000 },
      { type: MarkerType.QUEST, subtype: LocationType.LAKE, query: '[sport=swimming]', radius: 5000 },
      { type: MarkerType.QUEST, subtype: LocationType.FOREST, query: '[leisure=park]', radius: 1000 },
      { type: MarkerType.QUEST, subtype: LocationType.CATHEDRAL, query: '[building=church]', radius: 2000 },
      { type: MarkerType.QUEST, subtype: LocationType.RUIN, query: '[historic=monument]', radius: 2000 },
      { type: MarkerType.QUEST, subtype: LocationType.TOWN, query: '[place=village]', radius: 10000 },
      { type: MarkerType.QUEST, subtype: LocationType.CASTLE, query: '[amenity=townhall]', radius: 5000 },
      { type: MarkerType.QUEST, subtype: LocationType.CAVE, query: '[amenity=bus_station]', radius: 5000 },
      { type: MarkerType.QUEST, subtype: LocationType.DUNGEON, query: '[amenity=post_office]', radius: 5000 },
      { type: MarkerType.QUEST, subtype: LocationType.VOLCANO, query: '[amenity=fire_station]', radius: 10000 },
      { type: MarkerType.QUEST, subtype: LocationType.PYRAMID, query: '[amenity=bank]', radius: 1000 },
      { type: MarkerType.QUEST, subtype: LocationType.NEST, query: '[aeroway=terminal]', radius: 50000 },
      { type: MarkerType.QUEST, subtype: LocationType.BARRACK, query: '[landuse=military]', radius: 50000 },
      { type: MarkerType.QUEST, subtype: LocationType.SHRINE, query: '[leisure=sports_centre]', radius: 2000 },
      { type: MarkerType.QUEST, subtype: LocationType.SHIP, query: '[waterway=dock]', radius: 5000 },
      { type: MarkerType.QUEST, subtype: LocationType.ISLAND, query: '[water=river]', radius: 5000 },
      { type: MarkerType.QUEST, subtype: LocationType.MINE, query: '[tourism=museum]', radius: 2000 },
      { type: MarkerType.QUEST, subtype: LocationType.MONOLITH, query: '[amenity=library]', radius: 5000 },
      { type: MarkerType.QUEST, subtype: LocationType.TOTEM, query: '[amenity=place_of_worship]', radius: 2000 },
      { type: MarkerType.QUEST, subtype: LocationType.MOUNTAIN, query: '[amenity=cinema]', radius: 5000 },
    ];
    const bounds: mapboxgl.LngLatBounds = new mapboxgl.LngLat(longitude, latitude).toBounds(radius);
    let query = '[out:json][timeout:300][bbox];\n';
    elements.forEach((e: any) => query += `nwr${e.query};convert nwr ::geom=center(geom()),::=::,type="${e.type}",subtype="${e.subtype}";out center;\n`);
    const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
    const overpass = new URLSearchParams();
    overpass.set('data', query);
    overpass.set('bbox', bbox);
    const response: any = await axios.default.post('http://overpass-api.de/api/interpreter', overpass.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response;
  } catch (error) {
    console.error(`MAP could not be SCANNED`, error);
    throw error;
  }
};

/**
 * player draws the map given the points
 * @param points
 */
export const drawMap = async (points: any[]): Promise<void> => {
  try {
    const groups = _.groupBy(points.filter((e: any) => e.geometry && e.geometry.coordinates && e.tags && e.tags.name), (e: any) => e.tags.subtype);
    for (const group of Object.keys(groups)) {
      for (const element of groups[group].slice(0, 1)) {
        switch (element.tags.type) {
          case (MarkerType.SHOP):
            await checkShop(undefined, element.geometry.coordinates[1], element.geometry.coordinates[0], element.tags.subtype, element.tags.name);
            break;
          case (MarkerType.QUEST):
            await checkQuest(undefined, element.geometry.coordinates[1], element.geometry.coordinates[0], element.tags.subtype, element.tags.name);
            break;
        }
      }
    }
  } catch (error) {
    console.error(`MAP could not be DRAWN`, error);
    throw error;
  }
};

/**
 * player populates the map by given coordinates
 * @param latitude
 * @param longitude
 */
export const populateMap = async (latitude: number, longitude: number): Promise<void> => {
  try {
    console.log(`MAP tries to POPULATE in [${latitude}, ${longitude}]`);
    const points = await scanMap(latitude, longitude, MAP_RADIUS);
    await drawMap(points.data.elements);
    console.log(`MAP succesfully POPULATES in [${latitude}, ${longitude}]`);
  } catch (error) {
    console.error(`MAP could not be POPULATED in [${latitude}, ${longitude}]`, error);
    throw error;
  }
};

//========================================================================================
/*                                                                                      *
 *                                        BATTLES                                       *
 *                                                                                      */
//========================================================================================

/**
 * applies a guild over troops
 * @param guild
 * @param targets
 */
const applyGuild = (guild: any, targets: any[]): void => {
  targets.forEach((troop: any): void => {
    if (guild) {
      troop.unit.attackBonus = (troop.unit.attackBonus || 0) + guild.attackBonus;
      troop.unit.healthBonus = (troop.unit.healthBonus || 0) + guild.healthBonus;
      troop.unit.defenseBonus = (troop.unit.defenseBonus || 0) + guild.defenseBonus;
    }
  });
};

/**
 * applies guilds over troops
 * @param attackerTroops
 * @param attackerGuild
 * @param defenderTroops
 * @param defenderGuild
 */
export const applyGuilds = (
  attackerTroops: any[],
  attackerGuild: any,
  defenderTroops: any[],
  defenderGuild: any,
): void => {
  if (attackerGuild) applyGuild(attackerGuild, attackerTroops);
  if (defenderGuild) applyGuild(defenderGuild, defenderTroops);
};

/**
 * applies a tree over the targets
 * @param tree
 * @param targets
 */
const applyTree = (tree: any, targets: any[]): void => {
  const metallurgy = searchPerk(tree, 'metallurgy');
  const medicine = searchPerk(tree, 'medicine');
  const forge = searchPerk(tree, 'forge');
  targets.forEach(troop => {
    if (metallurgy) troop.unit.attackBonus = (troop.unit.attackBonus || 0) + metallurgy.attackBonus * metallurgy.level;
    if (medicine) troop.unit.healthBonus = (troop.unit.healthBonus || 0) + medicine.healthBonus * medicine.level;
    if (forge) troop.unit.defenseBonus = (troop.unit.defenseBonus || 0) + forge.defenseBonus * forge.level;
  });
};

/**
 * applies trees in battle
 * @param attackerTroops
 * @param attackerTree
 * @param defenderTroops
 * @param defenderTree
 */
export const applyTrees = (
  attackerTroops: any[],
  attackerTree: any,
  defenderTroops: any[],
  defenderTree: any,
): void => {
  if (attackerTree) applyTree(attackerTree, attackerTroops);
  if (defenderTree) applyTree(defenderTree, defenderTroops);
};

/**
 * applies an artifact over the targets
 * @param artifact
 * @param targets
 * @param targetType
 * @param balance
 */
const applyArtifact = (artifact: any, targets: any[], targetType: TargetType, report: BattleReport): void => {
  // skills
  if (artifact.item.skills.length) {
    if (artifact.item.multiple) {
      targets.forEach(troop => {
        artifact.item.skills.forEach((skill: any): void => {
          if (!troop.unit.skills.find((ski: any) => ski.id === skill.id)) {
            troop.unit.skills.push(skill);
          }
        });
      });
    } else {
      const randomIndex = random(0, targets.length - 1);
      artifact.item.skills.forEach((skill: any): void => {
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
        artifact.item.resistances.forEach((resistance: any): void => {
          if (!troop.unit.resistances.find((res: any) => res.id === resistance.id)) {
            troop.unit.resistances.push(resistance);
          }
        });
      });
    } else {
      const randomIndex = random(0, targets.length - 1);
      artifact.item.resistances.forEach((resistance: any): void => {
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
};

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
): void => {
  attackerArtifacts.forEach((artifact: any): void => {
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
  defenderArtifacts.forEach((artifact: any): void => {
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
};

/**
 * applies a charm on a target
 * @param charm
 * @param targets
 * @param targetType
 * @param report
 */
const applyCharm = (charm: any, targets: any[], targetType: TargetType, report: BattleReport): void => {
  // skills
  if (charm.spell.skills.length) {
    if (charm.spell.multiple) {
      targets.forEach(troop => {
        charm.spell.skills.forEach((skill: any): void => {
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
      charm.spell.skills.forEach((skill: any): void => {
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
        charm.spell.resistances.forEach((resistance: any): void => {
          if (!troop.unit.resistances.find((res: any) => res.id === resistance.id)) {
            troop.unit.resistances.push(resistance);
          }
        });
      });
    } else {
      const randomIndex = random(0, targets.length - 1);
      charm.spell.resistances.forEach((resistance: any): void => {
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
  // special case sheeps
  if (charm.spell.units.length && charm.spell.units[0] && charm.spell.units[0].id === 'sheep') {
    const sheep = charm.spell.units[0];
    const randomIndex = random(0, targets.length - 1);
    targets[randomIndex].unit = sheep;
  }
};

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
): void => {
  attackerCharms.forEach((charm: any): void => {
    if (charm.spell.battle) {
      // TODO
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
  defenderCharms.forEach((charm: any): void => {
    if (charm.spell.battle) {
      // TODO
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
};

/**
 * applies a contract over targets
 * @param contract
 * @param targets
 * @param targetType
 * @param report
 */
const applyContract = (contract: any, targets: any[], targetType: TargetType, report: BattleReport): void => {
  if (contract.hero.self) {
    // bonuses
    if (contract.hero.families.length) {
      contract.hero.families.forEach((family: any): void => {
        targets.forEach(target => {
          target.unit.families.forEach((f: any): void => {
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
        powerLost += targetCasualties * defenderTroop.unit.power;
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
};

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
): void => {
  attackerContracts.forEach((contract: any): void => {
    if (contract.hero.battle) {
      if (contract.hero.self) applyContract(contract, attackerTroops, TargetType.ATTACKER, report);
      else applyContract(contract, defenderTroops, TargetType.DEFENDER, report);
    }
  });
  defenderContracts.forEach((contract: any): void => {
    if (contract.hero.battle) {
      if (contract.hero.self) applyContract(contract, defenderTroops, TargetType.DEFENDER, report);
      else applyContract(contract, attackerTroops, TargetType.ATTACKER, report);
    }
  });
};

/**
 * applies skill
 * @param troops
 */
const applySkill = (
  troop: any,
): void => {
  // skills
  troop.unit.skills.forEach((skill: any): void => {
    troop.unit.attackBonus = (troop.unit.attackBonus || 0) + skill.attackBonus;
    troop.unit.defenseBonus = (troop.unit.defenseBonus || 0) + skill.defenseBonus;
    troop.unit.healthBonus = (troop.unit.healthBonus || 0) + skill.healthBonus;
    troop.unit.initiativeBonus = (troop.unit.initiativeBonus || 0) + skill.initiativeBonus;
  });
  // categories
  troop.unit.categories.forEach((category: any): void => {
    // TODO
  });
  // resistances
  troop.unit.resistances.forEach((category: any): void => {
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
};

/**
 * applies skills on troops
 * @param attackerTroops
 * @param defenderTroops
 * @param report
 */
export const applySkills = (
  attackerTroops: any[],
  defenderTroops: any[],
): void => {
  attackerTroops.forEach((troop: any): void => {
    applySkill(troop);
  });
  defenderTroops.forEach((troop: any): void => {
    applySkill(troop);
  });
};

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
};

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
): number => {
  const casualties = Math.max(0, Math.min(defenderTroop.quantity, Math.floor((damage * attackerTroop.quantity - defenderTroop.unit.defenseWave * defenderTroop.quantity) / defenderTroop.unit.healthWave)));
  return casualties;
};

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
): void => {
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
  if (attackerTroop.unit.initiativeWave >= (defenderTroop.unit.initiativeWave + (battleType === BattleType.SIEGE ? 1 : 0))) { // SIEGE initiative defense bonus
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
};

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
): Promise<void> => {
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
};

/**
 * resolves a battle
 * @param attackerTroops
 * @param defenderArmy
 * @param batch
 */
export const resolveBattle = async (
  attackerTree: any,
  attackerGuild: any,
  attackerContracts: any[],
  attackerTroops: any[],
  attackerArtifacts: any[],
  attackerCharms: any[],
  defenderTree: any,
  defenderGuild: any,
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
  try {
    let discovered = true;
    if (defenderId) {
      discovered = random(0, 100) <= 100;
    }
    if (defenderTroops.length <= 0 || (battleType === BattleType.PILLAGE && !discovered)) {
      report.victory = true; // pillage undetected, instant victory
    } else {
      // trees
      applyTrees(attackerTroops, attackerTree, defenderTroops, defenderTree);
      // guilds
      applyGuilds(attackerTroops, attackerGuild, defenderTroops, defenderGuild);
      // artifacts
      applyArtifacts(attackerTroops, attackerArtifacts, defenderTroops, defenderArtifacts, report);
      // charms
      applyCharms(attackerTroops, attackerCharms, defenderTroops, defenderCharms, report);
      // contracts
      applyContracts(attackerTroops, attackerContracts, defenderTroops, defenderContracts, report);
      // skills
      applySkills(attackerTroops, defenderTroops);
      // waves
      await applyWaves(attackerTroops, defenderTroops, battleType, report, attackerId, batch, defenderId, questId);
      // victory conditions
      switch (battleType) {
        // pillage is a normal attack if detected
        case BattleType.PILLAGE:
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
  } catch (error) {
    console.error(`BATTLE beween ${attackerId} and ${defenderId} could not be resolved`, error);
    throw error;
  }
};

/**
 * kingdom attacks another kingdom with a battle type
 * @param kingdomId
 * @param targetId
 * @param battleId
 */
export const battleKingdom = async (kingdomId: string, battleId: BattleType, targetId: string): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to ATTACK ${targetId} by ${battleId}`);
    const attackerTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.TURN).limit(1).get()).docs[0].data();
    attackerTurn.quantity = calculateTurns(attackerTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), attackerTurn.resource.max, attackerTurn.resource.ratio);
    if (BATTLE_TURNS <= attackerTurn.quantity) {
      // attacker
      const attackerKingdom = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get());
      const attackerKingdomTree = attackerKingdom.data()?.tree;
      const attackerKingdomGuild = attackerKingdom.data()?.guild;
      const attackerKingdomContracts = (await angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).where('assignment', '==', AssignmentType.ATTACK).limit(3).get()).docs.map(contract => ({ ...contract.data(), fid: contract.id }));
      const attackerKingdomTroops = (await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).where('assignment', '==', AssignmentType.ATTACK).orderBy('sort', 'asc').limit(5).get()).docs.map(troop => ({ ...troop.data(), fid: troop.id, initialQuantity: troop.data().quantity }));
      const attackerKingdomArtifacts = (await angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).where('assignment', '==', AssignmentType.ATTACK).limit(1).get()).docs.map(artifact => ({ ...artifact.data(), fid: artifact.id }));
      const attackerKingdomCharms = (await angularFirestore.collection(`kingdoms/${kingdomId}/charms`).where('assignment', '==', AssignmentType.ATTACK).limit(1).get()).docs.map(charm => ({ ...charm.data(), fid: charm.id }));
      // defender
      const defenderKingdom = (await angularFirestore.doc(`kingdoms/${targetId}`).get());
      const defenderKingdomTree = defenderKingdom.data()?.tree;
      const defenderKingdomGuild = defenderKingdom.data()?.guild;
      const defenderKingdomContracts = (await angularFirestore.collection(`kingdoms/${kingdomId}/contracts`).where('assignment', '==', AssignmentType.DEFENSE).limit(3).get()).docs.map(contract => ({ ...contract.data(), fid: contract.id }));
      const defenderKingdomTroops = (await angularFirestore.collection(`kingdoms/${kingdomId}/troops`).where('assignment', '==', AssignmentType.DEFENSE).orderBy('sort', 'asc').limit(5).get()).docs.map(troop => ({ ...troop.data(), fid: troop.id, initialQuantity: troop.data().quantity }));
      const defenderKingdomArtifacts = (await angularFirestore.collection(`kingdoms/${kingdomId}/artifacts`).where('assignment', '==', AssignmentType.DEFENSE).limit(1).get()).docs.map(artifact => ({ ...artifact.data(), fid: artifact.id }));
      const defenderKingdomCharms = (await angularFirestore.collection(`kingdoms/${kingdomId}/charms`).where('assignment', '==', AssignmentType.DEFENSE).limit(1).get()).docs.map(charm => ({ ...charm.data(), fid: charm.id }));
      // battle
      if (attackerKingdomTroops.length) {
        const report: BattleReport = {
          attackerPowerLost: 0,
          defenderPowerLost: 0,
          victory: false,
          logs: [],
        };
        const batch = angularFirestore.batch();
        await resolveBattle(
          attackerKingdomTree,
          attackerKingdomGuild,
          attackerKingdomContracts,
          attackerKingdomTroops,
          attackerKingdomArtifacts,
          attackerKingdomCharms,
          defenderKingdomTree,
          defenderKingdomGuild,
          defenderKingdomContracts,
          defenderKingdomTroops,
          defenderKingdomArtifacts,
          defenderKingdomCharms,
          battleId,
          report,
          kingdomId,
          batch,
          targetId,
          undefined,
        );
        await addSupply(kingdomId, SupplyType.TURN, -BATTLE_TURNS, batch);
        const data: any = {
          logs: report.logs,
        };
        if (report.victory) {
          switch (battleId) {
            case BattleType.ATTACK: {
              const defenderBuildings = (await angularFirestore.collection(`kingdoms/${targetId}/buildings`).get()).docs;
              for (const defenderBuilding of defenderBuildings) {
                const building = defenderBuilding.data();
                const quantity = Math.ceil(building.quantity * ATTACK_RATIO);
                await addBuilding(targetId, building.id, -quantity, batch);
                await addBuilding(kingdomId, building.id, quantity, batch);
                data[building.id] = quantity;
              }
              console.log(`KINGDOM ${kingdomId} succesfully ATTACKED ${targetId}`);
              break;
            }
            case BattleType.PILLAGE: {
              const defenderSupplies = (await angularFirestore.collection(`kingdoms/${targetId}/supplies`).where('id', 'in', [SupplyType.GOLD, SupplyType.MANA, SupplyType.POPULATION]).get()).docs;
              for (const defenderSupply of defenderSupplies) {
                const supply = defenderSupply.data();
                const quantity = Math.ceil(supply.quantity * PILLAGE_RATIO);
                await addSupply(targetId, supply.id, -quantity, batch);
                await addSupply(kingdomId, supply.id, quantity, batch);
                data[supply.id] = quantity;
              }
              console.log(`KINGDOM ${kingdomId} succesfully PILLAGED ${targetId}`);
              break;
            }
            case BattleType.SIEGE: {
              const defenderBuildings = (await angularFirestore.collection(`kingdoms/${targetId}/buildings`).get()).docs;
              for (const defenderBuilding of defenderBuildings) {
                const building = defenderBuilding.data();
                const quantity = Math.ceil(building.quantity * SIEGE_RATIO);
                await addBuilding(targetId, building.id, -quantity, batch);
                data[building.id] = quantity;
              }
              const defenderSupplies = (await angularFirestore.collection(`kingdoms/${targetId}/supplies`).where('id', 'in', [SupplyType.GOLD, SupplyType.MANA, SupplyType.POPULATION]).get()).docs;
              for (const defenderSupply of defenderSupplies) {
                const supply = defenderSupply.data();
                const quantity = Math.ceil(supply.quantity * SIEGE_RATIO);
                await addSupply(targetId, supply.id, -quantity, batch);
                data[supply.id] = quantity;
              }
              console.log(`KINGDOM ${kingdomId} succesfully SIEGED ${targetId}`);
              break;
            }
          }
        }
        const from = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
        await addLetter(kingdomId, 'world.battle.subject', report.victory ? 'world.battle.victory' : 'world.battle.defeat', from, batch, data);
        await batch.commit();
        console.log(`KINGDOM ${kingdomId} succesfully BATTLES ${targetId} by ${battleId}`);
      } else throw new Error(`KINGDOM ${kingdomId} has not enought TROOPS`);
    } else throw new Error(`KINGDOM ${kingdomId} has not enought TURNS`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not BATTLE ${targetId}`, error);
    throw error;
  }
};

//========================================================================================
/*                                                                                      *
 *                                       AUCTIONS                                       *
 *                                                                                      */
//========================================================================================

/**
 * refreshes the auction house
 */
export const refreshAuctions = async (): Promise<void> => {
  try {
    console.log(`AUCTIONS try to be REFRESHED`);
    const batch = angularFirestore.batch();
    const kingdomAuctions = await angularFirestore.collection('auctions').get();
    if (kingdomAuctions.docs.length) {
      for (const kingdomAuction of kingdomAuctions.docs) { // cannot use forEach due to async/await of batch.commit
        const auction = kingdomAuction.data();
        if (moment().isAfter(moment(auction.auctioned.toMillis()))) {
          if (auction.kingdom) {
            console.log(`AUCTION ${kingdomAuction.id} has a winner KINGDOM ${auction.kingdom}`);
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
            if (from) await addLetter(auction.kingdom, 'kingdom.auction.subject', 'kingdom.auction.won', from, batch, data);
          }
          batch.delete(kingdomAuction.ref);
          console.log(`AUCTION ${kingdomAuction.id} is REPLACED`);
          await startAuction(auction.type, batch);
        }
      }
    } else {
      await startAuction(AuctionType.ARTIFACT, batch);
      await startAuction(AuctionType.ARTIFACT, batch);
      await startAuction(AuctionType.CHARM, batch);
      await startAuction(AuctionType.CONTRACT, batch);
      await startAuction(AuctionType.TROOP, batch);
    }
    await batch.commit();
    console.log(`AUCTIONS have been succesfully REFRESHED`);
  } catch (error) {
    console.error(`AUCTIONS could not have been REFRESHED`, error);
    throw error;
  }
};

/**
 * starts an auction
 * @param type
 * @param batch
 */
export const startAuction = async (type: AuctionType, batch: FirebaseFirestore.WriteBatch): Promise<void> => {
  try {
    console.log(`AUCTION ${type} tries to be STARTED`);
    const auctioned = moment(admin.firestore.Timestamp.now().toMillis()).add(AUCTION_TIME, 'seconds');
    switch (type) {
      case AuctionType.ARTIFACT:
        const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
        batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.ARTIFACT, item: item, quantity: random(1, 2), gold: 1000000, auctioned: auctioned });
        console.log(`AUCTION ${item.id} has been succesfully STARTED`);
        break;
      case AuctionType.CHARM:
        const spell = (await angularFirestore.collection('spells').where('random', '==', random(0, 99)).limit(1).get()).docs[0].data();
        batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.CHARM, spell: spell, gold: 1000000, auctioned: auctioned });
        console.log(`AUCTION ${spell.id} has been succesfully STARTED`);
        break;
      case AuctionType.CONTRACT:
        const hero = (await angularFirestore.collection('heroes').where('random', '==', random(0, 19)).limit(1).get()).docs[0].data();
        batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.CONTRACT, hero: hero, level: random(1, 10), gold: 1000000, auctioned: auctioned });
        console.log(`AUCTION ${hero.id} has been succesfully STARTED`);
        break;
      case AuctionType.TROOP:
        const unit = (await angularFirestore.collection('units').where('random', '==', random(0, 64)).limit(1).get()).docs[0].data();
        batch.create(angularFirestore.collection('auctions').doc(), { type: AuctionType.TROOP, unit: unit, quantity: random(Math.min(...unit.amount), Math.max(...unit.amount)), gold: 1000000, auctioned: auctioned });
        console.log(`AUCTION ${unit.id} has been succesfully STARTED`);
        break;
    }
  } catch (error) {
    console.error(`AUCTION ${type} could not have been STARTED`, error);
    throw error;
  }
};

/**
 * kingdom bids an auction with gold
 * @param kingdomId
 * @param auctionId
 * @param gold
 */
export const bidAuction = async (kingdomId: string, auctionId: string, gold: number): Promise<any> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to BID ${auctionId}`);
    const auction = (await angularFirestore.doc(`auctions/${auctionId}`).get()).data();
    if (auction) {
      const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.GOLD).limit(1).get()).docs[0].data();
      if (gold <= kingdomGold.quantity && gold >= Math.floor(auction.gold * BID_RATIO) && kingdomId !== auction.kingdom) {
        const batch = angularFirestore.batch();
        await addSupply(kingdomId, SupplyType.GOLD, -gold, batch);
        if (auction.kingdom) {
          const bid = Math.ceil(auction.gold * OUTBID_RATIO);
          await addSupply(auction.kingdom, SupplyType.GOLD, bid, batch);
          const from = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
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
          console.log(`KINGDOM ${auction.kingdom} loses the AUCTION ${auctionId} and refunds ${bid} GOLD`);
        }
        const auctioned = moment(auction.auctioned.toMillis()).add(AUCTION_TIME_OUTBID, 'seconds');
        batch.update(angularFirestore.doc(`auctions/${auctionId}`), { kingdom: kingdomId, gold: gold, auctioned: auctioned });
        await batch.commit();
        console.log(`KINGDOM ${kingdomId} succesfully BIDS ${auctionId}`);
        return { gold: gold };
      } else throw new Error(`KINGDOM ${kingdomId} has not enought GOLD`);
    } else throw new Error(`AUCTION ${auctionId} does not exists`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not BID ${auctionId}`, error);
    throw error;
  }
};

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
export const offerGod = async (kingdomId: string, godId: string, sacrifice: number, reward?: string): Promise<any> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to OFFER ${godId}`);
    let result = {};
    const kingdomGod = (await angularFirestore.doc(`gods/${godId}`).get()).data();
    if (kingdomGod) {
      const offering = kingdomGod.gold
        ? SupplyType.GOLD
        : kingdomGod.mana
          ? SupplyType.MANA
          : kingdomGod.population
            ? SupplyType.POPULATION
            : kingdomGod.land
              ? SupplyType.LAND
              : SupplyType.TURN;
      const kingdomSupply = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', offering).limit(1).get()).docs[0].data();
      if (offering === SupplyType.TURN) kingdomSupply.quantity = calculateTurns(kingdomSupply.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomSupply.resource.max, kingdomSupply.resource.ratio);
      if (sacrifice >= kingdomGod.increment && sacrifice <= kingdomSupply.quantity) {
        const batch = angularFirestore.batch();
        await addSupply(kingdomId, offering, -sacrifice, batch, offering === SupplyType.TURN ? kingdomSupply.resource.ratio : null);
        const tree = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data()?.tree;
        const theology = searchPerk(tree, 'theology');
        // tslint:disable-next-line: no-parameter-reassignment
        if (theology) sacrifice = Math.ceil(sacrifice * (1 + (theology.godBonus * theology.level) / 100));
        batch.update(angularFirestore.doc(`gods/${godId}`), { sacrifice: admin.firestore.FieldValue.increment(sacrifice), armageddon: (kingdomGod.sacrifice + sacrifice) >= kingdomGod[offering] });
        if (!reward) {
          const rewards = ['supply', 'artifact', 'contract', 'enchantment', 'troop', 'building', 'charm'];
          // tslint:disable-next-line: no-parameter-reassignment
          reward = rewards[random(0, rewards.length - 1)];
        }
        switch (reward) {
          case 'enchantment': {
            const enchantments = (await angularFirestore.collection('spells').where('subtype', '==', 'enchantment').where('multiple', '==', false).get());
            const enchantment = enchantments.docs[random(0, enchantments.docs.length - 1)].data();
            await addEnchantment(kingdomId, enchantment, kingdomId, enchantment.turnDuration, batch);
            result = { enchantment: `spell.${enchantment.id}.name`, turns: enchantment.turnDuration };
            break;
          }
          case 'contract': {
            const hero = (await angularFirestore.collection('heroes').where('random', '==', random(0, 19)).limit(1).get()).docs[0].data();
            const level = Math.floor(Math.random() * 9) + 1;
            await addContract(kingdomId, hero, level, batch);
            result = { hero: `hero.${hero.id}.name`, level: level };
            break;
          }
          case 'artifact': {
            const item = (await angularFirestore.collection('items').where('random', '==', random(0, 49)).limit(1).get()).docs[0].data();
            const lot = 1;
            await addArtifact(kingdomId, item, lot, batch);
            result = { item: `item.${item.id}.name`, quantity: lot };
            break;
          }
          case 'troop': {
            const unit = (await angularFirestore.collection('units').where('random', '==', random(0, 64)).limit(1).get()).docs[0].data();
            const size = random(Math.min(...unit.amount), Math.max(...unit.amount));
            await addTroop(kingdomId, unit, size, batch);
            result = { unit: `unit.${unit.id}.name`, quantity: size };
            break;
          }
          case 'supply': {
            const resource = (await angularFirestore.collection('resources').where('random', '==', random(0, 5)).limit(1).get()).docs[0].data();
            let amount = 0;
            if (resource.id === SupplyType.GEM) amount = random(-5, 25);
            if (resource.id === SupplyType.TURN) amount = random(-25, 50);
            if (resource.id === SupplyType.LAND) amount = random(-50, 100);
            if (resource.id === SupplyType.GOLD) amount = random(-1000000, 2000000);
            if (resource.id === SupplyType.MANA) amount = random(-500000, 1000000);
            if (resource.id === SupplyType.POPULATION) amount = random(-250000, 500000);
            await addSupply(kingdomId, resource.id, amount, batch);
            result = { [resource.id]: amount };
            break;
          }
          case 'building': {
            const structure = (await angularFirestore.collection('structures').where('random', '==', random(0, 6)).limit(1).get()).docs[0].data();
            const number = random(-50, 150);
            await addBuilding(kingdomId, structure.id, number, batch);
            result = { building: `structure.${structure.id}.name`, number: number };
            break;
          }
          case 'charm': {
            const spell = (await angularFirestore.collection('spells').where('random', '==', random(0, 99)).limit(1).get()).docs[0].data();
            const turns = random(0, 300);
            await addCharm(kingdomId, spell, turns, batch);
            result = { spell: `spell.${spell.id}.name`, turns: turns };
            break;
          }
        }
        await batch.commit();
        console.log(`KINGDOM ${kingdomId} succesfully OFFERS ${godId}`);
        return result;
      } else throw new Error(`KINGDOM ${kingdomId} has not enought sacrifice`);
    } else throw new Error(`GOD ${godId} does not exists`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not OFFER ${godId}`, error);
    throw error;
  }
};

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
export const addEnchantment = async (kingdomId: string, enchantment: any, originId: string, turns: number, batch: FirebaseFirestore.WriteBatch): Promise<void> => {
  try {
    const kingdomEnchantment = await angularFirestore.collection(`kingdoms/${kingdomId}/enchantments`).where('id', '==', enchantment.id).limit(1).get();
    if (kingdomEnchantment.size > 0) {
      batch.update(angularFirestore.doc(`kingdoms/${kingdomId}/enchantments/${kingdomEnchantment.docs[0].id}`), { turns: admin.firestore.FieldValue.increment(turns) });
      batch.update(angularFirestore.doc(`kingdoms/${originId}/incantations/${kingdomEnchantment.docs[0].id}`), { turns: admin.firestore.FieldValue.increment(turns) });
    } else {
      // shared id
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
  } catch (error) {
    console.error(`KINGDOM ${originId} could not ENCHANT ${kingdomId} with ${enchantment.id}`, error);
    throw error;
  }
};

/**
 * tries to dispel an incantation owned by the kingdom
 * @param kingdomId
 * @param enchantmentId
 */
export const dispelIncantation = async (kingdomId: string, enchantmentId: string): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to DISPEL ${enchantmentId}`);
    const batch = angularFirestore.batch();
    const response = await removeEnchantment(kingdomId, enchantmentId, batch);
    await batch.commit();
    console.log(`KINGDOM ${kingdomId} succesfully DISPELS ${enchantmentId}`);
    return response;
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not DISPEL ${enchantmentId}`, error);
    throw error;
  }
};

/**
 * removes an enchantment
 * @param kingdomId
 * @param enchantmentId
 */
export const removeEnchantment = async (kingdomId: string, enchantmentId: string, batch: FirebaseFirestore.WriteBatch): Promise<any> => {
  try {
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
    } else throw new Error(`ENCHANTMENT ${enchantmentId} does not exists`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not REMOVE the ENCHANTMENT ${enchantmentId}`, error);
    throw error;
  }
};

/**
 * tries to break an enchantment not owned by the kingdom
 * @param kingdomId
 * @param enchantmentId
 */
export const breakEnchantment = async (kingdomId: string, enchantmentId: string): Promise<any> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to BREAK ${enchantmentId}`);
    const kingdomEnchantment = (await angularFirestore.doc(`kingdoms/${kingdomId}/enchantments/${enchantmentId}`).get()).data();
    if (kingdomEnchantment) {
      const kingdomMana = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.MANA).limit(1).get()).docs[0].data();
      const kingdomTurn = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.TURN).limit(1).get()).docs[0].data();
      kingdomTurn.quantity = calculateTurns(kingdomTurn.timestamp.toMillis(), admin.firestore.Timestamp.now().toMillis(), kingdomTurn.resource.max, kingdomTurn.resource.ratio);
      if (kingdomEnchantment.spell.manaCost * 2 <= kingdomMana.quantity && kingdomEnchantment.spell.turnCost * 2 <= kingdomTurn.quantity) {
        // const kingdomOrigin = (await angularFirestore.doc(`kingdoms/${kingdomEnchantment.from}`).get()).data();
        // const kingdomTarget = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
        const chance = 100;
        if (random(0, 100) <= chance) {
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
          console.log(`KINGDOM ${kingdomId} succesfully BREAKS ${enchantmentId}`);
          return { success: true };
        } else {
          console.log(`KINGDOM ${kingdomId} fails to BREAK ${enchantmentId}`);
          return { success: false };
        }
      } else throw new Error(`KINGDOM ${kingdomId} has not enought resources`);
    } else throw new Error(`ENCHANTMENT ${enchantmentId} does not exists`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not BREAK the ENCHANTMENT ${enchantmentId}`, error);
    throw error;
  }
};

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
export const foundateClan = async (kingdomId: string, name: string, description: string, image: string): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to FOUNDATE ${name}`);
    const kingdomClan = (await angularFirestore.collection(`clans`).where('name', '==', name).limit(1).get());
    if (!kingdomClan.docs.length) {
      const kingdomGold = (await angularFirestore.collection(`kingdoms/${kingdomId}/supplies`).where('id', '==', SupplyType.GOLD).limit(1).get()).docs[0].data();
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
        await addSupply(kingdomId, SupplyType.GOLD, -CLAN_COST, batch);
        await batch.commit();
        console.log(`KINGDOM ${kingdomId} succesfully FOUNDATES ${name}`);
      } else throw new Error(`KINGDOM ${kingdomId} has not enought GOLD`);
    } else throw new Error(`CLAN ${name} already exists`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not FOUNDATE ${name}`, error);
    throw error;
  }
};

/**
 * joins a clan
 * @param kingdomId
 * @param clanId
 */
export const joinClan = async (kingdomId: string, clanId: string): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to JOIN ${clanId}`);
    const kingdom = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
    const clan = await angularFirestore.doc(`clans/${clanId}`).get();
    const batch = angularFirestore.batch();
    batch.update(angularFirestore.doc(`clans/${clanId}`), { power: admin.firestore.FieldValue.increment(kingdom?.power) });
    batch.create(angularFirestore.doc(`clans/${clanId}/members/${kingdom?.id}`), kingdom);
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}`), { clan: { ...clan.data(), fid: clan.id } });
    await batch.commit();
    console.log(`KINGDOM ${kingdomId} succesfully JOINS ${clanId}`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not JOIN ${clanId}`, error);
    throw error;
  }
};

/**
 * leaves a clan
 * @param kingdomId
 * @param clanId
 */
export const leaveClan = async (kingdomId: string, clanId: string): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to LEAVE the CLAN ${clanId}`);
    const kingdom = (await angularFirestore.doc(`kingdoms/${kingdomId}`).get()).data();
    const batch = angularFirestore.batch();
    batch.update(angularFirestore.doc(`clans/${clanId}`), { power: admin.firestore.FieldValue.increment(-kingdom?.power) });
    batch.delete(angularFirestore.doc(`clans/${clanId}/members/${kingdomId}`));
    batch.update(angularFirestore.doc(`kingdoms/${kingdomId}`), { clan: null });
    await batch.commit();
    console.log(`KINGDOM ${kingdomId} succesfully LEAVES the CLAN ${clanId}`);
  } catch (error) {
    console.error(`KINGDOM ${kingdomId} could not LEAVE the CLAN ${clanId}`, error);
    throw error;
  }
};

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
export const favorGuild = async (kingdomId: string, guildId: string): Promise<void> => {
  try {
    console.log(`KINGDOM ${kingdomId} tries to FAVOR the GUILD ${guildId}`);
    const guild = (await angularFirestore.doc(`guilds/${guildId}`).get()).data();
    const guilded = moment(admin.firestore.Timestamp.now().toMillis()).add(GUILD_TIME, 'seconds');
    await angularFirestore.doc(`kingdoms/${kingdomId}`).update({
      guild: guild,
      guilded: guilded,
    });
    console.log(`KINGDOM ${kingdomId} succesfully FAVORS the GUILD ${guildId}`);
  } catch(error) {
    console.error(`KINGDOM ${kingdomId} could not FAVOR the GUILD ${guildId}`, error);
    throw error;
  }
};
