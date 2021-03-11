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
    }
  }

  async getFactions() {
    if (!localStorage.getItem(CollectionType.FACTIONS)) {
      const snapshot = await this.angularFirestore.collection(CollectionType.FACTIONS).get().toPromise();
      const factions = snapshot.docs.map(faction => faction.data());
      factions.forEach(faction => {
        faction.adjacents = faction.adjacents.map((adjacent: string) => {
          const f = factions.find(fac => fac.id === adjacent);
          return f
            ? {
              ...f,
              adjacents: [],
              opposites: [],
            }
            : null;
        });
        faction.opposites = faction.opposites.map((opposite: string) => {
          const f = factions.find(fac => fac.id === opposite);
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
      const snapshot = await this.angularFirestore.collection(CollectionType.PACKS).get().toPromise();
      const packs = snapshot.docs.map(faction => faction.data());
      localStorage.setItem(CollectionType.PACKS, JSON.stringify([...packs]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.PACKS));
  }

  async getAttacks() {
    if (!localStorage.getItem(CollectionType.ATTACKS)) {
      const snapshot = await this.angularFirestore.collection(CollectionType.ATTACKS).get().toPromise();
      const attacks = snapshot.docs.map(attack => attack.data());
      localStorage.setItem(CollectionType.ATTACKS, JSON.stringify([...attacks]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.ATTACKS));
  }

  async getGuilds() {
    if (!localStorage.getItem(CollectionType.GUILDS)) {
      const snapshot = await this.angularFirestore.collection(CollectionType.GUILDS).get().toPromise();
      const guilds = snapshot.docs.map(guild => guild.data());
      localStorage.setItem(CollectionType.GUILDS, JSON.stringify([...guilds]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.GUILDS));
  }

  async getStores() {
    if (!localStorage.getItem(CollectionType.STORES)) {
      const snapshot = await this.angularFirestore.collection(CollectionType.STORES).get().toPromise();
      const stores = snapshot.docs.map(faction => faction.data());
      localStorage.setItem(CollectionType.STORES, JSON.stringify([...stores]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.STORES));
  }

  async getResources() {
    if (!localStorage.getItem(CollectionType.RESOURCES)) {
      const factions = await this.getFactions();
      const snapshot = await this.angularFirestore.collection(CollectionType.RESOURCES).get().toPromise();
      const resources = snapshot.docs.map(faction => faction.data());
      resources.forEach(resource => {
        resource.join = factions.find(faction => faction.id === resource.faction);
      });
      localStorage.setItem(CollectionType.RESOURCES, JSON.stringify([...resources]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.RESOURCES));
  }

  async getStructures() {
    if (!localStorage.getItem(CollectionType.STRUCTURES)) {
      const factions = await this.getFactions();
      const resources = await this.getResources();
      const snapshot = await this.angularFirestore.collection(CollectionType.STRUCTURES).get().toPromise();
      const structures = snapshot.docs.map(faction => faction.data());
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
      const factions = await this.getFactions();
      const families = await this.getFamilies();
      const resources = await this.getResources();
      const categories = await this.getCategories();
      const snapshot = await this.angularFirestore.collection(CollectionType.HEROES).get().toPromise();
      const heroes = snapshot.docs.map(faction => faction.data());
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
      const factions = await this.getFactions();
      const snapshot = await this.angularFirestore.collection(CollectionType.GODS).get().toPromise();
      const gods = snapshot.docs.map(god => god.data());
      gods.forEach(god => {
        god.join = factions.find(faction => faction.id === god.faction);
      });
      localStorage.setItem(CollectionType.GODS, JSON.stringify([...gods]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.GODS));
  }

  async getSkills() {
    if (!localStorage.getItem(CollectionType.SKILLS)) {
      const factions = await this.getFactions();
      const snapshot = await this.angularFirestore.collection(CollectionType.SKILLS).get().toPromise();
      const skills = snapshot.docs.map(skill => skill.data());
      skills.forEach(skill => {
        skill.join = factions.find(faction => faction.id === skill.faction);
      });
      localStorage.setItem(CollectionType.SKILLS, JSON.stringify([...skills]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.SKILLS));
  }

  async getCategories() {
    if (!localStorage.getItem(CollectionType.CATEGORIES)) {
      const factions = await this.getFactions();
      const snapshot = await this.angularFirestore.collection(CollectionType.CATEGORIES).get().toPromise();
      const categories = snapshot.docs.map(category => category.data());
      categories.forEach(category => {
        category.join = factions.find(faction => faction.id === category.faction);
      });
      localStorage.setItem(CollectionType.CATEGORIES, JSON.stringify([...categories]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.CATEGORIES));
  }

  async getFamilies() {
    if (!localStorage.getItem(CollectionType.FAMILIES)) {
      const factions = await this.getFactions();
      const snapshot = await this.angularFirestore.collection(CollectionType.FAMILIES).get().toPromise();
      const families = snapshot.docs.map(family => family.data());
      families.forEach(family => {
        family.join = factions.find(faction => faction.id === family.faction);
      });
      localStorage.setItem(CollectionType.FAMILIES, JSON.stringify([...families]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.FAMILIES));
  }

  async getLocations() {
    if (!localStorage.getItem(CollectionType.LOCATIONS)) {
      const families = await this.getFamilies();
      const snapshot = await this.angularFirestore.collection(CollectionType.LOCATIONS).get().toPromise();
      const locations = snapshot.docs.map(location => location.data());
      locations.forEach(location => {
        location.families = location.families.map(family => families.find(f => f.id === family));
      });
      localStorage.setItem(CollectionType.LOCATIONS, JSON.stringify([...locations]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.LOCATIONS));
  }

  async getUnits() {
    if (!localStorage.getItem(CollectionType.UNITS)) {
      const factions = await this.getFactions();
      const skills = await this.getSkills();
      const families = await this.getFamilies();
      const categories = await this.getCategories();
      const snapshot = await this.angularFirestore.collection(CollectionType.UNITS).get().toPromise();
      const units = snapshot.docs.map(unit => unit.data());
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
      const factions = await this.getFactions();
      const skills = await this.getSkills();
      const families = await this.getFamilies();
      const categories = await this.getCategories();
      const units = await this.getUnits();
      const resources = await this.getResources();
      const snapshot = await this.angularFirestore.collection(CollectionType.SPELLS).get().toPromise();
      const spells = snapshot.docs.map(spell => spell.data());
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
      const factions = await this.getFactions();
      const skills = await this.getSkills();
      const families = await this.getFamilies();
      const categories = await this.getCategories();
      const units = await this.getUnits();
      const resources = await this.getResources();
      const spells = await this.getSpells();
      const snapshot = await this.angularFirestore.collection(CollectionType.ITEMS).get().toPromise();
      const items = snapshot.docs.map(item => item.data());
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
