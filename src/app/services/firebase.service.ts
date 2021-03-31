import { Injectable } from '@angular/core';
import { AngularFirestore, QueryFn } from '@angular/fire/firestore';
import { first } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';

export enum FixtureType {
  'ATTACKS' = 'attacks',
  'FACTIONS' = 'factions',
  'FAMILIES' = 'families',
  'CATEGORIES' = 'categories',
  'GODS' = 'gods',
  'RESOURCES' = 'resources',
  'SKILLS' = 'skills',
  'STRUCTURES' = 'structures',
  'GUILDS' = 'guilds',
  'UNITS' = 'units',
  'ITEMS' = 'items',
  'STORES' = 'stores',
  'LOCATIONS' = 'locations',
  'SPELLS' = 'spells',
  'HEROES' = 'heroes',
  'KINGDOMS' = 'kingdoms',
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {

  attacks: any[] = [];
  factions: any[] = [];
  families: any[] = [];
  categories: any[] = [];
  gods: any[] = [];
  resources: any[] = [];
  skills: any[] = [];
  structures: any[] = [];
  guilds: any[] = [];
  units: any[] = [];
  items: any[] = [];
  stores: any[] = [];
  locations: any[] = [];
  spells: any[] = [];
  heroes: any[] = [];
  kingdoms: any[] = [];

  joinedAttacks: any[] = [];
  joinedFactions: any[] = [];
  joinedFamilies: any[] = [];
  joinedCategories: any[] = [];
  joinedGods: any[] = [];
  joinedResources: any[] = [];
  joinedSkills: any[] = [];
  joinedStructures: any[] = [];
  joinedGuilds: any[] = [];
  joinedUnits: any[] = [];
  joinedItems: any[] = [];
  joinedStores: any[] = [];
  joinedLocations: any[] = [];
  joinedSpells: any[] = [];
  joinedHeroes: any[] = [];
  joinedKingdoms: any[] = [];

  constructor(
    private angularFirestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth,
    private httpClient: HttpClient,
  ) { }

  retrieveElementFromPath(path: string) {
    return this.angularFirestore.doc<any>(path).get();
  }

  addElementToCollection(collection: string, element: any, id?: string, random?: number) {
    if (element) {
      Object.keys(element).forEach((key, index) => {
        if (element[key] === 'now') element[key] = firebase.firestore.Timestamp.now();
      });
      element.random = random;
    }
    return id
    ? this.angularFirestore.collection<any>(collection).doc<any>(id).set(element)
    : this.angularFirestore.collection<any>(collection).add(element);
  }

  delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  async addElementsToCollection(collection: string, elements: any[], master: boolean = false) {
    for (const [index, element] of elements.entries()) {
      await this.delay(250);
      await this.addElementToCollection(collection, element, master ? element.id : null, index);
    }
  }

  async importCollectionFromJson(collection: string) {
    this.angularFireAuth.authState.subscribe(user => {
      if (user) {
        console.log(`Loading collection ${collection}...`);
        this.httpClient.get<any[]>(`assets/fixtures/${collection}.json`).pipe(first()).subscribe(elements => {
          this.addElementsToCollection(collection, elements, true);
        });
      }
    });
  }

  async loadCollectionIntoCollection(from: string, to: string, query?: QueryFn) {
    this.angularFireAuth.authState.subscribe(user => {
      this.angularFirestore.collection<any>(`kingdoms/${user.uid}/${to}`).get().subscribe(documents => {
        documents.forEach(document => {
          document.ref.delete();
        });
      });
      const collection = !query
        ? this.angularFirestore.collection<any>(from).get()
        : this.angularFirestore.collection<any>(from, query).get();
      collection.subscribe(documents => {
        documents.forEach(document => {
          const data = document.data();
          this.angularFirestore.collection<any>(`kingdoms/${user.uid}/${to}`).add({
            id: data.id,
            quantity: 99, // artifacts
            turns: 50, // charms
            level: 3, // enchantments and contracts
            from: data.self ? user.uid : 'test', // enchantments
            max: 1000, // resources
            balance: 123, // resources
            assignment: 0, // troops, artifacts, heroes
          });
        });
      });
    });
  }

  async autoJoin(element: any) {
    // if (element.store) this.joinObject2(element, 'store', await this.cacheService.getStores());
    if (element.faction) this.joinObject2(element, 'faction', this.joinedFactions);
    if (element.adjacents) this.joinObject2(element, 'adjacents', this.factions);
    if (element.opposites) this.joinObject2(element, 'opposites', this.factions);
    // if (element.location) this.joinObject2(element, 'location', await this.cacheService.getLocations());
    if (element.skills) this.joinObject2(element, 'skills', this.skills);
    if (element.unit) this.joinObject2(element, 'unit', this.joinedUnits);
    if (element.units) this.joinObject2(element, 'units', this.joinedUnits);
    if (element.categories) this.joinObject2(element, 'categories', this.categories);
    if (element.resistances) this.joinObject2(element, 'resistances', this.categories);
    if (element.families) this.joinObject2(element, 'families', this.families);
    if (element.spell) this.joinObject2(element, 'spell', this.joinedSpells);
    if (element.spells) this.joinObject2(element, 'spells', this.joinedSpells);
    // if (element.hero) this.joinObject2(element, 'hero', await this.cacheService.getHeroes());
    // if (element.item) this.joinObject2(element, 'item', await this.cacheService.getItems());
    // if (element.items) this.joinObject2(element, 'items', await this.cacheService.getItems());
    if (element.resources) this.joinObject2(element, 'resources', this.resources);
  }

  joinObject2(element: any, subCollection: string, collection: any[]) {
    if (element[subCollection] instanceof Array) {
      element[subCollection].forEach((subElement, subElementIndex, subElementArray) => {
        if (typeof subElement === 'string') {
          element[subCollection][subElementIndex] = JSON.parse(JSON.stringify(collection.find(el => el['id'] === subElement.replace(/^\+|^\-|^\//g, ''))));
        }
      });
      element[subCollection] = element[subCollection].slice().sort((a: any, b: any) => a?.name - b?.name);
    }
    if (typeof element[subCollection] === 'string') {
      element[subCollection] = JSON.parse(JSON.stringify(collection.find(el => el['id'] === element[subCollection].replace(/^\+|^\-|^\//g, ''))));
    }
  }

  async loadFixtures() {
    this.attacks = await this.httpClient.get<any[]>('assets/fixtures/attacks.json').toPromise();
    this.factions = await this.httpClient.get<any[]>('assets/fixtures/factions.json').toPromise();
    this.families = await this.httpClient.get<any[]>('assets/fixtures/families.json').toPromise();
    this.categories = await this.httpClient.get<any[]>('assets/fixtures/categories.json').toPromise();
    this.gods = await this.httpClient.get<any[]>('assets/fixtures/gods.json').toPromise();
    this.resources = await this.httpClient.get<any[]>('assets/fixtures/resources.json').toPromise();
    this.skills = await this.httpClient.get<any[]>('assets/fixtures/skills.json').toPromise();
    this.structures = await this.httpClient.get<any[]>('assets/fixtures/structures.json').toPromise();
    this.guilds = await this.httpClient.get<any[]>('assets/fixtures/guilds.json').toPromise();
    this.units = await this.httpClient.get<any[]>('assets/fixtures/units.json').toPromise();
    this.items = await this.httpClient.get<any[]>('assets/fixtures/items.json').toPromise();
    this.stores = await this.httpClient.get<any[]>('assets/fixtures/stores.json').toPromise();
    this.locations = await this.httpClient.get<any[]>('assets/fixtures/locations.json').toPromise();
    this.spells = await this.httpClient.get<any[]>('assets/fixtures/spells.json').toPromise();
    this.heroes = await this.httpClient.get<any[]>('assets/fixtures/heroes.json').toPromise();
    this.kingdoms = await this.httpClient.get<any[]>('assets/fixtures/kingdoms.json').toPromise();
  }

  joinFixtures(fixtures: FixtureType[]) {
    this.angularFireAuth.authState.subscribe(async user => {
      if (user && fixtures.length) {
        await this.loadFixtures();
        console.log(`Loading ${FixtureType.FACTIONS}...`);
        this.joinedFactions = JSON.parse(JSON.stringify(this.factions));
        this.joinedFactions.forEach(faction => this.autoJoin(faction));
        if (fixtures.includes(FixtureType.FACTIONS)) this.addElementsToCollection(FixtureType.FACTIONS, this.joinedFactions, true);
        console.log(`Loading ${FixtureType.ATTACKS}...`);
        this.joinedAttacks = JSON.parse(JSON.stringify(this.attacks));
        this.joinedAttacks.forEach(attack => this.autoJoin(attack));
        if (fixtures.includes(FixtureType.ATTACKS)) this.addElementsToCollection(FixtureType.ATTACKS, this.joinedAttacks, true);
        console.log(`Loading ${FixtureType.GUILDS}...`);
        this.joinedGuilds = JSON.parse(JSON.stringify(this.guilds));
        this.joinedGuilds.forEach(guild => this.autoJoin(guild));
        if (fixtures.includes(FixtureType.GUILDS)) this.addElementsToCollection(FixtureType.GUILDS, this.joinedGuilds, true);
        console.log(`Loading ${FixtureType.FAMILIES}...`);
        this.joinedFamilies = JSON.parse(JSON.stringify(this.families));
        this.joinedFamilies.forEach(family => this.autoJoin(family));
        if (fixtures.includes(FixtureType.FAMILIES)) this.addElementsToCollection(FixtureType.FAMILIES, this.joinedFamilies, true);
        console.log(`Loading ${FixtureType.CATEGORIES}...`);
        this.joinedCategories = JSON.parse(JSON.stringify(this.categories));
        this.joinedCategories.forEach(category => this.autoJoin(category));
        if (fixtures.includes(FixtureType.CATEGORIES)) this.addElementsToCollection(FixtureType.CATEGORIES, this.joinedCategories, true);
        console.log(`Loading ${FixtureType.GODS}...`);
        this.joinedGods = JSON.parse(JSON.stringify(this.gods));
        this.joinedGods.forEach(god => this.autoJoin(god));
        if (fixtures.includes(FixtureType.GODS)) this.addElementsToCollection(FixtureType.GODS, this.joinedGods, true);
        console.log(`Loading ${FixtureType.RESOURCES}...`);
        this.joinedResources = JSON.parse(JSON.stringify(this.resources));
        this.joinedResources.forEach(resource => this.autoJoin(resource));
        if (fixtures.includes(FixtureType.RESOURCES)) this.addElementsToCollection(FixtureType.RESOURCES, this.joinedResources, true);
        console.log(`Loading ${FixtureType.STRUCTURES}...`);
        this.joinedStructures = JSON.parse(JSON.stringify(this.structures));
        this.joinedStructures.forEach(structure => this.autoJoin(structure));
        if (fixtures.includes(FixtureType.STRUCTURES)) this.addElementsToCollection(FixtureType.STRUCTURES, this.joinedStructures, true);
        console.log(`Loading ${FixtureType.SKILLS}...`);
        this.joinedSkills = JSON.parse(JSON.stringify(this.skills));
        this.joinedSkills.forEach(skill => this.autoJoin(skill));
        if (fixtures.includes(FixtureType.SKILLS)) this.addElementsToCollection(FixtureType.SKILLS, this.joinedSkills, true);
        console.log(`Loading ${FixtureType.UNITS}...`);
        this.joinedUnits = JSON.parse(JSON.stringify(this.units));
        this.joinedUnits.forEach(unit => this.autoJoin(unit));
        if (fixtures.includes(FixtureType.UNITS)) this.addElementsToCollection(FixtureType.UNITS, this.joinedUnits, true);
        console.log(`Loading ${FixtureType.SPELLS}...`);
        this.joinedSpells = JSON.parse(JSON.stringify(this.spells));
        this.joinedSpells.forEach(spell => this.autoJoin(spell));
        if (fixtures.includes(FixtureType.SPELLS)) this.addElementsToCollection(FixtureType.SPELLS, this.joinedSpells, true);
        console.log(`Loading ${FixtureType.ITEMS}...`);
        this.joinedItems = JSON.parse(JSON.stringify(this.items));
        this.joinedItems.forEach(item => this.autoJoin(item));
        if (fixtures.includes(FixtureType.ITEMS)) this.addElementsToCollection(FixtureType.ITEMS, this.joinedItems, true);
        console.log(`Loading ${FixtureType.HEROES}...`);
        this.joinedHeroes = JSON.parse(JSON.stringify(this.heroes));
        this.joinedHeroes.forEach(hero => this.autoJoin(hero));
        if (fixtures.includes(FixtureType.HEROES)) this.addElementsToCollection(FixtureType.HEROES, this.joinedHeroes, true);
        console.log(`Loading ${FixtureType.STORES}...`);
        this.joinedStores = JSON.parse(JSON.stringify(this.stores));
        this.joinedStores.forEach(store => this.autoJoin(store));
        if (fixtures.includes(FixtureType.STORES)) this.addElementsToCollection(FixtureType.STORES, this.joinedStores, true);
        console.log(`Loading ${FixtureType.LOCATIONS}...`);
        this.joinedLocations = JSON.parse(JSON.stringify(this.locations));
        this.joinedLocations.forEach(quest => this.autoJoin(quest));
        if (fixtures.includes(FixtureType.LOCATIONS)) this.addElementsToCollection(FixtureType.LOCATIONS, this.joinedLocations, true);
      }
    });
  }

}
