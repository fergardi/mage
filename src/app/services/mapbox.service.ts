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
import { NotificationService } from './notification.service';

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
  private uid: string;

  constructor(
    private componentService: ComponentService,
    private firebaseService: FirebaseService,
    private angularFirestore: AngularFirestore,
    private store: Store,
    private randomService: RandomService,
    private apiService: ApiService,
    private notificationService: NotificationService,
  ) {
    this.mapbox.accessToken = environment.mapbox.token;
  }

  initialize(container: string) {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
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

  markerVisible(marker: Marker): boolean {
    return this.map.getBounds().contains(marker.marker.getLngLat());
  }

  refreshMarkers(): void {
    this.markers.forEach((marker: any) => {
      if (marker.id !== this.uid && (this.map.getZoom() < environment.mapbox.zoom || !this.markerVisible(marker))) {
        marker.marker._element.style.display = 'none';
      } else {
        marker.marker._element.style.display = 'block';
      }
    });
  }

  addMe(): void {
    navigator.geolocation.getCurrentPosition(async position => {
      await this.apiService.addKingdom(this.uid, FactionType.BLACK, position.coords.latitude, position.coords.longitude, 'Fergardi');
      this.goTo(position.coords.latitude, position.coords.longitude, true);
    }, null, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  }

  addBot(type: FactionType): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      await this.apiService.addKingdom(null, type, $event.lngLat.lat, $event.lngLat.lng, 'test');
      this.notificationService.warning('world.map.populate');
    });
  }

  addShopByClick(type: StoreType): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      await this.apiService.addShop(null, type, $event.lngLat.lat, $event.lngLat.lng, 'test');
      this.notificationService.warning('world.map.populate');
    });
  }

  addQuestByClick(type: LocationType): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      await this.apiService.addQuest(null, type, $event.lngLat.lat, $event.lngLat.lng, 'test');
      this.notificationService.warning('world.map.populate');
    });
  }

  addMarker(data: any, type: MarkerType, popup: boolean = false, radius: boolean = false, fly: boolean = false): mapboxgl.Marker {
    // remove the old one
    this.removeMarker(data.fid);
    // size
    const size = type === MarkerType.KINGDOM ? 70 : 44;
    // markerData
    const markerData = JSON.parse(JSON.stringify(data));
    markerData.size = size;
    markerData.type = type;
    // popupData
    const popupData = JSON.parse(JSON.stringify(data));
    popupData.type = type;
    // marker
    let marker = new mapboxgl.Marker(this.componentService.injectComponent(MarkerComponent, component => component.data = markerData), { anchor: 'bottom' })
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
      .setDOMContent(this.componentService.injectComponent(PopupComponent, component => component.data = popupData))
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
    this.markers.push({ id: data.fid || data.id, marker: marker, circle: circle, type: type });
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
    const index = this.markers.findIndex(item => item.id === id);
    if (index !== -1) {
      const found = this.markers[index];
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

  async populateMap() {
    const elements: any[] = [
      { type: MarkerType.SHOP, subtype: StoreType.INN, query: '[building=hotel]', radius: 2000 },
      { type: MarkerType.SHOP, subtype: StoreType.MERCENARY, query: '[amenity=police]', radius: 5000 },
      { type: MarkerType.SHOP, subtype: StoreType.SORCERER, query: '[building=university]', radius: 2000 },
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
    navigator.geolocation.getCurrentPosition(async position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const radius = 10000;
      const limit = 1;
      const bounds = this.map.getBounds();
      let query = '[out:json][timeout:300][bbox];\n';
      elements.forEach((e: any) => query += `nwr${e.query};convert nwr ::geom=center(geom()),::=::,type="${e.type}",subtype="${e.subtype}";out center;\n`);
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
      const response: any = await this.apiService.mapQuery(query, bbox);
      const groups = _.groupBy(response.elements.filter((e: any) => e.geometry && e.geometry.coordinates && e.tags && e.tags.name), (e: any) => e.tags.subtype);
      for (const group of Object.keys(groups)) {
        for (const element of groups[group].slice(0, limit)) {
          switch (element.tags.type) {
            case (MarkerType.SHOP):
              await this.apiService.addShop(null, element.tags.subtype, element.geometry.coordinates[1], element.geometry.coordinates[0], element.tags.name);
              break;
            case (MarkerType.QUEST):
              await this.apiService.addQuest(null, element.tags.subtype, element.geometry.coordinates[1], element.geometry.coordinates[0], element.tags.name);
              break;
          }
        }
      }
    });
  }

}
