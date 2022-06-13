import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapboxService } from 'src/app/services/mapbox.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Store as SStore, Select } from '@ngxs/store';
import { AngularFirestore } from '@angular/fire/firestore';
import * as geofirex from 'geofirex';
import * as firebase from 'firebase/app';
import { Observable, combineLatest, first } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MarkerType, LocationType, StoreType, FactionType } from 'src/app/shared/type/enum.type';
import { GeoFireClient } from 'geofirex';
import { LoadingService } from 'src/app/services/loading.service';
import { Faction, Kingdom, Location, Quest, Shop, Store } from 'src/app/shared/type/interface.model';

@UntilDestroy()
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {

  geofirex: GeoFireClient = geofirex.init(firebase);
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  locations: Array<Location> = [];
  stores: Array<Store> = [];
  factions: Array<Faction> = [];
  @Select(AuthState.getKingdom) kingdom$: Observable<Kingdom>;

  constructor(
    public mapboxService: MapboxService,
    private angularFirestore: AngularFirestore,
    private store: SStore,
    private activatedRoute: ActivatedRoute,
    private cacheService: CacheService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.mapboxService.initialize('map');
    this.mapboxService.map.once('load', async () => {
      this.loadingService.startLoading();
      this.mapboxService.resizeMap();
      // print icons surrounding kingdom
      combineLatest([
        this.angularFirestore.collection<Kingdom>('kingdoms').valueChanges({ idField: 'fid' }),
        this.angularFirestore.doc<Kingdom>(`kingdoms/${this.uid}`).valueChanges()
        .pipe(switchMap(kingdom => this.geofirex.query<Quest>(this.angularFirestore.collection<Quest>('quests').ref).within(kingdom.position, Math.max(1000, kingdom.power) / 1000, 'position'))),
        this.angularFirestore.doc<Kingdom>(`kingdoms/${this.uid}`).valueChanges()
        .pipe(switchMap(kingdom => this.geofirex.query<Shop>(this.angularFirestore.collection<Shop>('shops').ref).within(kingdom.position, Math.max(1000, kingdom.power) / 1000, 'position'))),
      ])
      .pipe(untilDestroyed(this))
      .pipe(first()) // to fix the refresh bug
      .subscribe(([kingdoms, quests, shops]) => {
        this.notificationService.warning('world.map.update');
        // this.mapboxService.clearMarkers();
        kingdoms.forEach(kingdom => {
          this.mapboxService.addMarker(kingdom, MarkerType.KINGDOM, kingdom.id === this.uid,
            this.activatedRoute.snapshot.params.kingdom
              ? this.activatedRoute.snapshot.params.kingdom === kingdom.id
              : false,
            );
        });
        quests.forEach(quest => this.mapboxService.addMarker(quest, MarkerType.QUEST, false, false));
        shops.forEach(shop => this.mapboxService.addMarker(shop, MarkerType.SHOP, false, false));
        this.mapboxService.refreshMarkers();
        this.loadingService.stopLoading();
      });
    });
    // menus
    this.stores = await this.cacheService.getStores();
    this.locations = await this.cacheService.getLocations();
    this.factions = (await this.cacheService.getFactions()).filter(faction => faction.id !== FactionType.GREY);
  }

  addShop(type: StoreType): void {
    this.notificationService.warning('world.map.add');
    this.mapboxService.addShopByClick(type);
  }

  addQuest(type: LocationType): void {
    this.notificationService.warning('world.map.add');
    this.mapboxService.addQuestByClick(type);
  }

  addKingdom(type: FactionType): void {
    this.notificationService.warning('world.map.add');
    this.mapboxService.addKingdomByClick(type);
  }

  populateMap(): void {
    this.notificationService.warning('world.map.add');
    this.mapboxService.populateMapByClick();
  }

  ngOnDestroy(): void {
    this.mapboxService.terminalize();
  }

}
