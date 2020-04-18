import { Component, OnInit } from '@angular/core';
import { MapboxService } from 'src/app/services/mapbox.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap, map, first } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

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
      console.log('map loaded');
      this.angularFireAuth.authState.subscribe(user => {
        if (user) {
          navigator.geolocation.getCurrentPosition(async position => {
            let kingdom = {
              uid: user.uid,
              faction: ['red', 'white', 'green', 'blue', 'black'][Math.floor(Math.random() * 5)],
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            await this.firebaseService.saveElement('kingdoms', kingdom, user.uid);
            this.mapboxService.goTo(position.coords.latitude, position.coords.longitude, true);
          }, null, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
          this.firebaseService.leftJoin('kingdoms', 'factions', 'faction', 'id').subscribe(kingdoms => {
            kingdoms.forEach(kingdom => {
              this.mapboxService.addMarker(kingdom.lat, kingdom.lng, kingdom.image, kingdom.uid === user.uid, false);
            })
          });
        }
      })
    })
  }

}
