import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';

@Injectable({
  providedIn: 'root'
})
export class MapboxService {
  mapbox = (mapboxgl as typeof mapboxgl);
  map: mapboxgl.Map;
  
  constructor() {
    this.mapbox.accessToken = environment.mapbox.token;
  }

  initialize(container: string) {
    this.map = new mapboxgl.Map({
      container: container,
      style: environment.mapbox.style,
      zoom: environment.mapbox.zoom,
      center: [environment.mapbox.lng, environment.mapbox.lat],
      pitch: environment.mapbox.pitch,
      attributionControl: false,
      // interactive: false
    });
  }

  addMarker(lat: number, lng: number, fly:boolean = false): void {
    var el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = 'url(http://localhost:7777/assets/badge.png)';
    el.style.width = '50px';
    el.style.height = '50px';
    
    new mapboxgl.Marker(el)
    .setLngLat({ lat: lat, lng: lng })
    .setPopup(new mapboxgl.Popup({ offset: 25 })
      .setHTML('<app-building></app-building>'))
    .addTo(this.map);
    
    if (fly) {
      this.map.flyTo({
        center: [lng, lat],
        essential: true
      });
    }
  }

}
