import { Component, OnInit } from '@angular/core';
import { MapboxService, MarkerType } from 'src/app/services/mapbox.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Store } from '@ngxs/store';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
@UntilDestroy()
export class MapComponent implements OnInit {

  uid: string = null;
  container = 'map';

  constructor(
    private mapboxService: MapboxService,
    private firebaseService: FirebaseService,
    private angularFireAuth: AngularFireAuth,
    private angularFirestore: AngularFirestore,
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.mapboxService.initialize(this.container);
    this.mapboxService.map.on('load', () => {
      this.mapboxService.resize();
      this.angularFirestore.collection<any>('quests').stateChanges().subscribe(snapshotChanges => {
        snapshotChanges.forEach(async change => {
          switch (change.type) {
            case 'added':
              let quest = await this.firebaseService.selfJoin({ ...change.payload.doc.data(), fid: change.payload.doc.id });
              this.mapboxService.addMarker(quest, MarkerType.quest, true, false, false);
              break;
            case 'removed':
              this.mapboxService.removeMarker(change.payload.doc.id);
              break;
          }
        })
      });
      this.angularFirestore.collection<any>('kingdoms').stateChanges().subscribe(snapshotChanges => {
        snapshotChanges.forEach(async change => {
          let kingdom = await this.firebaseService.selfJoin({ ...change.payload.doc.data(), fid: change.payload.doc.id });
          switch (change.type) {
            case 'added':
              this.mapboxService.addMarker(kingdom, MarkerType.kingdom, true, kingdom.id === this.uid, false);
              break;
            case 'modified':
              this.mapboxService.removeMarker(change.payload.doc.id);
              this.mapboxService.addMarker(kingdom, MarkerType.kingdom, true, kingdom.id === this.uid, false);
              break;
            case 'removed':
              this.mapboxService.removeMarker(change.payload.doc.id);
              break;
          }
        })
      });
      this.angularFirestore.collection<any>('shops').stateChanges().subscribe(snapshotChanges => {
        snapshotChanges.forEach(async change => {
          switch (change.type) {
            case 'added':
              let shop = await this.firebaseService.selfJoin({ ...change.payload.doc.data(), fid: change.payload.doc.id });
              this.mapboxService.addMarker(shop, MarkerType.shop, true, false, false);
              break;
            case 'removed':
              this.mapboxService.removeMarker(change.payload.doc.id);
              break;
          }
        })
      });
    });
  }

}
