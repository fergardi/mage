import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

export enum CollectionType {
  'SKILLS' = 'skills',
  'FACTIONS' = 'factions',
  'UNITS' = 'units',
  'FAMILIES' = 'families',
  'SPELLS' = 'spells',
  'STRUCTURES' = 'structures',
  'CATEGORIES' = 'categories',
  'GODS' = 'gods',
  'HEROES' = 'heroes',
  'RESOURCES' = 'resources',
  'ITEMS' = 'items',
  'STORES' = 'stores',
  'LOCATIONS' = 'locations',
  'PACKS' = 'packs',
  'GUILDS' = 'guilds',
  'ATTACKS' = 'attacks',
  'LEGENDS' = 'legends',
  'PERKS' = 'perks',
}

@Injectable({
  providedIn: 'root',
})
export class CacheService {

  constructor(
    private angularFirestore: AngularFirestore,
  ) { }

  get(collection: string) {
    switch (collection) {
      case CollectionType.PACKS:
        return this.getPacks();
      case CollectionType.GUILDS:
        return this.getGuilds();
      case CollectionType.ATTACKS:
        return this.getAttacks();
      case CollectionType.SKILLS:
        return this.getSkills();
      case CollectionType.FACTIONS:
        return this.getFactions();
      case CollectionType.UNITS:
        return this.getUnits();
      case CollectionType.FAMILIES:
        return this.getFamilies();
      case CollectionType.SPELLS:
        return this.getSpells();
      case CollectionType.STRUCTURES:
        return this.getStructures();
      case CollectionType.CATEGORIES:
        return this.getCategories();
      case CollectionType.GODS:
        return this.getGods();
      case CollectionType.HEROES:
        return this.getHeroes();
      case CollectionType.RESOURCES:
        return this.getResources();
      case CollectionType.ITEMS:
        return this.getItems();
      case CollectionType.STORES:
        return this.getStores();
      case CollectionType.LOCATIONS:
        return this.getLocations();
      case CollectionType.PERKS:
        return this.getPerks();
    }
  }

  async getFactions() {
    if (!localStorage.getItem(CollectionType.FACTIONS)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.FACTIONS).get().toPromise();
      const factions = snapshot.docs.map(faction => faction.data());
      localStorage.setItem(CollectionType.FACTIONS, JSON.stringify([...factions]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.FACTIONS));
  }

  async getPacks() {
    if (!localStorage.getItem(CollectionType.PACKS)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.PACKS).get().toPromise();
      const packs = snapshot.docs.map(faction => faction.data());
      localStorage.setItem(CollectionType.PACKS, JSON.stringify([...packs]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.PACKS));
  }

  async getAttacks() {
    if (!localStorage.getItem(CollectionType.ATTACKS)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.ATTACKS).get().toPromise();
      const attacks = snapshot.docs.map(attack => attack.data());
      localStorage.setItem(CollectionType.ATTACKS, JSON.stringify([...attacks]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.ATTACKS));
  }

  async getGuilds() {
    if (!localStorage.getItem(CollectionType.GUILDS)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.GUILDS).get().toPromise();
      const guilds = snapshot.docs.map(guild => guild.data());
      localStorage.setItem(CollectionType.GUILDS, JSON.stringify([...guilds]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.GUILDS));
  }

  async getStores() {
    if (!localStorage.getItem(CollectionType.STORES)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.STORES).get().toPromise();
      const stores = snapshot.docs.map(store => store.data());
      localStorage.setItem(CollectionType.STORES, JSON.stringify([...stores]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.STORES));
  }

  async getResources() {
    if (!localStorage.getItem(CollectionType.RESOURCES)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.RESOURCES).get().toPromise();
      const resources = snapshot.docs.map(resource => resource.data());
      localStorage.setItem(CollectionType.RESOURCES, JSON.stringify([...resources]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.RESOURCES));
  }

  async getStructures() {
    if (!localStorage.getItem(CollectionType.STRUCTURES)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.STRUCTURES).get().toPromise();
      const structures = snapshot.docs.map(structure => structure.data());
      localStorage.setItem(CollectionType.STRUCTURES, JSON.stringify([...structures]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.STRUCTURES));
  }

  async getHeroes() {
    if (!localStorage.getItem(CollectionType.HEROES)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.HEROES).get().toPromise();
      const heroes = snapshot.docs.map(hero => hero.data());
      localStorage.setItem(CollectionType.HEROES, JSON.stringify([...heroes]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.HEROES));
  }

  async getGods() {
    if (!localStorage.getItem(CollectionType.GODS)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.GODS).get().toPromise();
      const gods = snapshot.docs.map(god => god.data());
      localStorage.setItem(CollectionType.GODS, JSON.stringify([...gods]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.GODS));
  }

  async getSkills() {
    if (!localStorage.getItem(CollectionType.SKILLS)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.SKILLS).get().toPromise();
      const skills = snapshot.docs.map(skill => skill.data());
      localStorage.setItem(CollectionType.SKILLS, JSON.stringify([...skills]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.SKILLS));
  }

  async getCategories() {
    if (!localStorage.getItem(CollectionType.CATEGORIES)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.CATEGORIES).get().toPromise();
      const categories = snapshot.docs.map(category => category.data());
      localStorage.setItem(CollectionType.CATEGORIES, JSON.stringify([...categories]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.CATEGORIES));
  }

  async getFamilies() {
    if (!localStorage.getItem(CollectionType.FAMILIES)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.FAMILIES).get().toPromise();
      const families = snapshot.docs.map(family => family.data());
      localStorage.setItem(CollectionType.FAMILIES, JSON.stringify([...families]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.FAMILIES));
  }

  async getLocations() {
    if (!localStorage.getItem(CollectionType.LOCATIONS)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.LOCATIONS).get().toPromise();
      const locations = snapshot.docs.map(location => location.data());
      localStorage.setItem(CollectionType.LOCATIONS, JSON.stringify([...locations]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.LOCATIONS));
  }

  async getUnits() {
    if (!localStorage.getItem(CollectionType.UNITS)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.UNITS).get().toPromise();
      const units = snapshot.docs.map(unit => unit.data());
      localStorage.setItem(CollectionType.UNITS, JSON.stringify([...units]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.UNITS));
  }

  async getSpells() {
    if (!localStorage.getItem(CollectionType.SPELLS)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.SPELLS).get().toPromise();
      const spells = snapshot.docs.map(spell => spell.data());
      localStorage.setItem(CollectionType.SPELLS, JSON.stringify([...spells]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.SPELLS));
  }

  async getItems() {
    if (!localStorage.getItem(CollectionType.ITEMS)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.ITEMS).get().toPromise();
      const items = snapshot.docs.map(item => item.data());
      localStorage.setItem(CollectionType.ITEMS, JSON.stringify([...items]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.ITEMS));
  }

  async getPerks() {
    if (!localStorage.getItem(CollectionType.PERKS)) {
      const snapshot = await this.angularFirestore.collection<any>(CollectionType.PERKS).get().toPromise();
      const perks = snapshot.docs.map(perk => perk.data());
      localStorage.setItem(CollectionType.PERKS, JSON.stringify([...perks]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.PERKS));
  }
}
