import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient } from '@angular/common/http';
import firebase from 'firebase/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as moment from 'moment';
import { CollectionType } from './cache.service';
import { Store } from '@ngxs/store';
import { Attack, Faction, Family, Category, God, Resource, Skill, Structure, Guild, Unit, Item, Spell, Perk, Pack, Location, Hero } from '../shared/type/interface.model';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {

  attacks: Array<Attack> = [];
  factions: Array<Faction> = [];
  families: Array<Family> = [];
  categories: Array<Category> = [];
  gods: Array<God> = [];
  resources: Array<Resource> = [];
  skills: Array<Skill> = [];
  structures: Array<Structure> = [];
  guilds: Array<Guild> = [];
  units: Array<Unit> = [];
  items: Array<Item> = [];
  stores: Array<Store> = [];
  locations: Array<Location> = [];
  spells: Array<Spell> = [];
  heroes: Array<Hero> = [];
  // kingdoms: Array<Kingdom> = [];
  // legends: Array<Legend> = [];
  perks: Array<Perk> = [];
  packs: Array<Pack> = [];

  joinedAttacks: Array<Attack> = [];
  joinedFactions: Array<Faction> = [];
  joinedFamilies: Array<Family> = [];
  joinedCategories: Array<Category> = [];
  joinedGods: Array<God> = [];
  joinedResources: Array<Resource> = [];
  joinedSkills: Array<Skill> = [];
  joinedStructures: Array<Structure> = [];
  joinedGuilds: Array<Guild> = [];
  joinedUnits: Array<Unit> = [];
  joinedItems: Array<Item> = [];
  joinedStores: Array<Store> = [];
  joinedLocations: Array<Location> = [];
  joinedSpells: Array<Spell> = [];
  joinedHeroes: Array<Hero> = [];
  // joinedLegends: Array<Legend> = [];
  joinedPerks: Array<Perk> = [];
  joinedPacks: Array<Pack> = [];

  constructor(
    private angularFirestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth,
    private httpClient: HttpClient,
  ) { }

  async joinFixtures(element: any) {
    // if (element.store) this.joinObject(element, 'store', await this.cacheService.getStores());
    if (element.faction) this.joinObject(element, 'faction', this.joinedFactions);
    if (element.adjacents) this.joinObject(element, 'adjacents', this.factions);
    if (element.opposites) this.joinObject(element, 'opposites', this.factions);
    // if (element.location) this.joinObject(element, 'location', await this.cacheService.getLocations());
    if (element.skills) this.joinObject(element, 'skills', this.skills);
    if (element.unit) this.joinObject(element, 'unit', this.joinedUnits);
    if (element.units) this.joinObject(element, 'units', this.joinedUnits);
    if (element.categories) this.joinObject(element, 'categories', this.categories);
    if (element.resistances) this.joinObject(element, 'resistances', this.categories);
    if (element.families) this.joinObject(element, 'families', this.families);
    if (element.spell) this.joinObject(element, 'spell', this.joinedSpells);
    if (element.spells) this.joinObject(element, 'spells', this.joinedSpells);
    // if (element.hero) this.joinObject(element, 'hero', await this.cacheService.getHeroes());
    // if (element.item) this.joinObject(element, 'item', await this.cacheService.getItems());
    // if (element.items) this.joinObject(element, 'items', await this.cacheService.getItems());
    if (element.resources) this.joinObject(element, 'resources', this.resources);
    if (element.perks) this.joinObject(element, 'perks', this.perks, true);
  }

  joinObject(element: any, subCollection: string, collection: any[], recursive: boolean = false) {
    if (element[subCollection] instanceof Array) {
      element[subCollection].forEach((subElement: any, subElementIndex: number, subElementArray: any[]) => {
        if (typeof subElement === 'string') {
          element[subCollection][subElementIndex] = JSON.parse(JSON.stringify(collection.find(el => el['id'] === subElement.replace(/^\+|^\-|^\//g, ''))));
          if (recursive) {
            this.joinObject(element[subCollection][subElementIndex], 'perks', this.perks, true);
          }
        }
      });
      element[subCollection] = recursive
        ? element[subCollection].slice().sort((a: any, b: any) => a?.sort - b?.sort)
        : element[subCollection].slice().sort((a: any, b: any) => a?.name.localeCompare(b?.name));
    }
    if (typeof element[subCollection] === 'string') {
      element[subCollection] = JSON.parse(JSON.stringify(collection.find(el => el['id'] === element[subCollection].replace(/^\+|^\-|^\//g, ''))));
    }
  }

  async readFixtures() {
    this.attacks = await this.httpClient.get<Array<Attack>>('assets/fixtures/attacks.json').toPromise();
    this.factions = await this.httpClient.get<Array<Faction>>('assets/fixtures/factions.json').toPromise();
    this.families = await this.httpClient.get<Array<Family>>('assets/fixtures/families.json').toPromise();
    this.categories = await this.httpClient.get<Array<Category>>('assets/fixtures/categories.json').toPromise();
    this.gods = await this.httpClient.get<Array<God>>('assets/fixtures/gods.json').toPromise();
    this.resources = await this.httpClient.get<Array<Resource>>('assets/fixtures/resources.json').toPromise();
    this.skills = await this.httpClient.get<Array<Skill>>('assets/fixtures/skills.json').toPromise();
    this.structures = await this.httpClient.get<Array<Structure>>('assets/fixtures/structures.json').toPromise();
    this.guilds = await this.httpClient.get<Array<Guild>>('assets/fixtures/guilds.json').toPromise();
    this.units = await this.httpClient.get<Array<Unit>>('assets/fixtures/units.json').toPromise();
    this.items = await this.httpClient.get<Array<Item>>('assets/fixtures/items.json').toPromise();
    this.stores = await this.httpClient.get<Array<Store>>('assets/fixtures/stores.json').toPromise();
    this.locations = await this.httpClient.get<Array<Location>>('assets/fixtures/locations.json').toPromise();
    this.spells = await this.httpClient.get<Array<Spell>>('assets/fixtures/spells.json').toPromise();
    this.heroes = await this.httpClient.get<Array<Hero>>('assets/fixtures/heroes.json').toPromise();
    // this.legends = await this.httpClient.get<Array<Legend>>('assets/fixtures/legends.json').toPromise();
    this.perks = await this.httpClient.get<Array<Perk>>('assets/fixtures/perks.json').toPromise();
    this.packs = await this.httpClient.get<Array<Pack>>('assets/fixtures/packs.json').toPromise();
  }

  async importFixtures(collection: string, elements: any[], batch: firebase.firestore.WriteBatch) {
    elements.forEach((element: any, index: number) => {
      element.random = index;
      if (element.timestamp) {
        element.timestamp = moment(element.timestamp, 'DD/MM/YYYY', true).toDate();
      }
      batch.set(this.angularFirestore.collection(collection).doc(element.id).ref, element);
    });
  }

  loadFixtures(fixtures: CollectionType[]) {
    this.angularFireAuth.authState.subscribe(async user => {
      if (user && fixtures.length) {
        const batch = this.angularFirestore.firestore.batch();
        await this.readFixtures();
        this.joinedFactions = JSON.parse(JSON.stringify(this.factions));
        this.joinedFactions.forEach(faction => this.joinFixtures(faction));
        if (fixtures.includes(CollectionType.FACTIONS)) {
          console.debug(`Loading ${CollectionType.FACTIONS}...`);
          this.importFixtures(CollectionType.FACTIONS, this.joinedFactions, batch);
        }
        this.joinedAttacks = JSON.parse(JSON.stringify(this.attacks));
        this.joinedAttacks.forEach(attack => this.joinFixtures(attack));
        if (fixtures.includes(CollectionType.ATTACKS)) {
          console.debug(`Loading ${CollectionType.ATTACKS}...`);
          this.importFixtures(CollectionType.ATTACKS, this.joinedAttacks, batch);
        }
        this.joinedGuilds = JSON.parse(JSON.stringify(this.guilds));
        this.joinedGuilds.forEach(guild => this.joinFixtures(guild));
        if (fixtures.includes(CollectionType.GUILDS)) {
          console.debug(`Loading ${CollectionType.GUILDS}...`);
          this.importFixtures(CollectionType.GUILDS, this.joinedGuilds, batch);
        }
        this.joinedFamilies = JSON.parse(JSON.stringify(this.families));
        this.joinedFamilies.forEach(family => this.joinFixtures(family));
        if (fixtures.includes(CollectionType.FAMILIES)) {
          console.debug(`Loading ${CollectionType.FAMILIES}...`);
          this.importFixtures(CollectionType.FAMILIES, this.joinedFamilies, batch);
        }
        this.joinedCategories = JSON.parse(JSON.stringify(this.categories));
        this.joinedCategories.forEach(category => this.joinFixtures(category));
        if (fixtures.includes(CollectionType.CATEGORIES)) {
          console.debug(`Loading ${CollectionType.CATEGORIES}...`);
          this.importFixtures(CollectionType.CATEGORIES, this.joinedCategories, batch);
        }
        this.joinedResources = JSON.parse(JSON.stringify(this.resources));
        this.joinedResources.forEach(resource => this.joinFixtures(resource));
        if (fixtures.includes(CollectionType.RESOURCES)) {
          console.debug(`Loading ${CollectionType.RESOURCES}...`);
          this.importFixtures(CollectionType.RESOURCES, this.joinedResources, batch);
        }
        this.joinedStructures = JSON.parse(JSON.stringify(this.structures));
        this.joinedStructures.forEach(structure => this.joinFixtures(structure));
        if (fixtures.includes(CollectionType.STRUCTURES)) {
          console.debug(`Loading ${CollectionType.STRUCTURES}...`);
          this.importFixtures(CollectionType.STRUCTURES, this.joinedStructures, batch);
        }
        this.joinedSkills = JSON.parse(JSON.stringify(this.skills));
        this.joinedSkills.forEach(skill => this.joinFixtures(skill));
        if (fixtures.includes(CollectionType.SKILLS)) {
          console.debug(`Loading ${CollectionType.SKILLS}...`);
          this.importFixtures(CollectionType.SKILLS, this.joinedSkills, batch);
        }
        this.joinedUnits = JSON.parse(JSON.stringify(this.units));
        this.joinedUnits.forEach(unit => this.joinFixtures(unit));
        if (fixtures.includes(CollectionType.UNITS)) {
          console.debug(`Loading ${CollectionType.UNITS}...`);
          this.importFixtures(CollectionType.UNITS, this.joinedUnits, batch);
        }
        this.joinedSpells = JSON.parse(JSON.stringify(this.spells));
        this.joinedSpells.forEach(spell => this.joinFixtures(spell));
        if (fixtures.includes(CollectionType.SPELLS)) {
          console.debug(`Loading ${CollectionType.SPELLS}...`);
          this.importFixtures(CollectionType.SPELLS, this.joinedSpells, batch);
        }
        this.joinedItems = JSON.parse(JSON.stringify(this.items));
        this.joinedItems.forEach(item => this.joinFixtures(item));
        if (fixtures.includes(CollectionType.ITEMS)) {
          console.debug(`Loading ${CollectionType.ITEMS}...`);
          this.importFixtures(CollectionType.ITEMS, this.joinedItems, batch);
        }
        this.joinedHeroes = JSON.parse(JSON.stringify(this.heroes));
        this.joinedHeroes.forEach(hero => this.joinFixtures(hero));
        if (fixtures.includes(CollectionType.HEROES)) {
          console.debug(`Loading ${CollectionType.HEROES}...`);
          this.importFixtures(CollectionType.HEROES, this.joinedHeroes, batch);
        }
        this.joinedGods = JSON.parse(JSON.stringify(this.gods));
        this.joinedGods.forEach(god => this.joinFixtures(god));
        if (fixtures.includes(CollectionType.GODS)) {
          console.debug(`Loading ${CollectionType.GODS}...`);
          this.importFixtures(CollectionType.GODS, this.joinedGods, batch);
        }
        this.joinedStores = JSON.parse(JSON.stringify(this.stores));
        this.joinedStores.forEach(store => this.joinFixtures(store));
        if (fixtures.includes(CollectionType.STORES)) {
          console.debug(`Loading ${CollectionType.STORES}...`);
          this.importFixtures(CollectionType.STORES, this.joinedStores, batch);
        }
        this.joinedLocations = JSON.parse(JSON.stringify(this.locations));
        this.joinedLocations.forEach(quest => this.joinFixtures(quest));
        if (fixtures.includes(CollectionType.LOCATIONS)) {
          console.debug(`Loading ${CollectionType.LOCATIONS}...`);
          this.importFixtures(CollectionType.LOCATIONS, this.joinedLocations, batch);
        }
        /*
        this.joinedLegends = JSON.parse(JSON.stringify(this.legends));
        this.joinedLegends.forEach(legend => this.joinFixtures(legend));
        if (fixtures.includes(CollectionType.LEGENDS)) {
          console.debug(`Loading ${CollectionType.LEGENDS}...`);
          this.importFixtures(CollectionType.LEGENDS, this.joinedLegends, batch);
        }
        */
        this.joinedPerks = JSON.parse(JSON.stringify(this.perks));
        this.joinedPerks.forEach(perk => this.joinFixtures(perk));
        if (fixtures.includes(CollectionType.PERKS)) {
          console.debug(`Loading ${CollectionType.PERKS}...`);
          this.importFixtures(CollectionType.PERKS, this.joinedPerks, batch);
        }
        this.joinedPacks = JSON.parse(JSON.stringify(this.packs));
        this.joinedPacks.forEach(pack => this.joinFixtures(pack));
        if (fixtures.includes(CollectionType.PACKS)) {
          console.debug(`Loading ${CollectionType.PACKS}...`);
          this.importFixtures(CollectionType.PACKS, this.joinedPacks, batch);
        }
        await batch.commit();
        console.debug('Fixtures loaded!');
      }
    });
  }

}
