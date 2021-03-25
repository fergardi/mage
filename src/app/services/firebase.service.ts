import { Injectable } from '@angular/core';
import { AngularFirestore, QueryFn } from '@angular/fire/firestore';
import { map, first } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { CacheService, CollectionType } from './cache.service';

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
    private cacheService: CacheService,
    private httpClient: HttpClient,
  ) { }

  joinObject(element: any, subCollection: string, collection: any[]) {
    if (element[subCollection] instanceof Array) {
      element[subCollection].forEach((subElement, subElementIndex, subElementArray) => {
        if (typeof subElement === 'string') {
          element[subCollection][subElementIndex] = {
            ...collection.find(el => el['id'] === subElement),
          };
        }
      });
      element[subCollection] = element[subCollection].slice().sort((a: any, b: any) => a?.name - b?.name);
    }
    if (typeof element[subCollection] === 'string') {
      element.join = {
        ...collection.find(el => el['id'] === element[subCollection]),
      };
    }
  }

  async selfJoin(element: any) {
    if (element && element.store) this.joinObject(element, 'store', await this.cacheService.getStores());
    if (element && element.faction) this.joinObject(element, 'faction', await this.cacheService.getFactions());
    if (element && element.location) this.joinObject(element, 'location', await this.cacheService.getLocations());
    if (element && element.skills && element.skills.length) this.joinObject(element, 'skills', await this.cacheService.getSkills());
    if (element && element.unit) this.joinObject(element, 'unit', await this.cacheService.getUnits());
    if (element && element.units && element.units.length) this.joinObject(element, 'units', await this.cacheService.getUnits());
    if (element && element.categories && element.categories.length) this.joinObject(element, 'categories', await this.cacheService.getCategories());
    if (element && element.resistances && element.resistances.length) this.joinObject(element, 'resistances', await this.cacheService.getCategories());
    if (element && element.families && element.families.length) this.joinObject(element, 'families', await this.cacheService.getFamilies());
    if (element && element.spell) this.joinObject(element, 'spell', await this.cacheService.getSpells());
    if (element && element.spells && element.spells.length) this.joinObject(element, 'spells', await this.cacheService.getSpells());
    if (element && element.hero) this.joinObject(element, 'hero', await this.cacheService.getHeroes());
    if (element && element.item) this.joinObject(element, 'item', await this.cacheService.getItems());
    if (element && element.items && element.items.length) this.joinObject(element, 'items', await this.cacheService.getItems());
    if (element && element.resources && element.resources.length) this.joinObject(element, 'resources', await this.cacheService.getResources());
    return element;
  }

  leftJoin(left: string, right: string, from: string = 'id', to: string = 'id', query?: QueryFn) {
    return combineLatest([
      !query
        ? this.angularFirestore.collection<any>(left).valueChanges({ idField: 'fid' }) // select * from left
        : this.angularFirestore.collection<any>(left, query).valueChanges({ idField: 'fid' }), // select * from left where query
      CollectionType[right.toUpperCase()] === undefined
        ? this.angularFirestore.collection<any>(right).valueChanges() // left join right on left.from = right.to
        : this.cacheService.get(CollectionType[right.toUpperCase()]), // left join cached right on left.from = right.to
    ]).pipe(
      map(([
        leftCollection,
        rightCollection,
      ]) => {
        rightCollection.forEach(async (element: any) => {
          if (element && element.skills && element.skills.length) this.joinObject(element, 'skills', await this.cacheService.getSkills());
          if (element && element.units && element.units.length) this.joinObject(element, 'units', await this.cacheService.getUnits());
          if (element && element.categories && element.categories.length) this.joinObject(element, 'categories', await this.cacheService.getCategories());
          if (element && element.resistances && element.resistances.length) this.joinObject(element, 'resistances', await this.cacheService.getCategories());
          if (element && element.families && element.families.length) this.joinObject(element, 'families', await this.cacheService.getFamilies());
          if (element && element.spells && element.spells.length) this.joinObject(element, 'spells', await this.cacheService.getSpells());
          if (element && element.resources && element.resources.length) this.joinObject(element, 'resources', await this.cacheService.getResources());
        });
        return leftCollection.map(leftElement => {
          return {
            ...leftElement,
            join: rightCollection.find(rightElement => leftElement[from] === rightElement[to]),
          };
        });
      }),
    );
  }

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
    if (element.unit) this.joinObject2(element, 'unit', this.units);
    if (element.units) this.joinObject2(element, 'units', this.units);
    if (element.categories) this.joinObject2(element, 'categories', this.categories);
    if (element.resistances) this.joinObject2(element, 'resistances', this.categories);
    if (element.families) this.joinObject2(element, 'families', this.families);
    if (element.spell) this.joinObject2(element, 'spell', this.spells);
    if (element.spells) this.joinObject2(element, 'spells', this.spells);
    // if (element.hero) this.joinObject2(element, 'hero', await this.cacheService.getHeroes());
    // if (element.item) this.joinObject2(element, 'item', await this.cacheService.getItems());
    // if (element.items) this.joinObject2(element, 'items', await this.cacheService.getItems());
    if (element.resources) this.joinObject2(element, 'resources', await this.httpClient.get<any[]>('assets/fixtures/resources.json').toPromise());
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

  async loadCache() {
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

  importJoin() {
    this.angularFireAuth.authState.subscribe(async user => {
      if (user) {
        await this.loadCache();
        this.joinedAttacks = JSON.parse(JSON.stringify(this.attacks));
        this.joinedAttacks.forEach(attack => this.autoJoin(attack));
        // this.addElementsToCollection('attacks', this.joinedAttacks, true);
        this.joinedFactions = JSON.parse(JSON.stringify(this.factions));
        this.joinedFactions.forEach(faction => this.autoJoin(faction));
        // this.addElementsToCollection('factions', this.joinedFactions, true);
        this.joinedGuilds = JSON.parse(JSON.stringify(this.guilds));
        this.joinedGuilds.forEach(guild => this.autoJoin(guild));
        // this.addElementsToCollection('guilds', this.joinedGuilds, true);
        this.joinedFamilies = JSON.parse(JSON.stringify(this.families));
        this.joinedFamilies.forEach(family => this.autoJoin(family));
        // this.addElementsToCollection('families', this.joinedFamilies, true);
        this.joinedCategories = JSON.parse(JSON.stringify(this.categories));
        this.joinedCategories.forEach(category => this.autoJoin(category));
        //  this.addElementsToCollection('categories', this.joinedCategories, true);
        this.joinedGods = JSON.parse(JSON.stringify(this.gods));
        this.joinedGods.forEach(god => this.autoJoin(god));
        //  this.addElementsToCollection('gods', this.joinedGods, true);
        this.joinedResources = JSON.parse(JSON.stringify(this.resources));
        this.joinedResources.forEach(resource => this.autoJoin(resource));
        // this.addElementsToCollection('resources', this.joinedResources, true);
        this.joinedStructures = JSON.parse(JSON.stringify(this.structures));
        this.joinedStructures.forEach(structure => this.autoJoin(structure));
        // this.addElementsToCollection('structures', this.joinedStructures, true);
        this.joinedSkills = JSON.parse(JSON.stringify(this.skills));
        this.joinedSkills.forEach(skill => this.autoJoin(skill));
        // this.addElementsToCollection('skills', this.joinedSkills, true);
        this.joinedUnits = JSON.parse(JSON.stringify(this.units));
        this.joinedUnits.forEach(unit => this.autoJoin(unit));
        // this.addElementsToCollection('units', this.joinedUnits, true);
        this.joinedItems = JSON.parse(JSON.stringify(this.items));
        this.joinedItems.forEach(item => this.autoJoin(item));
        // this.addElementsToCollection('items', this.joinedItems, true);
        this.joinedSpells = JSON.parse(JSON.stringify(this.spells));
        this.joinedSpells.forEach(spell => this.autoJoin(spell));
        // this.addElementsToCollection('spells', this.joinedSpells, true);
        this.joinedHeroes = JSON.parse(JSON.stringify(this.heroes));
        this.joinedHeroes.forEach(hero => this.autoJoin(hero));
        // this.addElementsToCollection('heroes', this.joinedHeroes, true);
        this.joinedStores = JSON.parse(JSON.stringify(this.stores));
        this.joinedStores.forEach(store => this.autoJoin(store));
        this.addElementsToCollection('stores', this.joinedStores, true);
        this.joinedLocations = JSON.parse(JSON.stringify(this.locations));
        this.joinedLocations.forEach(quest => this.autoJoin(quest));
        // this.addElementsToCollection('locations', this.joinedLocations, true);
        this.joinedKingdoms = JSON.parse(JSON.stringify(this.kingdoms));
        this.joinedKingdoms.forEach(kingdom => this.autoJoin(kingdom));
        // this.addElementsToCollection('kingdoms', this.joinedKingdoms, true);
      }
    });
  }

}
