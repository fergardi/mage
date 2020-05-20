import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import { ComponentService } from '../services/component.service';
import MapboxCircle from 'mapbox-gl-circle';
import { FirebaseService } from './firebase.service';
import { MarkerComponent } from '../world/marker/marker.component';
import { PopupComponent } from '../world/popup/popup.component';
import { Store } from '@ngxs/store';
import { AuthState } from '../shared/auth/auth.state';
import { AngularFirestore } from '@angular/fire/firestore';
import { RandomService } from './random.service';
import * as geofirex from 'geofirex';
import * as firebase from 'firebase/app';

export enum MarkerType {
  'kingdom', 'shop', 'quest',
}

export enum StoreType {
  'inn', 'mercenary', 'alchemist', 'sorcerer', 'merchant',
}

export enum LocationType {
  'cathedral', 'cave', 'dungeon', 'forest', 'graveyard', 'lake', 'mine', 'mountain', 'nest', 'volcano'
}

interface Marker {
  id: string
  type: MarkerType
  marker: mapboxgl.Marker
  circle: MapboxCircle
}

@Injectable({
  providedIn: 'root'
})
export class MapboxService {

  geofirex: any = geofirex.init(firebase);
  mapbox = (mapboxgl as typeof mapboxgl);
  map: mapboxgl.Map = null;
  markers: Marker[] = [];
  offset: number = 10;

  constructor(
    private componentService: ComponentService,
    private firebaseService: FirebaseService,
    private angularFirestore: AngularFirestore,
    private store: Store,
    private randomService: RandomService,
  ) {
    this.mapbox.accessToken = environment.mapbox.token;
  }

  initialize(container: string) {
    this.map = new mapboxgl.Map({
      container: container,
      style: environment.mapbox.style + '?optimize=true',
      zoom: environment.mapbox.zoom,
      center: [environment.mapbox.lng, environment.mapbox.lat],
      pitch: environment.mapbox.pitch,
      attributionControl: false,
      interactive: true
    });
  }

