import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import { ComponentService } from '../services/component.service';
import MapboxCircle from 'mapbox-gl-circle';
import { FirebaseService } from './firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { take } from 'rxjs/operators';
import { MarkerComponent } from '../world/marker/marker.component';
import { PopupComponent } from '../world/popup/popup.component';

export const enum MarkerType {
  'kingdom', 'artifact', 'shop', 'quest'
}

export enum StoreType {
  'inn', 'stable', 'camp', 'alchemist', 'sorcerer', 'merchant',
}

export enum LocationType {
  'graveyard'
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

  mapbox = (mapboxgl as typeof mapboxgl);
  map: mapboxgl.Map = null;
  markers: Marker[] = [];
  offset: number = 10;

  constructor(
    private componentService: ComponentService,
    private firebaseService: FirebaseService,
    private angularFireAuth: AngularFireAuth,
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
      // interactive: false
    });
    this.map.addControl(new MapboxGLButtonControl('crown', 'Kingdom', this.addKingdom.bind(this)), 'bottom-right');
    this.map.addControl(new MapboxGLButtonControl('scroll-unfurled', 'Artifact', this.addArtifact.bind(this)), 'bottom-right');
    this.map.addControl(new MapboxGLButtonControl('book', 'Shop', this.addShop.bind(this)), 'bottom-right');
    this.map.addControl(new MapboxGLButtonControl('capitol', 'Quest', this.addQuest.bind(this)), 'bottom-right');
    this.map.addControl(new MapboxGLButtonControl('capitol', 'User', this.addUser.bind(this)), 'bottom-right');
  }

  addUser(): void {
    this.angularFireAuth.authState.pipe(take(1)).subscribe(user => {
      if (user) {
        navigator.geolocation.getCurrentPosition(async position => {
          await this.firebaseService.addElementToCollection('kingdoms', {
            id: user.uid,
            faction: 'black',
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            radius: 1500,
            name: 'Fergardi'
          }, user.uid);
          this.firebaseService.addElementsToCollection(`kingdoms/${user.uid}/troops`, [
            { id: 'skeleton', quantity: 20000 },
          ]);
          this.firebaseService.addElementsToCollection(`kingdoms/${user.uid}/supplies`, [
            { id: 'gold', quantity: 20000 },
            { id: 'mana', quantity: 20000 },
            { id: 'people', quantity: 20000 },
            { id: 'gem', quantity: 10 },
            { id: 'turn', quantity: 300 },
          ]);
          this.firebaseService.addElementsToCollection(`kingdoms/${user.uid}/buildings`, [
            { id: 'barrack', quantity: 0 },
            { id: 'barrier', quantity: 0 },
            { id: 'farm', quantity: 0 },
            { id: 'fortress', quantity: 0 },
            { id: 'guild', quantity: 0 },
            { id: 'node', quantity: 0 },
            { id: 'temple', quantity: 0 },
            { id: 'terrain', quantity: 0 },
            { id: 'village', quantity: 0 },
            { id: 'workshop', quantity: 0 },
          ]);
          this.goTo(position.coords.latitude, position.coords.longitude, true);
        }, null, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      }
    });
  }

  addKingdom(): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      let factions = ['red', 'white', 'green', 'blue', 'black'];
      let ref = await this.firebaseService.addElementToCollection('kingdoms', {
        faction: factions[Math.floor(Math.random() * factions.length)],
        lat: $event.lngLat.lat,
        lng: $event.lngLat.lng,
        name: 'Bot'
      })
      this.firebaseService.addElementsToCollection(`kingdoms/${ref['id']}/troops`, [{
        quantity: 20000,
        id: 'skeleton'
      }]);
    });
  }

  addArtifact(): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      let items = ['wooden-chest', 'golden-chest', 'magical-chest', 'stone-chest'];
      let ref = await this.firebaseService.addElementToCollection('artifacts', {
        item: items[Math.floor(Math.random() * items.length)],
        lat: $event.lngLat.lat,
        lng: $event.lngLat.lng
      });
      this.firebaseService.addElementsToCollection(`artifacts/${ref['id']}/rewards`, [{
        id: 'gold',
        quantity: [1000, 100000]
      }, {
        id: 'people',
        quantity: [100, 1000]
      }, {
        id: 'mana',
        quantity: [1000, 100000]
      }]);
    });
  }

  addShop(): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      let stores: StoreType[] = [StoreType.sorcerer];
      let store = stores[Math.floor(Math.random() * stores.length)];
      let ref = await this.firebaseService.addElementToCollection('shops', {
        store: StoreType[store],
        lat: $event.lngLat.lat,
        lng: $event.lngLat.lng
      });
      switch (store) {
        case StoreType.inn:
          this.firebaseService.addElementsToCollection(`shops/${ref['id']}/contracts`, [{
            gold: 23000,
            level: 2,
            id: 'dragon-rider'
          }]);
          break;
        case StoreType.camp:
          this.firebaseService.addElementsToCollection(`shops/${ref['id']}/troops`, [{
            gold: 1,
            quantity: 20000,
            id: 'skeleton'
          }]);
          break;
        case StoreType.merchant:
          this.firebaseService.addElementsToCollection(`shops/${ref['id']}/artifacts`, [{
            gold: 1000000,
            quantity: 1,
            id: 'magical-chest'
          }, {
            gold: 1000000,
            quantity: 2,
            id: 'stone-chest'
          }]);
          break;
        case StoreType.alchemist:
          this.firebaseService.addElementsToCollection(`shops/${ref['id']}/artifacts`, [{
            gold: 1000000,
            quantity: 1,
            id: 'love-potion'
          }, {
            gold: 1000000,
            quantity: 2,
            id: 'mana-potion'
          }, {
            gold: 1000000,
            quantity: 2,
            id: 'strength-potion'
          }]);
          break;
        case StoreType.sorcerer:
          this.firebaseService.addElementsToCollection(`shops/${ref['id']}/charms`, [{
            gold: 1000000,
            level: 1,
            id: 'summon-golden-dragon'
          }]);
          break;
      }
    });
  }

  addQuest(): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      let locations: LocationType[] = [LocationType.graveyard];
      let location = locations[Math.floor(Math.random() * locations.length)];
      let ref = await this.firebaseService.addElementToCollection('quests', {
        description: '',
        location: LocationType[location],
        lat: $event.lngLat.lat,
        lng: $event.lngLat.lng
      });
      switch (location) {
        case LocationType.graveyard:
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/troops`, [{
            id: 'skeleton',
            quantity: 2432576
          }, {
            id: 'lich',
            quantity: 543267
          }]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/rewards`, [{
            id: 'gold',
            quantity: 1
          }]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/contracts`, [{
            id: 'dragon-rider',
            level: 12
          }]);
          this.firebaseService.addElementsToCollection(`quests/${ref['id']}/artifacts`, [{
            id: 'magical-chest',
            quantity: 1
          }]);
          break;
      }
    });
  }

  addMarker(data: any, type: MarkerType, popup: boolean = false, radius: boolean = false, fly: boolean = false): mapboxgl.Marker {
    // html
    let size = type === MarkerType.kingdom ? 64 : 32;
    // marker
    let marker = new mapboxgl.Marker(this.componentService.injectComponent(MarkerComponent, component => component.data = { ...data, size: size }), { anchor: 'bottom' })
    .setLngLat({ lat: data.lat, lng: data.lng })
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
      .setDOMContent(this.componentService.injectComponent(PopupComponent, component => component.data = data))
      .on('open', $event => {
        this.map.easeTo({
          center: $event.target.getLngLat(),
          offset: [0, ($event.target.getElement().clientHeight / 2) + this.offset],
        });
      }));
    }
    // radius
    let circle = null;
    if (radius) {
      circle = new MapboxCircle({lat: data.lat, lng: data.lng}, data.radius, {
        editable: false,
        fillColor: '#424242',
        fillOpacity: 0.1,
        strokeColor: '#424242'
      })
      .addTo(this.map);
    }
    // center
    if (fly) this.goTo(data.lat, data.lng, true);
    // add to list for future disposal
    this.markers.push({ id: data.fid, marker: marker, circle: circle, type: type });
    // return
    return marker;
  }

  goTo(lat: number, lng: number, fly: boolean = false): void {
    if (fly) {
      this.map.flyTo({
        center: [lng, lat],
        essential: true
      });
    } else {
      this.map.easeTo({
        center: [lng, lat],
        essential: true
      })
    }
  }

  removeMarker(id: string): void {
    let index = this.markers.findIndex(item => item.id === id);
    if (index) {
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

class MapboxGLButtonControl {

  private map: mapboxgl.Map;
  private container: HTMLElement;
  private icon: string;
  private title: string;
  private event: any;

  constructor(icon: string, title: string, event: any) {
    this.icon = icon;
    this.title = title;
    this.event = event;
  }

  onAdd(map: mapboxgl.Map) {
    this.container = document.getElementById('custom-controls');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'mapboxgl-ctrl-group mapboxgl-ctrl';
      this.container.id = 'custom-controls';
    }
    let button = document.createElement("button");
    button.type = "button";
    button.title = this.title;
    button.onclick = this.event;
    button.innerHTML = `<i class="ra ra-${this.icon} ra-lg"></i>`;
    this.container.appendChild(button);
    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}
