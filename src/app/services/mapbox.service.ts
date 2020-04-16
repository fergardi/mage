import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import { ComponentService } from '../services/component.service';
import { LocationComponent } from '../world/location/location.component';
import MapboxCircle from 'mapbox-gl-circle';

@Injectable({
  providedIn: 'root'
})
export class MapboxService {
  mapbox = (mapboxgl as typeof mapboxgl);
  map: mapboxgl.Map;
  
  constructor(private componentService: ComponentService) {
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
  }

  addMarker(lat: number, lng: number, radius: boolean = false, fly:boolean = false): void {
    let size = 50;
    var el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = 'url("http://localhost:7777/assets/badge.png")';
    el.style.backgroundSize = '100% 100%';
    el.style.height = size + 'px';
    el.style.width = size + 'px';
    
    new mapboxgl.Marker(el, {
      anchor: 'bottom'
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
      this.map.flyTo({
        center: [lng, lat],
        essential: true
      });
    }
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
