import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';

@Injectable({
  providedIn: 'root'
})
export class MapboxService {
  mapbox = (mapboxgl as typeof mapboxgl);
  map: mapboxgl.Map;

  lat = 43.1746;
  lng = -2.4125;
  zoom = 15;

  constructor() {
    this.mapbox.accessToken = environment.mapbox.token;
  }

  initialize(container: string) {
    this.map = new mapboxgl.Map({
      container: container,
      style: environment.mapbox.style,
      zoom: this.zoom,
      center: [this.lng, this.lat],
      attributionControl: false,
      pitch: 60
    });
  }

}
