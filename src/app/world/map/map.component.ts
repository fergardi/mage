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
  }

}
