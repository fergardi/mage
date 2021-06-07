import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import { ComponentService, InjectableHTML } from '../services/component.service';
import MapboxCircle from 'mapbox-gl-circle';
import { MarkerComponent } from '../world/marker/marker.component';
import { PopupComponent } from '../world/popup/popup.component';
import { Store } from '@ngxs/store';
import { AuthState } from '../shared/auth/auth.state';
import { ApiService } from './api.service';
import * as _ from 'lodash';
import { MarkerType, FactionType, StoreType, LocationType } from '../shared/type/common.type';
import { NotificationService } from './notification.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

export interface Marker {
  id: string;
  type: MarkerType;
  marker: mapboxgl.Marker;
  circle: MapboxCircle;
}

@Injectable({
  providedIn: 'root',
})
export class MapboxService {

  private mapbox = (mapboxgl as typeof mapboxgl);
  public map: mapboxgl.Map = null;
  private markers: Marker[] = [];
  private offset: number = 10;
  private uid: string;
  private primaryColor: string = null;
  // private idle: boolean = false;
  // private timeout: NodeJS.Timeout = undefined;

  constructor(
    private componentService: ComponentService,
    private store: Store,
    private apiService: ApiService,
    private notificationService: NotificationService,
  ) {
    this.mapbox.accessToken = environment.mapbox.token;
  }

  initialize(container: string) {
    this.primaryColor = window.getComputedStyle(document.body).getPropertyValue('--primary-color');
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.map = new mapboxgl.Map({
      container: container,
      style: environment.mapbox.style + '?optimize=true',
      center: [environment.mapbox.lng, environment.mapbox.lat],
      pitch: environment.mapbox.pitch,
      zoom: environment.mapbox.zoom,
      antialias: false,
      dragPan: true,
      dragRotate: true,
      attributionControl: true,
      interactive: true,
    });
    // https://docs.mapbox.com/mapbox-gl-js/example/add-terrain/
    this.map.on('load', () => {
      // add fog
      /*
      this.map.setFog({
        range: [-1, 1.5],
        color: 'white',
        'horizon-blend': 0.1,
      });
      */
      // add the DEM source as a terrain layer
      this.map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.terrain-rgb',
        tileSize: 512,
        maxzoom: environment.mapbox.zoom,
      });
      // add the DEM source as a terrain layer with exaggerated height
      this.map.setTerrain({
        source: 'mapbox-dem',
        exaggeration: 2.5,
      });
      // add a sky layer that will show when the map is highly pitched
      this.map.addLayer({
        id: 'sky-day',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-halo-color': 'rgba(255, 255, 255, 0.5)',
          'sky-atmosphere-color': 'rgba(255, 255, 255, 0.2)',
          'sky-atmosphere-sun': [270.0, 90.0],
          'sky-atmosphere-sun-intensity': 2,
          // 'sky-opacity-transition': { 'duration': 500 },
        },
      });
      /*
      const rotateCamera = (timestamp: number) => {
        if (this.idle) this.map.rotateTo((timestamp / 1000) % 360, { animate: true, easing: (t) => t, duration: 0 });
        window.requestAnimationFrame((t) => rotateCamera(0));
      }
      rotateCamera(this.map.getBearing());
      */
    });
    /*
    this.map.on('idle', () => {
      if (!this.idle && !this.timeout) {
        this.timeout = setTimeout(() => {
          this.idle = true;
          clearTimeout(this.timeout);
          this.timeout = undefined;
        }, 10000);
      }
    });
    this.map.on('click', () => this.idle = false);
    this.map.on('mousedown', () => this.idle = false);
    this.map.on('touchstart', () => this.idle = false);
    this.map.on('boxzoomstart', () => this.idle = false);
    this.map.on('drag', () => this.idle = false);
    this.map.on('zoomstart', () => this.idle = false);
    this.map.on('wheel', () => this.idle = false);
    */
    this.map.on('moveend', () => this.refreshMarkers());
  }

  markerVisible(marker: Marker): boolean {
    const lngLat: mapboxgl.LngLat = marker.marker.getLngLat()
    return lngLat && lngLat.lat && lngLat.lng
      ? this.map.getBounds().contains(lngLat)
      : false;
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
      this.notificationService.warning('world.map.update');
    });
  }

  addShopByClick(type: StoreType): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      await this.apiService.addShop(null, type, $event.lngLat.lat, $event.lngLat.lng, 'test');
      this.notificationService.warning('world.map.update');
    });
  }

  addQuestByClick(type: LocationType): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      await this.apiService.addQuest(null, type, $event.lngLat.lat, $event.lngLat.lng, 'test');
      this.notificationService.warning('world.map.update');
    });
  }

  addMarker(data: any, type: MarkerType, radius: boolean = false, fly: boolean = false): mapboxgl.Marker {
    // remove the old one
    this.removeMarker(data.id);
    // size
    const size = type === MarkerType.KINGDOM ? 70 : 44;
    // marker
    const m: InjectableHTML = this.componentService.injectComponent(MarkerComponent, component => component.data = { ...data, size: size, type: type });
    let marker = new mapboxgl.Marker(m.html, { anchor: 'bottom' })
    .setLngLat({ lat: data.coordinates.latitude, lng: data.coordinates.longitude })
    .addTo(this.map);
    // popup
    let p: InjectableHTML = null;
    let s: Subscription = null;
    marker = marker.setPopup(new mapboxgl.Popup({
      offset: [0, -(size + this.offset)],
      anchor: 'bottom',
      closeButton: false,
      closeOnClick: true,
      closeOnMove: false,
      maxWidth: 'none',
      className: 'dialog-responsive',
    })
    .setDOMContent(document.createElement('div') as HTMLDivElement)
    .on('open', ($event: any) => {
      p = this.componentService.injectComponent(PopupComponent, component => component.data = { ...data, type: type });
      p.ref.changeDetectorRef.detectChanges();
      marker.getPopup().setDOMContent(p.html);
      s = (p.ref.instance as PopupComponent).opened
      .asObservable()
      .pipe(distinctUntilChanged())
      .subscribe(async open => {
        if (open) {
          await new Promise(resolve => setTimeout(resolve, 500));
          this.map.easeTo({
            center: $event.target.getLngLat(),
            offset: [0, ($event.target.getElement().clientHeight / 2) + this.offset],
          });
        }
      });
    })
    .on('close', () => {
      marker.getPopup().setDOMContent(document.createElement('div') as HTMLDivElement);
      if (p && p.ref) {
        p.ref.destroy();
        p = null;
      }
      if (s) {
        s.unsubscribe();
        s = null;
      }
    }));
    // radius
    let circle = null;
    if (radius) {
      circle = new MapboxCircle({ lat: data.coordinates.latitude, lng: data.coordinates.longitude }, Math.max(1000, data.power), {
        editable: false,
        fillColor: this.primaryColor,
        fillOpacity: 0.2,
        strokeColor: this.primaryColor,
        strokeWeight: 1,
        strokeOpacity: 1,
        refineStroke : false,
      })
      .addTo(this.map);
    }
    // center
    if (fly) {
      this.goTo(data.coordinates.latitude, data.coordinates.longitude, true);
    }
    // add to list for future disposal
    this.markers.push({ id: data.id, marker: marker, circle: circle, type: type });
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
    if (this.map) this.map.resize();
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

  openPopup(latitude: number, longitude: number): void {
    this.map.fire('click', { lngLat: { lon: longitude, lat: latitude }});
  }

}
