import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { of, Observable } from 'rxjs';

export enum CollectionType {
  'skills' = 'skills',
  'factions' = 'factions',
  'units' = 'units',
  'families' = 'families',
  'spells' = 'spells',
  'structures' = 'structures',
  'categories' = 'categories',
  'gods' = 'gods',
  'heroes' = 'heroes',
  'resources' = 'resources',
  'items' = 'items',
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor(private angularFirestore: AngularFirestore) { }

  get(collection: string) {
    switch (collection) {
      case CollectionType.skills:
        return this.getSkills();
      case CollectionType.factions:
        return this.getFactions();
      case CollectionType.units:
        return this.getUnits();
      case CollectionType.families:
        return this.getFamilies();
      case CollectionType.spells:
        return this.getSpells();
      case CollectionType.structures:
        return this.getStructures();
      case CollectionType.categories:
        return this.getCategories();
      case CollectionType.gods:
        return this.getGods();
      case CollectionType.heroes:
        return this.getHeroes();
      case CollectionType.resources:
        return this.getResources();
      case CollectionType.items:
        return this.getItems();
    }
  }

  async getFactions() {
    if (!localStorage.getItem(CollectionType.factions)) {
      let snapshot = await this.angularFirestore.collection('factions').get().toPromise();
      let factions = snapshot.docs.map(faction => faction.data());
      localStorage.setItem(CollectionType.factions, JSON.stringify([...factions]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.factions));
  }

  async getResources() {
    if (!localStorage.getItem(CollectionType.resources)) {
      let factions = await this.getFactions();
      let snapshot = await this.angularFirestore.collection('resources').get().toPromise();
      let resources = snapshot.docs.map(faction => faction.data());
      resources.forEach(resource => {
        resource.join = factions.find(faction => faction.id === resource.faction);
      });
      localStorage.setItem(CollectionType.resources, JSON.stringify([...resources]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.resources));
  }

  async getStructures() {
    if (!localStorage.getItem(CollectionType.structures)) {
      let factions = await this.getFactions();
      let resources = await this.getResources();
      let snapshot = await this.angularFirestore.collection('structures').get().toPromise();
      let structures = snapshot.docs.map(faction => faction.data());
      structures.forEach(structure => {
        structure.join = factions.find(faction => faction.id === structure.faction);
        structure.resources = structure.resources.map(resource => resources.find(r => r.id === resource));
      });
      localStorage.setItem(CollectionType.structures, JSON.stringify([...structures]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.structures));
  }

  async getHeroes() {
    if (!localStorage.getItem(CollectionType.heroes)) {
      let factions = await this.getFactions();
      let families = await this.getFamilies();
      let resources = await this.getResources();
      let snapshot = await this.angularFirestore.collection('heroes').get().toPromise();
      let heroes = snapshot.docs.map(faction => faction.data());
      heroes.forEach(hero => {
        hero.join = factions.find(faction => faction.id === hero.faction);
        hero.families = hero.families.map(family => families.find(f => f.id === family));
        hero.resources = hero.resources.map(resource => resources.find(r => r.id === resource));
      });
      localStorage.setItem(CollectionType.heroes, JSON.stringify([...heroes]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.heroes));
  }

  async getGods() {
    if (!localStorage.getItem(CollectionType.gods)) {
      let factions = await this.getFactions();
      let snapshot = await this.angularFirestore.collection('gods').get().toPromise();
      let gods = snapshot.docs.map(god => god.data());
      gods.forEach(god => {
        god.join = factions.find(faction => faction.id === god.faction);
      });
      localStorage.setItem(CollectionType.gods, JSON.stringify([...gods]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.gods));
  }

  async getSkills() {
    if (!localStorage.getItem(CollectionType.skills)) {
      let factions = await this.getFactions();
      let snapshot = await this.angularFirestore.collection('skills').get().toPromise();
      let skills = snapshot.docs.map(skill => skill.data());
      skills.forEach(skill => {
        skill.join = factions.find(faction => faction.id === skill.faction);
      });
      localStorage.setItem(CollectionType.skills, JSON.stringify([...skills]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.skills));
  }

  async getCategories() {
    if (!localStorage.getItem(CollectionType.categories)) {
      let factions = await this.getFactions();
      let snapshot = await this.angularFirestore.collection('categories').get().toPromise();
      let categories = snapshot.docs.map(category => category.data());
      categories.forEach(category => {
        category.join = factions.find(faction => faction.id === category.faction);
      });
      localStorage.setItem(CollectionType.categories, JSON.stringify([...categories]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.categories));
  }

  async getFamilies() {
    if (!localStorage.getItem(CollectionType.families)) {
      let factions = await this.getFactions();
      let snapshot = await this.angularFirestore.collection('families').get().toPromise();
      let families = snapshot.docs.map(family => family.data());
      families.forEach(family => {
        family.join = factions.find(faction => faction.id === family.faction);
      });
      localStorage.setItem(CollectionType.families, JSON.stringify([...families]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.families));
  }

  async getUnits() {
    if (!localStorage.getItem(CollectionType.units)) {
      let factions = await this.getFactions();
      let skills = await this.getSkills();
      let families = await this.getFamilies();
      let categories = await this.getCategories();
      let snapshot = await this.angularFirestore.collection('units').get().toPromise();
      let units = snapshot.docs.map(unit => unit.data());
      units.forEach(unit => {
        unit.join = factions.find(faction => faction.id === unit.faction);
        unit.skills = unit.skills.map(skill => skills.find(s => s.id === skill));
        unit.categories = unit.categories.map(category => categories.find(c => c.id === category));
        unit.families = unit.families.map(family => families.find(f => f.id === family));
      });
      localStorage.setItem(CollectionType.units, JSON.stringify([...units]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.units));
  }

  async getSpells() {
    if (!localStorage.getItem(CollectionType.spells)) {
      let factions = await this.getFactions();
      let skills = await this.getSkills();
      let families = await this.getFamilies();
      let categories = await this.getCategories();
      let units = await this.getUnits();
      let resources = await this.getResources();
      let snapshot = await this.angularFirestore.collection('spells').get().toPromise();
      let spells = snapshot.docs.map(spell => spell.data());
      spells.forEach(spell => {
        spell.join = factions.find(faction => faction.id === spell.faction);
        spell.skills = spell.skills.map(skill => skills.find(s => s.id === skill));
        spell.categories = spell.categories.map(category => categories.find(c => c.id === category));
        spell.families = spell.families.map(family => families.find(f => f.id === family));
        spell.units = spell.units.map(unit => units.find(u => u.id === unit));
        spell.resources = spell.resources.map(resource => resources.find(r => r.id === resource));
      });
      localStorage.setItem(CollectionType.spells, JSON.stringify([...spells]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.spells));
  }

  async getItems() {
    if (!localStorage.getItem(CollectionType.items)) {
      let factions = await this.getFactions();
      let skills = await this.getSkills();
      let families = await this.getFamilies();
      let categories = await this.getCategories();
      let units = await this.getUnits();
      let resources = await this.getResources();
      let spells = await this.getSpells();
      let snapshot = await this.angularFirestore.collection('items').get().toPromise();
      let items = snapshot.docs.map(item => item.data());
      items.forEach(item => {
        item.join = factions.find(faction => faction.id === item.faction);
        item.skills = item.skills.map(skill => skills.find(s => s.id === skill));
        item.categories = item.categories.map(category => categories.find(c => c.id === category));
        item.families = item.families.map(family => families.find(f => f.id === family));
        item.units = item.units.map(unit => units.find(u => u.id === unit));
        item.resources = item.resources.map(resource => resources.find(r => r.id === resource));
        item.spells = item.spells.map(spell => spells.find(s => s.id === spell));
      });
      localStorage.setItem(CollectionType.items, JSON.stringify([...items]));
    }
    return JSON.parse(localStorage.getItem(CollectionType.items));
  }
}
