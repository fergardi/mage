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
}

@Injectable({
  providedIn: 'root'
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
    }
  }

  async getFactions() {
    if (!localStorage.getItem(CollectionType.FACTIONS)) {
      let snapshot = await this.angularFirestore.collection(CollectionType.FACTIONS).get().toPromise();
      let factions = snapshot.docs.map(faction => faction.data());
      factions.forEach(faction => {
        faction.adjacents = faction.adjacents.map((adjacent: string) => {
          let f = factions.find(f => f.id === adjacent);
          return f
            ? {
              ...f,
              adjacents: [],
              opposites: [],
            }
            : null;
        });
        faction.opposites = faction.opposites.map((opposite: string) => {
          let f = factions.find(f => f.id === opposite);
          return f
            ? {
              ...f,
              adjacents: [],
              opposites: [],
            }
            : null;
        });
      });
      localStorage.setItem(CollectionType.FACTIONS, JSON.stringify([...factions]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.FACTIONS));
  }

  async getPacks() {
    if (!localStorage.getItem(CollectionType.PACKS)) {
      let snapshot = await this.angularFirestore.collection(CollectionType.PACKS).get().toPromise();
      let packs = snapshot.docs.map(faction => faction.data());
      localStorage.setItem(CollectionType.PACKS, JSON.stringify([...packs]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.PACKS));
  }

  async getAttacks() {
    if (!localStorage.getItem(CollectionType.ATTACKS)) {
      let snapshot = await this.angularFirestore.collection(CollectionType.ATTACKS).get().toPromise();
      let attacks = snapshot.docs.map(attack => attack.data());
      localStorage.setItem(CollectionType.ATTACKS, JSON.stringify([...attacks]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.ATTACKS));
  }

  async getGuilds() {
    if (!localStorage.getItem(CollectionType.GUILDS)) {
      let snapshot = await this.angularFirestore.collection(CollectionType.GUILDS).get().toPromise();
      let guilds = snapshot.docs.map(guild => guild.data());
      localStorage.setItem(CollectionType.GUILDS, JSON.stringify([...guilds]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.GUILDS));
  }

  async getStores() {
    if (!localStorage.getItem(CollectionType.STORES)) {
      let snapshot = await this.angularFirestore.collection(CollectionType.STORES).get().toPromise();
      let stores = snapshot.docs.map(faction => faction.data());
      localStorage.setItem(CollectionType.STORES, JSON.stringify([...stores]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.STORES));
  }

  async getResources() {
    if (!localStorage.getItem(CollectionType.RESOURCES)) {
      let factions = await this.getFactions();
      let snapshot = await this.angularFirestore.collection(CollectionType.RESOURCES).get().toPromise();
      let resources = snapshot.docs.map(faction => faction.data());
      resources.forEach(resource => {
        resource.join = factions.find(faction => faction.id === resource.faction);
      });
      localStorage.setItem(CollectionType.RESOURCES, JSON.stringify([...resources]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.RESOURCES));
  }

  async getStructures() {
    if (!localStorage.getItem(CollectionType.STRUCTURES)) {
      let factions = await this.getFactions();
      let resources = await this.getResources();
      let snapshot = await this.angularFirestore.collection(CollectionType.STRUCTURES).get().toPromise();
      let structures = snapshot.docs.map(faction => faction.data());
      structures.forEach(structure => {
        structure.join = factions.find(faction => faction.id === structure.faction);
        structure.resources = structure.resources.map(resource => resources.find(r => r.id === resource));
      });
      localStorage.setItem(CollectionType.STRUCTURES, JSON.stringify([...structures]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.STRUCTURES));
  }

  async getHeroes() {
    if (!localStorage.getItem(CollectionType.HEROES)) {
      let factions = await this.getFactions();
      let families = await this.getFamilies();
      let resources = await this.getResources();
      let categories = await this.getCategories();
      let snapshot = await this.angularFirestore.collection(CollectionType.HEROES).get().toPromise();
      let heroes = snapshot.docs.map(faction => faction.data());
      heroes.forEach(hero => {
        hero.join = factions.find(faction => faction.id === hero.faction);
        hero.families = hero.families.map(family => families.find(f => f.id === family));
        hero.resources = hero.resources.map(resource => resources.find(r => r.id === resource));
        hero.categories = hero.categories.map(category => categories.find(r => r.id === category));
      });
      localStorage.setItem(CollectionType.HEROES, JSON.stringify([...heroes]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.HEROES));
  }

  async getGods() {
    if (!localStorage.getItem(CollectionType.GODS)) {
      let factions = await this.getFactions();
      let snapshot = await this.angularFirestore.collection(CollectionType.GODS).get().toPromise();
      let gods = snapshot.docs.map(god => god.data());
      gods.forEach(god => {
        god.join = factions.find(faction => faction.id === god.faction);
      });
      localStorage.setItem(CollectionType.GODS, JSON.stringify([...gods]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.GODS));
  }

  async getSkills() {
    if (!localStorage.getItem(CollectionType.SKILLS)) {
      let factions = await this.getFactions();
      let snapshot = await this.angularFirestore.collection(CollectionType.SKILLS).get().toPromise();
      let skills = snapshot.docs.map(skill => skill.data());
      skills.forEach(skill => {
        skill.join = factions.find(faction => faction.id === skill.faction);
      });
      localStorage.setItem(CollectionType.SKILLS, JSON.stringify([...skills]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.SKILLS));
  }

  async getCategories() {
    if (!localStorage.getItem(CollectionType.CATEGORIES)) {
      let factions = await this.getFactions();
      let snapshot = await this.angularFirestore.collection(CollectionType.CATEGORIES).get().toPromise();
      let categories = snapshot.docs.map(category => category.data());
      categories.forEach(category => {
        category.join = factions.find(faction => faction.id === category.faction);
      });
      localStorage.setItem(CollectionType.CATEGORIES, JSON.stringify([...categories]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.CATEGORIES));
  }

  async getFamilies() {
    if (!localStorage.getItem(CollectionType.FAMILIES)) {
      let factions = await this.getFactions();
      let snapshot = await this.angularFirestore.collection(CollectionType.FAMILIES).get().toPromise();
      let families = snapshot.docs.map(family => family.data());
      families.forEach(family => {
        family.join = factions.find(faction => faction.id === family.faction);
      });
      localStorage.setItem(CollectionType.FAMILIES, JSON.stringify([...families]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.FAMILIES));
  }

  async getLocations() {
    if (!localStorage.getItem(CollectionType.LOCATIONS)) {
      let families = await this.getFamilies();
      let snapshot = await this.angularFirestore.collection(CollectionType.LOCATIONS).get().toPromise();
      let locations = snapshot.docs.map(location => location.data());
      locations.forEach(location => {
        location.families = location.families.map(family => families.find(f => f.id === family));
      });
      localStorage.setItem(CollectionType.LOCATIONS, JSON.stringify([...locations]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.LOCATIONS));
  }

  async getUnits() {
    if (!localStorage.getItem(CollectionType.UNITS)) {
      let factions = await this.getFactions();
      let skills = await this.getSkills();
      let families = await this.getFamilies();
      let categories = await this.getCategories();
      let snapshot = await this.angularFirestore.collection(CollectionType.UNITS).get().toPromise();
      let units = snapshot.docs.map(unit => unit.data());
      units.forEach(unit => {
        unit.join = factions.find(faction => faction.id === unit.faction);
        unit.skills = unit.skills.map(skill => skills.find(s => s.id === skill.replace(/\+|\-|\//g, '')));
        unit.categories = unit.categories.map(category => categories.find(c => c.id === category));
        unit.resistances = unit.resistances.map(category => categories.find(c => c.id === category));
        unit.families = unit.families.map(family => families.find(f => f.id === family));
      });
      localStorage.setItem(CollectionType.UNITS, JSON.stringify([...units]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.UNITS));
  }

  async getSpells() {
    if (!localStorage.getItem(CollectionType.SPELLS)) {
      let factions = await this.getFactions();
      let skills = await this.getSkills();
      let families = await this.getFamilies();
      let categories = await this.getCategories();
      let units = await this.getUnits();
      let resources = await this.getResources();
      let snapshot = await this.angularFirestore.collection(CollectionType.SPELLS).get().toPromise();
      let spells = snapshot.docs.map(spell => spell.data());
      spells.forEach(spell => {
        spell.join = factions.find(faction => faction.id === spell.faction);
        spell.skills = spell.skills.map(skill => skills.find(s => s.id === skill.replace(/\+|\-|\//g, '')));
        spell.categories = spell.categories.map(category => categories.find(c => c.id === category));
        spell.families = spell.families.map(family => families.find(f => f.id === family));
        spell.units = spell.units.map(unit => units.find(u => u.id === unit));
        spell.resources = spell.resources.map(resource => resources.find(r => r.id === resource.replace(/\+|\-|\//g, '')));
      });
      localStorage.setItem(CollectionType.SPELLS, JSON.stringify([...spells]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.SPELLS));
  }

  async getItems() {
    if (!localStorage.getItem(CollectionType.ITEMS)) {
      let factions = await this.getFactions();
      let skills = await this.getSkills();
      let families = await this.getFamilies();
      let categories = await this.getCategories();
      let units = await this.getUnits();
      let resources = await this.getResources();
      let spells = await this.getSpells();
      let snapshot = await this.angularFirestore.collection(CollectionType.ITEMS).get().toPromise();
      let items = snapshot.docs.map(item => item.data());
      items.forEach(item => {
        item.join = factions.find(faction => faction.id === item.faction);
        item.skills = item.skills.map(skill => skills.find(s => s.id === skill.replace(/\+|\-|\//g, '')));
        item.categories = item.categories.map(category => categories.find(c => c.id === category));
        item.resistances = item.resistances.map(resistance => categories.find(c => c.id === resistance));
        item.families = item.families.map(family => families.find(f => f.id === family));
        item.units = item.units.map(unit => units.find(u => u.id === unit));
        item.resources = item.resources.map(resource => resources.find(r => r.id === resource.replace(/\+|\-|\//g, '')));
        item.spells = item.spells.map(spell => spells.find(s => s.id === spell));
      });
      localStorage.setItem(CollectionType.ITEMS, JSON.stringify([...items]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.ITEMS));
  }
}
