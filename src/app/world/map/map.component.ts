import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapboxService } from 'src/app/services/mapbox.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Store, Select } from '@ngxs/store';
import { AngularFirestore } from '@angular/fire/firestore';
import * as geofirex from 'geofirex';
import * as firebase from 'firebase/app';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MarkerType, LocationType, StoreType, FactionType } from 'src/app/shared/type/common.type';

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
  locations: any[] = [];
  stores: any[] = [];
  factions: any[] = [];

  constructor(
    public mapboxService: MapboxService,
    private firebaseService: FirebaseService,
    private angularFirestore: AngularFirestore,
    private store: Store,
    private activatedRoute: ActivatedRoute,
    private cacheService: CacheService,
    private notificationService: NotificationService,
  ) { }

  async ngOnInit() {
    this.mapboxService.initialize(this.container);
    this.mapboxService.map.on('load', () => {
      // resize map in case drawer has changed
      this.mapboxService.resizeMap();
      // pring kingdoms surrounding kingdom
      this.angularFirestore.collection<any>('kingdoms').valueChanges().pipe(untilDestroyed(this)).subscribe(kingdoms => {
        kingdoms.forEach(async (data: any) => {
          const kingdom = await this.firebaseService.selfJoin({ ...data, fid: data.id });
          this.mapboxService.addMarker(kingdom, MarkerType.KINGDOM, true, kingdom.id === this.uid,
            this.activatedRoute.snapshot.params.kingdom
              ? this.activatedRoute.snapshot.params.kingdom === kingdom.id
              : kingdom.id === this.uid,
            );
        });
        this.mapboxService.refreshMarkers();
      });
      // print quests surrounding kingdom
      this.kingdom$.pipe(
        switchMap(kingdom => {
          if (kingdom) {
            const quests = this.angularFirestore.collection('quests');
            return this.geofirex.query(quests.ref).within(kingdom.position, kingdom.power / 1000, 'position');
          } else {
            return of([]);
          }
        }),
      ).subscribe((quests: Array<any>) => {
        this.mapboxService.clearMarkers(MarkerType.QUEST);
        quests.forEach(async (kingdom: any) => {
          const quest = await this.firebaseService.selfJoin({ ...kingdom, fid: kingdom.id });
          this.mapboxService.addMarker(quest, MarkerType.QUEST, true, false, false);
        });
        this.mapboxService.refreshMarkers();
      });
      // print shops surrounding kingdom
      this.kingdom$.pipe(
        switchMap(kingdom => {
          if (kingdom) {
            const shops = this.angularFirestore.collection('shops');
            return this.geofirex.query(shops.ref).within(kingdom.position, kingdom.power / 1000, 'position');
          } else {
            return of([]);
          }
        }),
      ).subscribe((shops: Array<any>) => {
        this.mapboxService.clearMarkers(MarkerType.SHOP);
        shops.forEach(async (kingdom: any) => {
          const shop = await this.firebaseService.selfJoin({ ...kingdom, fid: kingdom.id });
          this.mapboxService.addMarker(shop, MarkerType.SHOP, true, false, false);
        });
        this.mapboxService.refreshMarkers();
      });
    });
    // menus
    this.stores = await this.cacheService.getStores();
    this.locations = await this.cacheService.getLocations();
    this.factions = await this.cacheService.getFactions();
    this.factions = this.factions.filter((faction: any) => faction.id !== 'grey');
  }

  addShop(type: StoreType) {
    this.notificationService.warning('world.map.add');
    this.mapboxService.addShopByClick(type);
  }

  addQuest(type: LocationType) {
    this.notificationService.warning('world.map.add');
    this.mapboxService.addQuestByClick(type);
  }

  addKingdom(type: FactionType) {
    this.notificationService.warning('world.map.add');
    this.mapboxService.addBot(type);
  }

  populateMap() {
    this.notificationService.warning('world.map.populate');
    this.mapboxService.populateMap();
  }

  ngOnDestroy(): void {
    this.mapboxService.clearMarkers();
  }

}
