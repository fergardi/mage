import { Component, OnInit } from '@angular/core';
import { MapboxService, MarkerType } from 'src/app/services/mapbox.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  container = 'map';

  constructor(
    private mapboxService: MapboxService,
    private firebaseService: FirebaseService,
    private angularFireAuth: AngularFireAuth,
  ) { }

  ngOnInit(): void {
    this.mapboxService.initialize(this.container);
    this.mapboxService.map.on('load', () => {
      this.angularFireAuth.authState.subscribe(user => {
        if (user) {
          this.firebaseService.leftJoin('kingdoms', 'factions', 'faction', 'id').subscribe(kingdoms => {
            this.mapboxService.clearMarkers(MarkerType.kingdom);
            kingdoms.forEach(kingdom => {
              this.mapboxService.addMarker(kingdom.lat, kingdom.lng, kingdom.image, kingdom.fid, MarkerType.kingdom, true, kingdom.uid === user.uid ? kingdom.radius : null, false);
            })
          });
          this.firebaseService.leftJoin('artifacts', 'items', 'item', 'id').subscribe(locations => {
            this.mapboxService.clearMarkers(MarkerType.artifact);
            locations.forEach(location => {
              this.mapboxService.addMarker(location.lat, location.lng, location.image, location.fid, MarkerType.artifact, false, null, false);
            })
          });
          this.firebaseService.leftJoin('shops', 'stores', 'store', 'id').subscribe(locations => {
            this.mapboxService.clearMarkers(MarkerType.shop);
            locations.forEach(location => {
              this.mapboxService.addMarker(location.lat, location.lng, location.image, location.fid, MarkerType.shop, false, null, false);
            })
          });
        }
      });
    })
  }

}
