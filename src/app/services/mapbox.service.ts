import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import { ComponentService } from '../services/component.service';
import { LocationComponent } from '../world/location/location.component';
import MapboxCircle from 'mapbox-gl-circle';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class MapboxService {
  mapbox = (mapboxgl as typeof mapboxgl);
  map: mapboxgl.Map = null;
  markers: mapboxgl.Marker[] = [];
  
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
    this.map.on('click', ($event: mapboxgl.MapMouseEvent) => {
      this.clearMarkers();
      this.firebaseService.saveElement('kingdoms', {
        faction: ['red', 'white', 'green', 'blue', 'black'][Math.floor(Math.random() * 5)],
        lat: $event.lngLat.lat,
        lng: $event.lngLat.lng
      })
    })
  }

  addMarker(lat: number, lng: number, image: string, radius: boolean = false, fly:boolean = false): mapboxgl.Marker {
    let size = 50;
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
    .setPopup(new mapboxgl.Popup({
      offset: [-12.5, -30],
      closeButton: false,
      closeOnClick: true,
      closeOnMove: false,
      maxWidth: 'none',
    }).setDOMContent(this.componentService.injectComponent(LocationComponent)))
    .addTo(this.map);
  
    if (radius) {
      new MapboxCircle({lat: lat, lng: lng}, 1000, {
        editable: false,
        fillColor: '#424242',
        fillOpacity: 0.1,
        strokeColor: '#424242'
      }).addTo(this.map);
    }
    
    if (fly) {
      this.goTo(lat, lng, true);
    }

    this.markers.push(marker);

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

  clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
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

}
