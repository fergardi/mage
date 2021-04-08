import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
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

  constructor(
    private angularFirestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth,
    private httpClient: HttpClient,
  ) { }

  async joinFixtures(element: any) {
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

  async readFixtures() {
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
  }

  async importFixtures(collection: string, elements: any[], batch: firebase.firestore.WriteBatch) {
    elements.forEach((element: any, index: number) => {
      element.random = index;
      batch.set(this.angularFirestore.collection(collection).doc(element.id).ref, element);
    });
  }

  loadFixtures(fixtures: FixtureType[]) {
    this.angularFireAuth.authState.subscribe(async user => {
      if (user && fixtures.length) {
        const batch = this.angularFirestore.firestore.batch();
        await this.readFixtures();
        this.joinedFactions = JSON.parse(JSON.stringify(this.factions));
        this.joinedFactions.forEach(faction => this.joinFixtures(faction));
        if (fixtures.includes(FixtureType.FACTIONS)) {
          console.log(`Loading ${FixtureType.FACTIONS}...`);
          this.importFixtures(FixtureType.FACTIONS, this.joinedFactions, batch);
        }
        this.joinedAttacks = JSON.parse(JSON.stringify(this.attacks));
        this.joinedAttacks.forEach(attack => this.joinFixtures(attack));
        if (fixtures.includes(FixtureType.ATTACKS)) {
          console.log(`Loading ${FixtureType.ATTACKS}...`);
          this.importFixtures(FixtureType.ATTACKS, this.joinedAttacks, batch);
        }
        this.joinedGuilds = JSON.parse(JSON.stringify(this.guilds));
        this.joinedGuilds.forEach(guild => this.joinFixtures(guild));
        if (fixtures.includes(FixtureType.GUILDS)) {
          console.log(`Loading ${FixtureType.GUILDS}...`);
          this.importFixtures(FixtureType.GUILDS, this.joinedGuilds, batch);
        }
        this.joinedFamilies = JSON.parse(JSON.stringify(this.families));
        this.joinedFamilies.forEach(family => this.joinFixtures(family));
        if (fixtures.includes(FixtureType.FAMILIES)) {
          console.log(`Loading ${FixtureType.FAMILIES}...`);
          this.importFixtures(FixtureType.FAMILIES, this.joinedFamilies, batch);
        }
        this.joinedCategories = JSON.parse(JSON.stringify(this.categories));
        this.joinedCategories.forEach(category => this.joinFixtures(category));
        if (fixtures.includes(FixtureType.CATEGORIES)) {
          console.log(`Loading ${FixtureType.CATEGORIES}...`);
          this.importFixtures(FixtureType.CATEGORIES, this.joinedCategories, batch);
        }
        this.joinedGods = JSON.parse(JSON.stringify(this.gods));
        this.joinedGods.forEach(god => this.joinFixtures(god));
        if (fixtures.includes(FixtureType.GODS)) {
          console.log(`Loading ${FixtureType.GODS}...`);
          this.importFixtures(FixtureType.GODS, this.joinedGods, batch);
        }
        this.joinedResources = JSON.parse(JSON.stringify(this.resources));
        this.joinedResources.forEach(resource => this.joinFixtures(resource));
        if (fixtures.includes(FixtureType.RESOURCES)) {
          console.log(`Loading ${FixtureType.RESOURCES}...`);
          this.importFixtures(FixtureType.RESOURCES, this.joinedResources, batch);
        }
        this.joinedStructures = JSON.parse(JSON.stringify(this.structures));
        this.joinedStructures.forEach(structure => this.joinFixtures(structure));
        if (fixtures.includes(FixtureType.STRUCTURES)) {
          console.log(`Loading ${FixtureType.STRUCTURES}...`);
          this.importFixtures(FixtureType.STRUCTURES, this.joinedStructures, batch);
        }
        this.joinedSkills = JSON.parse(JSON.stringify(this.skills));
        this.joinedSkills.forEach(skill => this.joinFixtures(skill));
        if (fixtures.includes(FixtureType.SKILLS)) {
          console.log(`Loading ${FixtureType.SKILLS}...`);
          this.importFixtures(FixtureType.SKILLS, this.joinedSkills, batch);
        }
        this.joinedUnits = JSON.parse(JSON.stringify(this.units));
        this.joinedUnits.forEach(unit => this.joinFixtures(unit));
        if (fixtures.includes(FixtureType.UNITS)) {
          console.log(`Loading ${FixtureType.UNITS}...`);
          this.importFixtures(FixtureType.UNITS, this.joinedUnits, batch);
        }
        this.joinedSpells = JSON.parse(JSON.stringify(this.spells));
        this.joinedSpells.forEach(spell => this.joinFixtures(spell));
        if (fixtures.includes(FixtureType.SPELLS)) {
          console.log(`Loading ${FixtureType.SPELLS}...`);
          this.importFixtures(FixtureType.SPELLS, this.joinedSpells, batch);
        }
        this.joinedItems = JSON.parse(JSON.stringify(this.items));
        this.joinedItems.forEach(item => this.joinFixtures(item));
        if (fixtures.includes(FixtureType.ITEMS)) {
          console.log(`Loading ${FixtureType.ITEMS}...`);
          this.importFixtures(FixtureType.ITEMS, this.joinedItems, batch);
        }
        this.joinedHeroes = JSON.parse(JSON.stringify(this.heroes));
        this.joinedHeroes.forEach(hero => this.joinFixtures(hero));
        if (fixtures.includes(FixtureType.HEROES)) {
          console.log(`Loading ${FixtureType.HEROES}...`);
          this.importFixtures(FixtureType.HEROES, this.joinedHeroes, batch);
        }
        this.joinedStores = JSON.parse(JSON.stringify(this.stores));
        this.joinedStores.forEach(store => this.joinFixtures(store));
        if (fixtures.includes(FixtureType.STORES)) {
          console.log(`Loading ${FixtureType.STORES}...`);
          this.importFixtures(FixtureType.STORES, this.joinedStores, batch);
        }
        this.joinedLocations = JSON.parse(JSON.stringify(this.locations));
        this.joinedLocations.forEach(quest => this.joinFixtures(quest));
        if (fixtures.includes(FixtureType.LOCATIONS)) {
          console.log(`Loading ${FixtureType.LOCATIONS}...`);
          this.importFixtures(FixtureType.LOCATIONS, this.joinedLocations, batch);
        }
        await batch.commit();
      }
    });
  }

}
