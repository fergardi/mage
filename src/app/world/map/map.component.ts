import { Component, OnInit } from '@angular/core';
import { MapboxService, MarkerType } from 'src/app/services/mapbox.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { take } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
@UntilDestroy()
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
      this.angularFireAuth.authState.pipe(take(1)).subscribe(user => {
        if (user) {
          this.firebaseService.leftJoin('kingdoms', 'factions', 'faction', 'id').pipe(untilDestroyed(this)).subscribe(kingdoms => {
            this.mapboxService.clearMarkers(MarkerType.kingdom);
            kingdoms.forEach(kingdom => {
              this.mapboxService.addMarker(kingdom, MarkerType.kingdom, true, kingdom.id === user.uid, false);
            })
          });
          this.firebaseService.leftJoin('artifacts', 'items', 'item', 'id').pipe(untilDestroyed(this)).subscribe(artifacts => {
            this.mapboxService.clearMarkers(MarkerType.artifact);
            artifacts.forEach(artifact => {
              this.mapboxService.addMarker(artifact, MarkerType.artifact, true, false, false);
            })
          });
          this.firebaseService.leftJoin('shops', 'stores', 'store', 'id').pipe(untilDestroyed(this)).subscribe(shops => {
            this.mapboxService.clearMarkers(MarkerType.shop);
            shops.forEach(shop => {
              this.mapboxService.addMarker(shop, MarkerType.shop, true, false, false);
            })
          });
          this.firebaseService.leftJoin('quests', 'locations', 'location', 'id').pipe(untilDestroyed(this)).subscribe(quests => {
            this.mapboxService.clearMarkers(MarkerType.quest);
            quests.forEach(quest => {
              this.mapboxService.addMarker(quest, MarkerType.quest, true, false, false);
            })
          });
        }
      });
    })
  }

}
