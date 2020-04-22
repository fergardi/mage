import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import { ComponentService } from '../services/component.service';
import MapboxCircle from 'mapbox-gl-circle';
import { FirebaseService } from './firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { first } from 'rxjs/operators';
import { MarkerComponent } from '../world/marker/marker.component';

export const enum MarkerType {
  'kingdom',
  'artifact',
  'shop',
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
    this.map.addControl(new MapboxGLButtonControl('capitol', 'User', this.addUser.bind(this)), 'bottom-right');
  }

  addUser(): void {
    this.angularFireAuth.authState.pipe(first()).subscribe(user => {
      if (user) {
        navigator.geolocation.getCurrentPosition(async position => {
          await this.firebaseService.addElementToCollection('kingdoms', {
            uid: user.uid,
            faction: 'blue',
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            radius: 1500
          }, user.uid);
          this.goTo(position.coords.latitude, position.coords.longitude, true);
        }, null, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      }
    })
  }

  addKingdom(): void {
    this.map.once('click', ($event: mapboxgl.MapMouseEvent) => {
      let factions = ['red', 'white', 'green', 'blue', 'black'];
      this.firebaseService.addElementToCollection('kingdoms', {
        faction: factions[Math.floor(Math.random() * factions.length)],
        lat: $event.lngLat.lat,
        lng: $event.lngLat.lng,
      })
    })
  }

  addArtifact(): void {
    this.map.once('click', ($event: mapboxgl.MapMouseEvent) => {
      let items = ['wooden-chest', 'golden-chest', 'magical-chest', 'petrified-chest'];
      this.firebaseService.addElementToCollection('artifacts', {
        item: items[Math.floor(Math.random() * items.length)],
        lat: $event.lngLat.lat,
        lng: $event.lngLat.lng
      })
    })
  }

  addShop(): void {
    this.map.once('click', ($event: mapboxgl.MapMouseEvent) => {
      let stores = ['inn', 'stable'];
      this.firebaseService.addElementToCollection('shops', {
        store: stores[Math.floor(Math.random() * stores.length)],
        lat: $event.lngLat.lat,
        lng: $event.lngLat.lng
      })
    })
  }

  addMarker(
    data: any,
    type: MarkerType,
    popup: boolean = false,
    radius: boolean = false,
    fly: boolean = false
  ): mapboxgl.Marker {
    // html
    let size = type === MarkerType.kingdom ? 64 : 32;
    var wrapper = document.createElement('div');
    var el = document.createElement('div');
    el.className = 'marker animated bounce';
    el.style.animationDelay = `${Math.random() + 1}s`;
    el.style.backgroundImage = `url(${data.image})`;
    el.style.backgroundSize = '100% 100%';
    el.style.height = size + 'px';
    el.style.width = size + 'px';
    wrapper.appendChild(el);
    var shadow = document.createElement('div');
    shadow.className = 'marker-shadow';
    wrapper.appendChild(shadow);
    // marker
    let marker = new mapboxgl.Marker(wrapper, {
      anchor: 'bottom',
    })
    .setLngLat({ lat: data.lat, lng: data.lng })
    .addTo(this.map);
    // popup
    if (popup) {
      marker = marker.setPopup(new mapboxgl.Popup({
        offset: [0, -(size + 5)],
        anchor: 'bottom',
        closeButton: false,
        closeOnClick: true,
        closeOnMove: false,
        maxWidth: 'none',
      }).setDOMContent(this.componentService.injectComponent(MarkerComponent, x => x.data = data)))
    }
    // radius
    let circle = null;
    if (radius) {
      circle = new MapboxCircle({lat: data.lat, lng: data.lng}, data.radius, {
        editable: false,
        fillColor: '#424242',
        fillOpacity: 0.1,
        strokeColor: '#424242'
      }).addTo(this.map);
    }
    // center
    if (fly) this.goTo(data.lat, data.lng, true);
    // return
    this.markers.push({ id: data.fid, marker: marker, circle: circle, type: type });
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
    let index = this.markers.findIndex(item => {
      return item.id === id
    });
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

  randomCoordinates(lat: number, lng: number, km: number = 5): { latitude: number, longitude: number } {
    let y0 = lat;
    let x0 = lng;
    let rd = km * 1000 / 111300;
    let u = Math.random();
    let v = Math.random();
    let w = rd * Math.sqrt(u);
    let t = 2 * Math.PI * v;
    let x = w * Math.cos(t);
    let y = w * Math.sin(t);
    return {
      latitude: y + y0,
      longitude: x + x0
    };
  }

  resize(): void {
    this.map.resize();
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