  addMe(): void {
    navigator.geolocation.getCurrentPosition(async position => {
      let uid = this.store.selectSnapshot(AuthState.getUserUID);
      this.addKingdom(uid, 'Fergardi', 'black', position.coords.latitude, position.coords.longitude);
      this.goTo(position.coords.latitude, position.coords.longitude, true);
    }, null, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  }

  addBot(): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      let factions = ['red', 'white', 'green', 'blue', 'black'];
      let uid = this.angularFirestore.collection<any>('kingdoms').ref.doc().id;
      this.addKingdom(uid, this.randomService.kingdom(), factions[Math.floor(Math.random() * factions.length)], $event.lngLat.lat, $event.lngLat.lng);
    });
  }

  async addKingdom(id: string, name: string, faction: string, latitude: number, longitude: number) {
    await this.firebaseService.addElementToCollection('kingdoms', {
      id: id,
      faction: faction,
      position: this.geofirex.point(latitude, longitude),
      coordinates: {
        latitude: latitude,
        longitude: longitude,
      },
      name: name,
      power: 1500,
    }, id);
    this.firebaseService.addElementsToCollection(`kingdoms/${id}/troops`, [
      { id: 'skeleton', quantity: 20000, assignment: 2 },
    ]);
    this.firebaseService.addElementsToCollection(`kingdoms/${id}/supplies`, [
      { id: 'gold', quantity: 20000, max: null, balance: 0 },
      { id: 'mana', quantity: 20000, max: 20000, balance: 0 },
      { id: 'population', quantity: 20000, max: 20000, balance: 0 },
      { id: 'gem', quantity: 10, max: null, balance: 0 },
      { id: 'turn', quantity: 300, max: 300, balance: 0 },
      { id: 'land', quantity: 300, max: null, balance: 0 },
    ]);
    this.firebaseService.addElementsToCollection(`kingdoms/${id}/buildings`, [
      { id: 'barrack', quantity: 100 },
      { id: 'barrier', quantity: 100 },
      { id: 'farm', quantity: 100 },
      { id: 'fortress', quantity: 100 },
      { id: 'academy', quantity: 100 },
      { id: 'node', quantity: 100 },
      { id: 'village', quantity: 100 },
      { id: 'workshop', quantity: 100 },
    ]);
    this.firebaseService.addElementsToCollection(`kingdoms/${id}/charms`, [
      { id: 'animate-skeleton', turns: 0, completed: false, total: 200 },
      { id: 'fear', turns: 0, completed: false, total: 200 },
    ]);
  }

  addShop(): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      let stores: StoreType[] = [StoreType.inn, StoreType.mercenary, StoreType.alchemist, StoreType.sorcerer, StoreType.merchant];
      let store = stores[Math.floor(Math.random() * stores.length)];
      let ref = await this.firebaseService.addElementToCollection('shops', {
        store: StoreType[store],
        position: this.geofirex.point($event.lngLat.lat, $event.lngLat.lng),
        coordinates: {
          latitude: $event.lngLat.lat,
          longitude: $event.lngLat.lng,
        },
      });
      switch (store) {
        case StoreType.inn:
          this.firebaseService.addElementsToCollection(`shops/${ref['id']}/contracts`, [
            { id: 'dragon-rider', gold: 23000,level: 2 },
          ]);
          break;
        case StoreType.mercenary:
          this.firebaseService.addElementsToCollection(`shops/${ref['id']}/troops`, [
            { id: 'skeleton', gold: 1, quantity: 20000 },
          ]);
          break;
        case StoreType.merchant:
          this.firebaseService.addElementsToCollection(`shops/${ref['id']}/artifacts`, [
            { id: 'magical-chest', gold: 1000000, quantity: 1 },
            { id: 'stone-chest', gold: 1000000, quantity: 2 },
          ]);
          break;
        case StoreType.alchemist:
          this.firebaseService.addElementsToCollection(`shops/${ref['id']}/artifacts`, [
            { id: 'love-potion', gold: 1000000, quantity: 1 },
            { id: 'mana-potion', gold: 1000000, quantity: 2 },
            { id: 'strength-potion', gold: 1000000, quantity: 2 },
          ]);
          break;
        case StoreType.sorcerer:
          this.firebaseService.addElementsToCollection(`shops/${ref['id']}/charms`, [
            { id: 'summon-golden-dragon', gold: 1000000, level: 1 },
          ]);
          break;
      }
    });
  }

  addQuest(): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      let locations: LocationType[] = [LocationType.cathedral, LocationType.cave, LocationType.dungeon, LocationType.forest, LocationType.graveyard, LocationType.lake, LocationType.mine, LocationType.mountain, LocationType.nest, LocationType.volcano];
      let location = locations[Math.floor(Math.random() * locations.length)];
      let ref = await this.firebaseService.addElementToCollection('quests', {
        location: LocationType[location],
        position: this.geofirex.point($event.lngLat.lat, $event.lngLat.lng),
        coordinates: {
          latitude: $event.lngLat.lat,
          longitude: $event.lngLat.lng,
        },
      });
      switch (location) {
        case LocationType.graveyard:
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/troops`, [
            { id: 'skeleton', quantity: 123123 },
            { id: 'zombie', quantity: 123132 },
            { id: 'lich', quantity: 123132 },
            { id: 'bone-dragon', quantity: 3 },
          ]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/contracts`, [
            { id: 'necrophage', level: 1 },
          ]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/artifacts`, [
            { id: 'magical-chest', quantity: 1 },
          ]);
          break;
        case LocationType.cathedral:
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/troops`, [
            { id: 'griffon', quantity: 123123 },
            { id: 'knight', quantity: 123132 },
            { id: 'paladin', quantity: 123132 },
          ]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/contracts`, [
            { id: 'commander', level: 1 },
          ]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/artifacts`, [
            { id: 'golden-chest', quantity: 1 },
          ]);
          break;
        case LocationType.cave:
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/troops`, [
            { id: 'gnoll', quantity: 123123 },
            { id: 'orc', quantity: 123132 },
            { id: 'goblin', quantity: 123132 },
          ]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/artifacts`, [
            { id: 'rattle', quantity: 2 },
          ]);
          break;
        case LocationType.dungeon:
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/troops`, [
            { id: 'wood-golem', quantity: 123123 },
            { id: 'stone-golem', quantity: 123132 },
            { id: 'crystal-golem', quantity: 123132 },
            { id: 'iron-golem', quantity: 123132 },
          ]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/artifacts`, [
            { id: 'animal-fang', quantity: 2 },
          ]);
          break;
        case LocationType.forest:
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/troops`, [
            { id: 'bat', quantity: 123123 },
            { id: 'frog', quantity: 123132 },
            { id: 'rat', quantity: 123132 },
          ]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/artifacts`, [
            { id: 'voodoo-doll', quantity: 2 },
          ]);
          break;
        case LocationType.lake:
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/troops`, [
            { id: 'basilisk', quantity: 123123 },
            { id: 'wyvern', quantity: 123132 },
          ]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/artifacts`, [
            { id: 'golden-idol', quantity: 1 },
          ]);
          break;
        case LocationType.mine:
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/troops`, [
            { id: 'lightning-elemental', quantity: 123123 },
            { id: 'ice-elemental', quantity: 123132 },
            { id: 'fire-elemental', quantity: 123132 },
            { id: 'earth-elemental', quantity: 123132 },
            { id: 'light-elemental', quantity: 123132 },
          ]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/contracts`, [
            { id: 'elementalist', level: 6 },
          ]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/artifacts`, [
            { id: 'earth-orb', quantity: 1 },
            { id: 'fire-orb', quantity: 1 },
          ]);
          break;
        case LocationType.mountain:
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/troops`, [
            { id: 'yeti', quantity: 123123 },
            { id: 'cyclop', quantity: 123132 },
            { id: 'ogre', quantity: 123132 },
          ]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/artifacts`, [
            { id: 'powder-barrel', quantity: 1 },
          ]);
          break;
        case LocationType.nest:
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/troops`, [
            { id: 'blue-dragon', quantity: 1 },
            { id: 'red-dragon', quantity: 1 },
            { id: 'golden-dragon', quantity: 1 },
            { id: 'white-dragon', quantity: 1 },
            { id: 'baby-dragon', quantity: 1 },
          ]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/artifacts`, [
            { id: 'dragon-egg', quantity: 1 },
          ]);
          break;
        case LocationType.volcano:
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/troops`, [
            { id: 'demon', quantity: 666 },
            { id: 'devil', quantity: 666 },
            { id: 'wendigo', quantity: 666 },
          ]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/artifacts`, [
            { id: 'valhalla-horn', quantity: 1 },
          ]);
          break;
      }
    });
  }

  addMarker(data: any, type: MarkerType, popup: boolean = false, radius: boolean = false, fly: boolean = false): mapboxgl.Marker {
    // remove the old one
    this.removeMarker(data.fid);
    // size
    let size = type === MarkerType.kingdom ? 64 : 38;
    // marker
    let marker = new mapboxgl.Marker(this.componentService.injectComponent(MarkerComponent, component => component.data = { ...data, size: size }), { anchor: 'bottom' })
    .setLngLat({ lat: data.coordinates.latitude, lng: data.coordinates.longitude })
    .addTo(this.map);
    // popup
    if (popup) {
      marker = marker.setPopup(new mapboxgl.Popup({
        offset: [0, -(size + this.offset)],
        anchor: 'bottom',
        closeButton: false,
        closeOnClick: true,
        closeOnMove: false,
        maxWidth: 'none',
      })
      .setDOMContent(this.componentService.injectComponent(PopupComponent, component => component.data = { ...data, type: type }))
      .on('open', ($event: any) => {
        this.map.easeTo({
          center: $event.target.getLngLat(),
          offset: [0, ($event.target.getElement().clientHeight / 2) + this.offset],
        });
      }));
    }
    // radius
    let circle = null;
    if (radius) {
      circle = new MapboxCircle({lat: data.coordinates.latitude, lng: data.coordinates.longitude}, data.power, {
        editable: false,
        fillColor: '#99009c',
        fillOpacity: 0.2,
        strokeColor: '#99009c',
        strokeWeight: 1,
        strokeOpacity: 1,
        refineStroke : false,
      })
      .addTo(this.map);
    }
    // center
    if (fly) this.goTo(data.coordinates.latitude, data.coordinates.longitude, true);
    // add to list for future disposal
    this.markers.push({ id: data.fid, marker: marker, circle: circle, type: type });
    // return
    return marker;
  }

  goTo(lat: number, lng: number, fly: boolean = false): void {
    if (fly) {
      this.map.flyTo({
        center: [lng, lat],
        essential: true,
      });
    } else {
      this.map.easeTo({
        center: [lng, lat],
        essential: true,
      });
    }
  }

  removeMarker(id: string): void {
    let index = this.markers.findIndex(item => item.id === id);
    if (index !== -1) {
      let found = this.markers[index];
      if (found.marker) found.marker.remove();
      if (found.circle) found.circle.remove();
      this.markers.splice(index, 1);
    }
  }

  clearMarkers(type: MarkerType): void {
    this.markers.filter((marker: Marker) => marker.type === type).forEach((marker: Marker) => this.removeMarker(marker.id));
  }

  resize() {
    if (this.map) this.map.resize();
  }
}
