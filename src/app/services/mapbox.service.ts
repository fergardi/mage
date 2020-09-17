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
import { ApiService } from './api.service';
import * as _ from 'lodash';
import { MarkerType, FactionType, StoreType, LocationType } from '../shared/type/common.type';

interface Marker {
  id: string;
  type: MarkerType;
  marker: mapboxgl.Marker;
  circle: MapboxCircle;
}

@Injectable({
  providedIn: 'root',
})
export class MapboxService {

  private geofirex: any = geofirex.init(firebase);
  private mapbox = (mapboxgl as typeof mapboxgl);
  public map: mapboxgl.Map = null;
  private markers: Marker[] = [];
  private offset: number = 10;
  private uid: string = this.store.selectSnapshot(AuthState.getUserUID);

  constructor(
    private componentService: ComponentService,
    private firebaseService: FirebaseService,
    private angularFirestore: AngularFirestore,
    private store: Store,
    private randomService: RandomService,
    private apiService: ApiService,
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
      attributionControl: true,
      interactive: true,
    });
    this.map.on('moveend', () => this.refreshMarkers());
  }

  refreshMarkers(): void {
    this.markers.forEach((marker: any) => {
      if (marker.type !== MarkerType.KINGDOM) {
        marker.marker._element.style.visibility = this.map.getZoom() >= 10 ? 'visible' : 'hidden';
      }
    });
  }

  addMe(): void {
    navigator.geolocation.getCurrentPosition(async position => {
      this.addKingdom(this.uid, 'Fergardi', FactionType.black, position.coords.latitude, position.coords.longitude);
      this.goTo(position.coords.latitude, position.coords.longitude, true);
    }, null, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  }

  addBot(type: FactionType): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      const uid = this.angularFirestore.collection<any>('kingdoms').ref.doc().id;
      this.addKingdom(uid, this.randomService.kingdom(), type, $event.lngLat.lat, $event.lngLat.lng);
    });
  }

  async addKingdom(id: string, name: string, type: FactionType, latitude: number, longitude: number) {
    await this.firebaseService.addElementToCollection('kingdoms', {
      id: id,
      faction: type,
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

  addShopByClick(type: StoreType): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      this.addShop(type, $event.lngLat.lat, $event.lngLat.lng, null);
    });
  }

  async addShop(type: StoreType, latitude: number, longitude: number, name: string) {
    const geopoint = this.geofirex.point(latitude, longitude);
    const ref = await this.angularFirestore.doc(`shops/${geopoint.geohash}`).get().toPromise();
    if (!ref.exists) {
      await this.firebaseService.addElementToCollection('shops', {
        store: type,
        position: geopoint,
        coordinates: {
          latitude: latitude,
          longitude: longitude,
        },
        name: name,
      }, geopoint.geohash);
      switch (type) {
        case StoreType.INN:
          this.firebaseService.addElementsToCollection(`shops/${geopoint.geohash}/contracts`, [
            { id: 'dragon-rider', gold: 23000, level: 2 },
          ]);
          break;
        case StoreType.MERCENARY:
          this.firebaseService.addElementsToCollection(`shops/${geopoint.geohash}/troops`, [
            { id: 'skeleton', gold: 1, quantity: 20000 },
          ]);
          break;
        case StoreType.MERCHANT:
          this.firebaseService.addElementsToCollection(`shops/${geopoint.geohash}/artifacts`, [
            { id: 'magical-chest', gold: 1000000, quantity: 1 },
            { id: 'stone-chest', gold: 1000000, quantity: 2 },
          ]);
          break;
        case StoreType.ALCHEMIST:
          this.firebaseService.addElementsToCollection(`shops/${geopoint.geohash}/artifacts`, [
            { id: 'love-potion', gold: 1000000, quantity: 1 },
            { id: 'mana-potion', gold: 1000000, quantity: 2 },
            { id: 'strength-potion', gold: 1000000, quantity: 2 },
          ]);
          break;
        case StoreType.SORCERER:
          this.firebaseService.addElementsToCollection(`shops/${geopoint.geohash}/charms`, [
            { id: 'animate-skeleton', gold: 1000000, level: 1 },
          ]);
          break;
      }
    }
  }

  addQuestByClick(type: LocationType): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      this.addQuest(type, $event.lngLat.lat, $event.lngLat.lng, null);
    });
  }

  async addQuest(type: LocationType, latitude: number, longitude: number, name: string) {
    const geopoint = this.geofirex.point(latitude, longitude);
    const ref = await this.angularFirestore.doc(`quests/${geopoint.geohash}`).get().toPromise();
    if (!ref.exists) {
      await this.firebaseService.addElementToCollection('quests', {
        location: type,
        position: geopoint,
        coordinates: {
          latitude: latitude,
          longitude: longitude,
        },
        name: name,
      }, geopoint.geohash);
      let troops = [];
      let contracts = [];
      let artifacts = [];
      switch (type) {
        case LocationType.GRAVEYARD:
          troops = [
            { id: 'skeleton', quantity: 123123 },
            { id: 'zombie', quantity: 123132 },
            { id: 'lich', quantity: 123132 },
            { id: 'bone-dragon', quantity: 3 },
          ];
          contracts = [
            { id: 'necrophage', level: 1 },
          ];
          break;
        case LocationType.TOWN:
          troops = [
            { id: 'werewolf', quantity: 123123 },
            { id: 'vampire', quantity: 123132 },
            { id: 'wraith', quantity: 123132 },
            { id: 'nightmare', quantity: 3 },
          ];
          contracts = [
            { id: 'necromancer', level: 1 },
          ];
          break;
        case LocationType.CATHEDRAL:
          troops = [
            { id: 'monk', quantity: 123123 },
            { id: 'templar', quantity: 123132 },
            { id: 'paladin', quantity: 123132 },
          ];
          contracts = [
            { id: 'commander', level: 1 },
          ];
          break;
        case LocationType.CASTLE:
          troops = [
            { id: 'knight', quantity: 123123 },
            { id: 'crusader', quantity: 123132 },
            { id: 'griffon', quantity: 123132 },
          ];
          contracts = [
            { id: 'commander', level: 1 },
          ];
          break;
        case LocationType.CAVE:
          troops = [
            { id: 'gnoll', quantity: 123123 },
            { id: 'orc', quantity: 123132 },
          ];
          break;
        case LocationType.DUNGEON:
          troops = [
            { id: 'wood-golem', quantity: 123123 },
            { id: 'stone-golem', quantity: 123132 },
            { id: 'crystal-golem', quantity: 123132 },
            { id: 'iron-golem', quantity: 123132 },
          ];
          break;
        case LocationType.FOREST:
          troops = [
            { id: 'bat', quantity: 123123 },
            { id: 'frog', quantity: 123132 },
            { id: 'rat', quantity: 123132 },
          ];
          break;
        case LocationType.LAKE:
          troops = [
            { id: 'basilisk', quantity: 123123 },
            { id: 'wyvern', quantity: 123132 },
          ];
          break;
        case LocationType.MINE:
          troops = [
            { id: 'ice-elemental', quantity: 123132 },
            { id: 'fire-elemental', quantity: 123132 },
            { id: 'earth-elemental', quantity: 123132 },
          ];
          contracts = [
            { id: 'elementalist', level: 6 },
          ];
          break;
        case LocationType.MONOLITH:
          troops = [
            { id: 'lightning-elemental', quantity: 123123 },
            { id: 'light-elemental', quantity: 123132 },
          ];
          contracts = [
            { id: 'elementalist', level: 6 },
          ];
          break;
        case LocationType.MOUNTAIN:
          troops = [
            { id: 'yeti', quantity: 123123 },
            { id: 'cyclop', quantity: 123132 },
            { id: 'ogre', quantity: 123132 },
            { id: 'frost-giant', quantity: 123132 },
          ];
          break;
        case LocationType.NEST:
          troops = [
            { id: 'blue-dragon', quantity: 1 },
            { id: 'red-dragon', quantity: 1 },
            { id: 'golden-dragon', quantity: 1 },
            { id: 'white-dragon', quantity: 1 },
            { id: 'baby-dragon', quantity: 1 },
          ];
          break;
        case LocationType.VOLCANO:
          troops = [
            { id: 'demon', quantity: 666 },
            { id: 'devil', quantity: 666 },
            { id: 'wendigo', quantity: 666 },
            { id: 'fire-elemental', quantity: 666 },
          ];
          break;
        case LocationType.BARRACK:
          troops = [
            { id: 'cavalry', quantity: 123456 },
            { id: 'fanatic', quantity: 123456 },
            { id: 'pikeman', quantity: 123456 },
            { id: 'archer', quantity: 123456 },
          ];
          contracts = [
            { id: 'commander', level: 1 },
          ];
          break;
        case LocationType.ISLAND:
          troops = [
            { id: 'crystal-golem', quantity: 123132 },
            { id: 'ice-elemental', quantity: 123132 },
          ];
          break;
        case LocationType.TOTEM:
          troops = [
            { id: 'goblin', quantity: 123132 },
            { id: 'goblin', quantity: 123132 },
            { id: 'goblin', quantity: 123132 },
            { id: 'goblin', quantity: 123132 },
            { id: 'goblin', quantity: 123132 },
          ];
          break;
        case LocationType.PYRAMID:
          troops = [
            { id: 'wraith', quantity: 123132 },
            { id: 'zombie', quantity: 123132 },
            { id: 'skeleton', quantity: 123132 },
          ];
          contracts = [
            { id: 'mummy', level: 6 },
          ];
          break;
        case LocationType.SHIP:
          troops = [
            { id: 'leviathan', quantity: 123132 },
          ];
          break;
        case LocationType.RUIN:
          troops = [
            { id: 'giant-spider', quantity: 123132 },
            { id: 'basilisk', quantity: 123132 },
          ];
          break;
        case LocationType.SHRINE:
          troops = [
            { id: 'djinni', quantity: 123132 },
            { id: 'wisp', quantity: 123132 },
            { id: 'werebear', quantity: 123132 },
          ];
          break;
      }
      artifacts = [
        { id: 'valhalla-horn', quantity: 1, turns: 10 },
      ];
      this.firebaseService.addElementsToCollection(`quests/${geopoint.geohash}/troops`, troops);
      this.firebaseService.addElementsToCollection(`quests/${geopoint.geohash}/contracts`, contracts);
      this.firebaseService.addElementsToCollection(`quests/${geopoint.geohash}/artifacts`, artifacts);
    }
  }

  addMarker(data: any, type: MarkerType, popup: boolean = false, radius: boolean = false, fly: boolean = false): mapboxgl.Marker {
    // remove the old one
    this.removeMarker(data.fid);
    // size
    const size = type === MarkerType.KINGDOM ? 70 : 40;
    // marker
    let marker = new mapboxgl.Marker(this.componentService.injectComponent(MarkerComponent, component => component.data = { ...data, size: size, type: type }), { anchor: 'bottom' })
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
    if (fly) {
      this.goTo(data.coordinates.latitude, data.coordinates.longitude, true);
      // marker.togglePopup();
    }
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

  clearMarkers(type: MarkerType = null): void {
    if (type) {
      this.markers.filter((marker: Marker) => marker.type === type).forEach((marker: Marker) => this.removeMarker(marker.id));
    } else {
      this.markers.forEach((marker: Marker) => this.removeMarker(marker.id));
      this.markers = [];
    }
  }

  resizeMap() {
    if (this.map) {
      this.map.resize();
    }
  }

  populateMap() {
    navigator.geolocation.getCurrentPosition(async position => {
      const elements: any[] = [
        { type: MarkerType.SHOP, subtype: StoreType.INN, query: '[building=hotel]', radius: 2000 },
        { type: MarkerType.SHOP, subtype: StoreType.MERCENARY, query: '[amenity=police]', radius: 5000 },
        { type: MarkerType.SHOP, subtype: StoreType.SORCERER, query: '[building=university]', radius: 2000 },
        { type: MarkerType.SHOP, subtype: StoreType.ALCHEMIST, query: '[amenity=hospital]', radius: 2000 },
        { type: MarkerType.SHOP, subtype: StoreType.MERCHANT, query: '[shop=mall]', radius: 5000 },
        { type: MarkerType.QUEST, subtype: LocationType.GRAVEYARD, query: '[landuse=cemetery]', radius: 5000 },
        { type: MarkerType.QUEST, subtype: LocationType.LAKE, query: '[sport=swimming]', radius: 5000 },
        { type: MarkerType.QUEST, subtype: LocationType.FOREST, query: '[leisure=park]', radius: 1000 },
        { type: MarkerType.QUEST, subtype: LocationType.CATHEDRAL, query: '[building=church]', radius: 2000 },
        { type: MarkerType.QUEST, subtype: LocationType.RUIN, query: '[historic=monument]', radius: 2000 },
        { type: MarkerType.QUEST, subtype: LocationType.TOWN, query: '[place=village]', radius: 10000 },
        { type: MarkerType.QUEST, subtype: LocationType.CASTLE, query: '[amenity=townhall]', radius: 5000 },
        { type: MarkerType.QUEST, subtype: LocationType.CAVE, query: '[amenity=bus_station]', radius: 5000 },
        { type: MarkerType.QUEST, subtype: LocationType.DUNGEON, query: '[amenity=post_office]', radius: 5000 },
        { type: MarkerType.QUEST, subtype: LocationType.VOLCANO, query: '[amenity=fire_station]', radius: 10000 },
        { type: MarkerType.QUEST, subtype: LocationType.PYRAMID, query: '[amenity=bank]', radius: 1000 },
        { type: MarkerType.QUEST, subtype: LocationType.NEST, query: '[aeroway=terminal]', radius: 50000 },
        { type: MarkerType.QUEST, subtype: LocationType.BARRACK, query: '[landuse=military]', radius: 50000 },
        { type: MarkerType.QUEST, subtype: LocationType.SHRINE, query: '[leisure=sports_centre]', radius: 2000 },
        { type: MarkerType.QUEST, subtype: LocationType.SHIP, query: '[waterway=dock]', radius: 5000 },
        { type: MarkerType.QUEST, subtype: LocationType.ISLAND, query: '[water=river]', radius: 5000 },
        { type: MarkerType.QUEST, subtype: LocationType.MINE, query: '[tourism=museum]', radius: 2000 },
        { type: MarkerType.QUEST, subtype: LocationType.MONOLITH, query: '[amenity=library]', radius: 5000 },
        { type: MarkerType.QUEST, subtype: LocationType.TOTEM, query: '[amenity=place_of_worship]', radius: 2000 },
        { type: MarkerType.QUEST, subtype: LocationType.MOUNTAIN, query: '[amenity=cinema]', radius: 5000 },
      ];
      const lat = 42.605556;
      const lng = -5.570000;
      const radius = 10000;
      const limit = 1;
      let query = '[out:json][timeout:300];\n';
      elements.forEach((e: any) => query += `nwr(around:${radius},${lat},${lng})${e.query};convert nwr ::geom=center(geom()),::=::,type="${e.type}",subtype="${e.subtype}";out center;\n`);
      const response: any = await this.apiService.mapQuery(query);
      const groups = _.groupBy(response.elements.filter((e: any) => e.geometry && e.geometry.coordinates && e.tags && e.tags.name), (e: any) => e.tags.subtype);
      for (const group of Object.keys(groups)) {
        for (const element of groups[group].slice(0, limit)) {
          switch (element.tags.type) {
            case (MarkerType.SHOP):
              await this.addShop(element.tags.subtype, element.geometry.coordinates[1], element.geometry.coordinates[0], element.tags.name);
              break;
            case (MarkerType.QUEST):
              await this.addQuest(element.tags.subtype, element.geometry.coordinates[1], element.geometry.coordinates[0], element.tags.name);
              break;
          }
        }
      }
    }, null, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  }

}
