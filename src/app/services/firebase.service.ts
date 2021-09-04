import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import * as moment from 'moment';
import { CollectionType } from './cache.service';

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
  legends: any[] = [];
  perks: any[] = [];
  packs: any[] = [];

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
  joinedLegends: any[] = [];
  joinedPerks: any[] = [];
  joinedPacks: any[] = [];

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
    this.legends = await this.httpClient.get<any[]>('assets/fixtures/legends.json').toPromise();
    this.perks = await this.httpClient.get<any[]>('assets/fixtures/perks.json').toPromise();
    this.packs = await this.httpClient.get<any[]>('assets/fixtures/packs.json').toPromise();
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
          console.log(`Loading ${CollectionType.FACTIONS}...`);
          this.importFixtures(CollectionType.FACTIONS, this.joinedFactions, batch);
        }
        this.joinedAttacks = JSON.parse(JSON.stringify(this.attacks));
        this.joinedAttacks.forEach(attack => this.joinFixtures(attack));
        if (fixtures.includes(CollectionType.ATTACKS)) {
          console.log(`Loading ${CollectionType.ATTACKS}...`);
          this.importFixtures(CollectionType.ATTACKS, this.joinedAttacks, batch);
        }
        this.joinedGuilds = JSON.parse(JSON.stringify(this.guilds));
        this.joinedGuilds.forEach(guild => this.joinFixtures(guild));
        if (fixtures.includes(CollectionType.GUILDS)) {
          console.log(`Loading ${CollectionType.GUILDS}...`);
          this.importFixtures(CollectionType.GUILDS, this.joinedGuilds, batch);
        }
        this.joinedFamilies = JSON.parse(JSON.stringify(this.families));
        this.joinedFamilies.forEach(family => this.joinFixtures(family));
        if (fixtures.includes(CollectionType.FAMILIES)) {
          console.log(`Loading ${CollectionType.FAMILIES}...`);
          this.importFixtures(CollectionType.FAMILIES, this.joinedFamilies, batch);
        }
        this.joinedCategories = JSON.parse(JSON.stringify(this.categories));
        this.joinedCategories.forEach(category => this.joinFixtures(category));
        if (fixtures.includes(CollectionType.CATEGORIES)) {
          console.log(`Loading ${CollectionType.CATEGORIES}...`);
          this.importFixtures(CollectionType.CATEGORIES, this.joinedCategories, batch);
        }
        this.joinedGods = JSON.parse(JSON.stringify(this.gods));
        this.joinedGods.forEach(god => this.joinFixtures(god));
        if (fixtures.includes(CollectionType.GODS)) {
          console.log(`Loading ${CollectionType.GODS}...`);
          this.importFixtures(CollectionType.GODS, this.joinedGods, batch);
        }
        this.joinedResources = JSON.parse(JSON.stringify(this.resources));
        this.joinedResources.forEach(resource => this.joinFixtures(resource));
        if (fixtures.includes(CollectionType.RESOURCES)) {
          console.log(`Loading ${CollectionType.RESOURCES}...`);
          this.importFixtures(CollectionType.RESOURCES, this.joinedResources, batch);
        }
        this.joinedStructures = JSON.parse(JSON.stringify(this.structures));
        this.joinedStructures.forEach(structure => this.joinFixtures(structure));
        if (fixtures.includes(CollectionType.STRUCTURES)) {
          console.log(`Loading ${CollectionType.STRUCTURES}...`);
          this.importFixtures(CollectionType.STRUCTURES, this.joinedStructures, batch);
        }
        this.joinedSkills = JSON.parse(JSON.stringify(this.skills));
        this.joinedSkills.forEach(skill => this.joinFixtures(skill));
        if (fixtures.includes(CollectionType.SKILLS)) {
          console.log(`Loading ${CollectionType.SKILLS}...`);
          this.importFixtures(CollectionType.SKILLS, this.joinedSkills, batch);
        }
        this.joinedUnits = JSON.parse(JSON.stringify(this.units));
        this.joinedUnits.forEach(unit => this.joinFixtures(unit));
        if (fixtures.includes(CollectionType.UNITS)) {
          console.log(`Loading ${CollectionType.UNITS}...`);
          this.importFixtures(CollectionType.UNITS, this.joinedUnits, batch);
        }
        this.joinedSpells = JSON.parse(JSON.stringify(this.spells));
        this.joinedSpells.forEach(spell => this.joinFixtures(spell));
        if (fixtures.includes(CollectionType.SPELLS)) {
          console.log(`Loading ${CollectionType.SPELLS}...`);
          this.importFixtures(CollectionType.SPELLS, this.joinedSpells, batch);
        }
        this.joinedItems = JSON.parse(JSON.stringify(this.items));
        this.joinedItems.forEach(item => this.joinFixtures(item));
        if (fixtures.includes(CollectionType.ITEMS)) {
          console.log(`Loading ${CollectionType.ITEMS}...`);
          this.importFixtures(CollectionType.ITEMS, this.joinedItems, batch);
        }
        this.joinedHeroes = JSON.parse(JSON.stringify(this.heroes));
        this.joinedHeroes.forEach(hero => this.joinFixtures(hero));
        if (fixtures.includes(CollectionType.HEROES)) {
          console.log(`Loading ${CollectionType.HEROES}...`);
          this.importFixtures(CollectionType.HEROES, this.joinedHeroes, batch);
        }
        this.joinedStores = JSON.parse(JSON.stringify(this.stores));
        this.joinedStores.forEach(store => this.joinFixtures(store));
        if (fixtures.includes(CollectionType.STORES)) {
          console.log(`Loading ${CollectionType.STORES}...`);
          this.importFixtures(CollectionType.STORES, this.joinedStores, batch);
        }
        this.joinedLocations = JSON.parse(JSON.stringify(this.locations));
        this.joinedLocations.forEach(quest => this.joinFixtures(quest));
        if (fixtures.includes(CollectionType.LOCATIONS)) {
          console.log(`Loading ${CollectionType.LOCATIONS}...`);
          this.importFixtures(CollectionType.LOCATIONS, this.joinedLocations, batch);
        }
        this.joinedLegends = JSON.parse(JSON.stringify(this.legends));
        this.joinedLegends.forEach(legend => this.joinFixtures(legend));
        if (fixtures.includes(CollectionType.LEGENDS)) {
          console.log(`Loading ${CollectionType.LEGENDS}...`);
          this.importFixtures(CollectionType.LEGENDS, this.joinedLegends, batch);
        }
        this.joinedPerks = JSON.parse(JSON.stringify(this.perks));
        this.joinedPerks.forEach(perk => this.joinFixtures(perk));
        if (fixtures.includes(CollectionType.PERKS)) {
          console.log(`Loading ${CollectionType.PERKS}...`);
          this.importFixtures(CollectionType.PERKS, this.joinedPerks, batch);
        }
        this.joinedPacks = JSON.parse(JSON.stringify(this.packs));
        this.joinedPacks.forEach(pack => this.joinFixtures(pack));
        if (fixtures.includes(CollectionType.PACKS)) {
          console.log(`Loading ${CollectionType.PACKS}...`);
          this.importFixtures(CollectionType.PACKS, this.joinedPacks, batch);
        }
        await batch.commit();
        console.log('Fixtures loaded!');
      }
    });
  }

}
