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
  public markers: Marker[] = [];
  private offset: number = 10;
  private uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  private primaryColor: string = null;

  constructor(
    private componentService: ComponentService,
    private store: Store,
    private apiService: ApiService,
    private notificationService: NotificationService,
  ) {
    this.mapbox.accessToken = environment.mapbox.token;
  }

  initialize(container: string | HTMLElement) {
    this.primaryColor = window.getComputedStyle(document.body).getPropertyValue('--primary-color');
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
    this.map.once('load', () => {
      // add fog https://docs.mapbox.com/mapbox-gl-js/example/add-fog/
      this.map.setFog({
        range: [0.5, 10.0],
        color: '#FFFFFF',
        'horizon-blend': 0.1,
      });
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
        exaggeration: 3,
      });
      // add a sky layer that will show when the map is highly pitched
      this.map.addLayer({
        id: 'sky-day',
        type: 'sky',
        paint: {
          'sky-type': 'gradient',
        },
      });
    });
    this.map.on('moveend', () => this.refreshMarkers());
  }

  markerVisible(marker: Marker): boolean {
    const lngLat: mapboxgl.LngLat = marker.marker.getLngLat();
    return lngLat && lngLat.lat && lngLat.lng
      ? this.map.getBounds().contains(lngLat)
      : false;
  }

  refreshMarkers(): void {
    this.markers.forEach((marker: Marker) => {
      if (marker.id !== this.uid && (this.map.getZoom() < environment.mapbox.zoom || !this.markerVisible(marker))) {
        marker.marker.getElement().style.display = 'none';
      } else {
        marker.marker.getElement().style.display = 'block';
      }
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
    // open
    .on('open', ($event: any) => {
      p = this.componentService.injectComponent(PopupComponent, component => component.data = { ...data, type: type });
      p.ref.changeDetectorRef.detectChanges();
      marker.getPopup().setDOMContent(p.html);
      s = (p.ref.instance as PopupComponent).opened
      .asObservable()
      .pipe(distinctUntilChanged())
      .subscribe(async (open: boolean) => {
        if (open) {
          await new Promise(resolve => setTimeout(resolve, 500));
          this.map.easeTo({
            center: $event.target.getLngLat(),
            offset: [0, ($event.target.getElement().clientHeight / 2) + this.offset],
          });
        }
      });
    })
    // close
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
      });
      circle.addTo(this.map);
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
      this.markers.filter((marker: Marker) => marker.type === type).slice(0).forEach((marker: Marker) => this.removeMarker(marker.id));
    } else {
      this.markers.slice(0).forEach((marker: Marker) => this.removeMarker(marker.id));
    }
  }

  resizeMap() {
    if (this.map) {
      this.map.resize();
    }
  }

  addKingdomByClick(type: FactionType): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      await this.apiService.addKingdom(null, type, $event.lngLat.lat, $event.lngLat.lng, 'bot-' + (Math.random() + 1).toString(36).substring(7));
      this.notificationService.warning('world.map.update');
    });
  }

  addShopByClick(type: StoreType): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      await this.apiService.addShop(null, type, $event.lngLat.lat, $event.lngLat.lng, 'shop-' + (Math.random() + 1).toString(36).substring(7));
      this.notificationService.warning('world.map.update');
    });
  }

  addQuestByClick(type: LocationType): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      await this.apiService.addQuest(null, type, $event.lngLat.lat, $event.lngLat.lng, 'quest-' + (Math.random() + 1).toString(36).substring(7));
      this.notificationService.warning('world.map.update');
    });
  }

  populateMapByClick(): void {
    this.map.once('click', async ($event: mapboxgl.MapMouseEvent) => {
      await this.apiService.populateMap($event.lngLat.lat, $event.lngLat.lng);
      this.notificationService.warning('world.map.update');
    });
  }

  terminalize(): void {
    this.clearMarkers();
    this.map.remove();
    this.map = null;
    this.markers = [];
  }

}
