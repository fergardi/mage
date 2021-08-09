import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapboxService } from 'src/app/services/mapbox.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Store, Select } from '@ngxs/store';
import { AngularFirestore } from '@angular/fire/firestore';
import * as geofirex from 'geofirex';
import * as firebase from 'firebase/app';
import { Observable, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MarkerType, LocationType, StoreType, FactionType } from 'src/app/shared/type/common.type';
import { GeoFireClient } from 'geofirex';

@UntilDestroy()
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {

  geofirex: GeoFireClient = geofirex.init(firebase);
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  container = 'map';
  locations: any[] = [];
  stores: any[] = [];
  factions: any[] = [];
  @Select((state: any) => state.auth.kingdom) kingdom$: Observable<any>;

  constructor(
    public mapboxService: MapboxService,
    private angularFirestore: AngularFirestore,
    private store: Store,
    private activatedRoute: ActivatedRoute,
    private cacheService: CacheService,
    private notificationService: NotificationService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.mapboxService.initialize(this.container);
    this.mapboxService.map.on('load', async () => {
      // resize map in case drawer has changed
      this.mapboxService.resizeMap();
      // print kingdoms surrounding kingdom
      combineLatest([
        this.angularFirestore.collection<any>('kingdoms').valueChanges({ idField: 'fid' }),
        this.angularFirestore.doc<any>(`kingdoms/${this.uid}`).valueChanges()
        .pipe(switchMap((kingdom: any) => this.geofirex.query(this.angularFirestore.collection<any>('quests').ref).within(kingdom.position, Math.max(1000, kingdom.power) / 1000, 'position'))),
        this.angularFirestore.doc<any>(`kingdoms/${this.uid}`).valueChanges()
        .pipe(switchMap((kingdom: any) => this.geofirex.query(this.angularFirestore.collection<any>('shops').ref).within(kingdom.position, Math.max(1000, kingdom.power) / 1000, 'position'))),
      ])
      .pipe(untilDestroyed(this))
      .subscribe(([kingdoms, quests, shops]) => {
        this.notificationService.warning('world.map.update');
        // this.mapboxService.clearMarkers();
        kingdoms.forEach((kingdom: any) => {
          this.mapboxService.addMarker(kingdom, MarkerType.KINGDOM, kingdom.id === this.uid,
            this.activatedRoute.snapshot.params.kingdom
              ? this.activatedRoute.snapshot.params.kingdom === kingdom.id
              : false,
            );
        });
        quests.forEach((quest: any) => this.mapboxService.addMarker(quest, MarkerType.QUEST, false, false));
        shops.forEach((shop: any) => this.mapboxService.addMarker(shop, MarkerType.SHOP, false, false));
        this.mapboxService.refreshMarkers();
      });
    });
    // menus
    this.stores = await this.cacheService.getStores();
    this.locations = await this.cacheService.getLocations();
    this.factions = (await this.cacheService.getFactions()).filter((faction: any) => faction.id !== 'grey');
  }
/*
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

  addMe() {
    this.notificationService.warning('world.map.add');
    this.mapboxService.addMe();
  }

  async populateMap() {
    this.notificationService.warning('world.map.update');
    await this.mapboxService.populateMap();
  }
*/
  ngOnDestroy(): void {
    this.mapboxService.clearMarkers();
  }

}
