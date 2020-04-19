import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import { ComponentService } from '../services/component.service';
import { LocationComponent } from '../world/location/location.component';
import MapboxCircle from 'mapbox-gl-circle';
import { FirebaseService } from './firebase.service';

export const enum MarkerType {
  'kingdom',
  'location',
}

interface Marker {
  uid: string
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
    this.map.addControl(new MapboxGLButtonControl('crown', 'Kingdom', this.addKingdom.bind(this)), 'top-left');
    this.map.addControl(new MapboxGLButtonControl('scroll-unfurled', 'Item', this.addLocation.bind(this)), 'bottom-left');
  }

  addKingdom(): void {
    this.map.once('click', ($event: mapboxgl.MapMouseEvent) => {
      let factions = ['red', 'white', 'green', 'blue', 'black'];
      this.firebaseService.addElementToCollection('kingdoms', {
        faction: factions[Math.floor(Math.random() * factions.length)],
        lat: $event.lngLat.lat,
        lng: $event.lngLat.lng
      })
    })
  }

  addLocation(): void {
    this.map.once('click', ($event: mapboxgl.MapMouseEvent) => {
      let items = ['legendary-chest'];
      this.firebaseService.addElementToCollection('locations', {
        item: items[Math.floor(Math.random() * items.length)],
        lat: $event.lngLat.lat,
        lng: $event.lngLat.lng
      })
    })
  }

  addMarker(
    lat: number,
    lng: number,
    image: string,
    uid: string,
    type: MarkerType,
    popup: boolean = false,
    radius: number = 0,
    fly: boolean = false
  ): mapboxgl.Marker {

    let size = type === MarkerType.kingdom ? 50 : 25;
    var el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = `url(${image})`;
    el.style.backgroundSize = '100% 100%';
    el.style.height = size + 'px';
    el.style.width = size + 'px';
    
    let marker = new mapboxgl.Marker(el, {
      anchor: 'bottom',
    })
    .setLngLat({ lat: lat, lng: lng })
    .addTo(this.map);
  
    if (popup) {
      marker = marker.setPopup(new mapboxgl.Popup({
        offset: [-12.5, -30],
        closeButton: false,
        closeOnClick: true,
        closeOnMove: false,
        maxWidth: 'none',
      }).setDOMContent(this.componentService.injectComponent(LocationComponent)))
    }

    let circle = null;
    if (radius) {
      circle = new MapboxCircle({lat: lat, lng: lng}, radius, {
        editable: false,
        fillColor: '#424242',
        fillOpacity: 0.1,
        strokeColor: '#424242'
      }).addTo(this.map);
    }
    
    if (fly) this.goTo(lat, lng, true);

    this.markers.push({ uid: uid, marker: marker, circle: circle, type: type });
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

  removeMarker(uid: string): void {
    let index = this.markers.findIndex(item => item.uid === uid);
    if (index) {
      let found = this.markers[index];
      if (found.marker) found.marker.remove();
      if (found.circle) found.circle.remove();
      this.markers.splice(index, 1);
    }
  }

  clearMarkers(type: MarkerType): void {
    this.markers.filter((marker: Marker) => marker.type === type).forEach((marker: Marker) => this.removeMarker(marker.uid));
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
    button.innerHTML = `<i class="ra ra-${this.icon}"></i>`;
    this.container.appendChild(button);
    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}
