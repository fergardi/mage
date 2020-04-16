import { Component, OnInit } from '@angular/core';
import { MapboxService } from 'src/app/services/mapbox.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  container = 'map';

  constructor(private mapboxService: MapboxService) { }

  ngOnInit(): void {
    this.mapboxService.initialize(this.container);
    this.mapboxService.map.on('load', () => {
      navigator.geolocation.getCurrentPosition(position => {
        console.log(position.coords);
        Array.from({ length: 10 }, _ => {
          let coords = this.mapboxService.randomCoordinates(position.coords.latitude, position.coords.longitude);
          this.mapboxService.addMarker(coords.latitude, coords.longitude);
        });
        this.mapboxService.addMarker(position.coords.latitude, position.coords.longitude, true, true);
      }, null, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    })
  }

}
