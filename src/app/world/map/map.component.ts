import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapboxService, MarkerType } from 'src/app/services/mapbox.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Store, Select } from '@ngxs/store';
import { AngularFirestore } from '@angular/fire/firestore';
import * as geofirex from 'geofirex';
import * as firebase from 'firebase/app';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
@UntilDestroy()
export class MapComponent implements OnInit, OnDestroy {

  geofirex: any = geofirex.init(firebase);
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  @Select((state: any) => state.auth.kingdom) kingdom$: Observable<any>;
  container = 'map';

  constructor(
    public mapboxService: MapboxService,
    private firebaseService: FirebaseService,
    private angularFirestore: AngularFirestore,
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.mapboxService.initialize(this.container);
    this.mapboxService.map.on('load', () => {
      this.mapboxService.resize();
      this.angularFirestore.collection<any>('kingdoms').valueChanges().pipe(untilDestroyed(this)).subscribe(kingdoms => {
        kingdoms.forEach(async (data: any) => {
          let kingdom = await this.firebaseService.selfJoin({ ...data, fid: data.id });
          this.mapboxService.addMarker(kingdom, MarkerType.kingdom, true, kingdom.id === this.uid, false);
        })
      });
      this.kingdom$.pipe(
        switchMap(kingdom => {
          if (kingdom) {
            let quests = this.angularFirestore.collection('quests');
            return this.geofirex.query(quests.ref).within(kingdom.position, kingdom.power / 1000, 'position');
          } else {
            return of([]);
          }
        })
      ).subscribe((quests: Array<any>) => {
        this.mapboxService.clearMarkers(MarkerType.quest);
        quests.forEach(async (kingdom: any) => {
          let quest = await this.firebaseService.selfJoin({ ...kingdom, fid: kingdom.id });
          this.mapboxService.addMarker(quest, MarkerType.quest, true, false, false);
        })
      });
      this.kingdom$.pipe(
        switchMap(kingdom => {
          if (kingdom) {
            let shops = this.angularFirestore.collection('shops');
            return this.geofirex.query(shops.ref).within(kingdom.position, kingdom.power / 1000, 'position');
          } else {
            return of([]);
          }
        })
      ).subscribe((shops: Array<any>) => {
        this.mapboxService.clearMarkers(MarkerType.shop);
        shops.forEach(async (kingdom: any) => {
          let shop = await this.firebaseService.selfJoin({ ...kingdom, fid: kingdom.id });
          this.mapboxService.addMarker(shop, MarkerType.shop, true, false, false);
        })
      });
    });
  }

  ngOnDestroy(): void {
    this.mapboxService.clearMarkers();
  }

}
