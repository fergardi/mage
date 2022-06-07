import { Injectable } from '@angular/core';
import { AngularFirestore, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Attack, Category, Faction, Family, God, Guild, Hero, Item, Location, Pack, Perk, Resource, Skill, Spell, Store, Structure, Unit } from '../shared/type/interface.model';

export enum CollectionType {
  SKILLS = 'skills',
  FACTIONS = 'factions',
  UNITS = 'units',
  FAMILIES = 'families',
  SPELLS = 'spells',
  STRUCTURES = 'structures',
  CATEGORIES = 'categories',
  GODS = 'gods',
  HEROES = 'heroes',
  RESOURCES = 'resources',
  ITEMS = 'items',
  STORES = 'stores',
  LOCATIONS = 'locations',
  PACKS = 'packs',
  GUILDS = 'guilds',
  ATTACKS = 'attacks',
  LEGENDS = 'legends',
  PERKS = 'perks',
}

@Injectable({
  providedIn: 'root',
})
export class CacheService {

  constructor(
    private angularFirestore: AngularFirestore,
  ) { }

  get(collection: string): Promise<Array<unknown>> {
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

  async getFactions(): Promise<Array<Faction>> {
    if (!localStorage.getItem(CollectionType.FACTIONS)) {
      const snapshot = await this.angularFirestore.collection<Faction>(CollectionType.FACTIONS).get().toPromise();
      const factions = snapshot.docs.map((faction: QueryDocumentSnapshot<Faction>) => faction.data());
      localStorage.setItem(CollectionType.FACTIONS, JSON.stringify([...factions]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.FACTIONS));
  }

  async getPacks(): Promise<Array<Pack>> {
    if (!localStorage.getItem(CollectionType.PACKS)) {
      const snapshot = await this.angularFirestore.collection<Pack>(CollectionType.PACKS).get().toPromise();
      const packs = snapshot.docs.map((faction: QueryDocumentSnapshot<Pack>) => faction.data());
      localStorage.setItem(CollectionType.PACKS, JSON.stringify([...packs]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.PACKS));
  }

  async getAttacks(): Promise<Array<Attack>> {
    if (!localStorage.getItem(CollectionType.ATTACKS)) {
      const snapshot = await this.angularFirestore.collection<Attack>(CollectionType.ATTACKS).get().toPromise();
      const attacks = snapshot.docs.map((attack: QueryDocumentSnapshot<Attack>) => attack.data());
      localStorage.setItem(CollectionType.ATTACKS, JSON.stringify([...attacks]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.ATTACKS));
  }

  async getGuilds(): Promise<Array<Guild>> {
    if (!localStorage.getItem(CollectionType.GUILDS)) {
      const snapshot = await this.angularFirestore.collection<Guild>(CollectionType.GUILDS).get().toPromise();
      const guilds = snapshot.docs.map((guild: QueryDocumentSnapshot<Guild>) => guild.data());
      localStorage.setItem(CollectionType.GUILDS, JSON.stringify([...guilds]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.GUILDS));
  }

  async getStores(): Promise<Array<Store>> {
    if (!localStorage.getItem(CollectionType.STORES)) {
      const snapshot = await this.angularFirestore.collection<Store>(CollectionType.STORES).get().toPromise();
      const stores = snapshot.docs.map((store: QueryDocumentSnapshot<Store>) => store.data());
      localStorage.setItem(CollectionType.STORES, JSON.stringify([...stores]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.STORES));
  }

  async getResources(): Promise<Array<Resource>> {
    if (!localStorage.getItem(CollectionType.RESOURCES)) {
      const snapshot = await this.angularFirestore.collection<Resource>(CollectionType.RESOURCES).get().toPromise();
      const resources = snapshot.docs.map((resource: QueryDocumentSnapshot<Resource>) => resource.data());
      localStorage.setItem(CollectionType.RESOURCES, JSON.stringify([...resources]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.RESOURCES));
  }

  async getStructures(): Promise<Array<Structure>> {
    if (!localStorage.getItem(CollectionType.STRUCTURES)) {
      const snapshot = await this.angularFirestore.collection<Structure>(CollectionType.STRUCTURES).get().toPromise();
      const structures = snapshot.docs.map((structure: QueryDocumentSnapshot<Structure>) => structure.data());
      localStorage.setItem(CollectionType.STRUCTURES, JSON.stringify([...structures]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.STRUCTURES));
  }

  async getHeroes(): Promise<Array<Hero>> {
    if (!localStorage.getItem(CollectionType.HEROES)) {
      const snapshot = await this.angularFirestore.collection<Hero>(CollectionType.HEROES).get().toPromise();
      const heroes = snapshot.docs.map((hero: QueryDocumentSnapshot<Hero>) => hero.data());
      localStorage.setItem(CollectionType.HEROES, JSON.stringify([...heroes]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.HEROES));
  }

  async getGods(): Promise<Array<God>> {
    if (!localStorage.getItem(CollectionType.GODS)) {
      const snapshot = await this.angularFirestore.collection<God>(CollectionType.GODS).get().toPromise();
      const gods = snapshot.docs.map((god: QueryDocumentSnapshot<God>) => god.data());
      localStorage.setItem(CollectionType.GODS, JSON.stringify([...gods]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.GODS));
  }

  async getSkills(): Promise<Array<Skill>> {
    if (!localStorage.getItem(CollectionType.SKILLS)) {
      const snapshot = await this.angularFirestore.collection<Skill>(CollectionType.SKILLS).get().toPromise();
      const skills = snapshot.docs.map((skill: QueryDocumentSnapshot<Skill>) => skill.data());
      localStorage.setItem(CollectionType.SKILLS, JSON.stringify([...skills]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.SKILLS));
  }

  async getCategories(): Promise<Array<Category>> {
    if (!localStorage.getItem(CollectionType.CATEGORIES)) {
      const snapshot = await this.angularFirestore.collection<Category>(CollectionType.CATEGORIES).get().toPromise();
      const categories = snapshot.docs.map((category: QueryDocumentSnapshot<Category>) => category.data());
      localStorage.setItem(CollectionType.CATEGORIES, JSON.stringify([...categories]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.CATEGORIES));
  }

  async getFamilies(): Promise<Array<Family>> {
    if (!localStorage.getItem(CollectionType.FAMILIES)) {
      const snapshot = await this.angularFirestore.collection<Family>(CollectionType.FAMILIES).get().toPromise();
      const families = snapshot.docs.map((family: QueryDocumentSnapshot<Family>) => family.data());
      localStorage.setItem(CollectionType.FAMILIES, JSON.stringify([...families]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.FAMILIES));
  }

  async getLocations(): Promise<Array<Location>> {
    if (!localStorage.getItem(CollectionType.LOCATIONS)) {
      const snapshot = await this.angularFirestore.collection<Location>(CollectionType.LOCATIONS).get().toPromise();
      const locations = snapshot.docs.map((location: QueryDocumentSnapshot<Location>) => location.data());
      localStorage.setItem(CollectionType.LOCATIONS, JSON.stringify([...locations]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.LOCATIONS));
  }

  async getUnits(): Promise<Array<Unit>> {
    if (!localStorage.getItem(CollectionType.UNITS)) {
      const snapshot = await this.angularFirestore.collection<Unit>(CollectionType.UNITS).get().toPromise();
      const units = snapshot.docs.map((unit: QueryDocumentSnapshot<Unit>) => unit.data());
      localStorage.setItem(CollectionType.UNITS, JSON.stringify([...units]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.UNITS));
  }

  async getSpells(): Promise<Array<Spell>> {
    if (!localStorage.getItem(CollectionType.SPELLS)) {
      const snapshot = await this.angularFirestore.collection<Spell>(CollectionType.SPELLS).get().toPromise();
      const spells = snapshot.docs.map((spell: QueryDocumentSnapshot<Spell>) => spell.data());
      localStorage.setItem(CollectionType.SPELLS, JSON.stringify([...spells]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.SPELLS));
  }

  async getItems(): Promise<Array<Item>> {
    if (!localStorage.getItem(CollectionType.ITEMS)) {
      const snapshot = await this.angularFirestore.collection<Item>(CollectionType.ITEMS).get().toPromise();
      const items = snapshot.docs.map((item: QueryDocumentSnapshot<Item>) => item.data());
      localStorage.setItem(CollectionType.ITEMS, JSON.stringify([...items]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.ITEMS));
  }

  async getPerks(): Promise<Array<Perk>> {
    if (!localStorage.getItem(CollectionType.PERKS)) {
      const snapshot = await this.angularFirestore.collection<Perk>(CollectionType.PERKS).get().toPromise();
      const perks = snapshot.docs.map((perk: QueryDocumentSnapshot<Perk>) => perk.data());
      localStorage.setItem(CollectionType.PERKS, JSON.stringify([...perks]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.PERKS));
  }
}
