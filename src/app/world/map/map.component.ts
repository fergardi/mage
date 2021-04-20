import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapboxService } from 'src/app/services/mapbox.service';
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
import { GeoFireClient } from 'geofirex';
import { LoadingService } from 'src/app/services/loading.service';

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
    private loadingService: LoadingService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.mapboxService.initialize(this.container);
    this.mapboxService.map.on('load', async () => {
      // resize map in case drawer has changed
      this.mapboxService.resizeMap();
      // print kingdoms surrounding kingdom
      try {
        this.loadingService.startLoading();
        this.notificationService.warning('world.map.update');
        const kingdoms = (await this.angularFirestore.collection<any>('kingdoms').get().toPromise()).docs.map(k => k.data());
        this.mapboxService.clearMarkers(MarkerType.KINGDOM);
        kingdoms.forEach((kingdom: any) => {
          this.mapboxService.addMarker(kingdom, MarkerType.KINGDOM, kingdom.id === this.uid,
            this.activatedRoute.snapshot.params.kingdom
              ? this.activatedRoute.snapshot.params.kingdom === kingdom.id
              : kingdom.id === this.uid,
            );
        });
        this.mapboxService.refreshMarkers();
        await new Promise(resolve => setTimeout(resolve, 500));
        this.loadingService.stopLoading();
      } catch (error) {
        console.error(error);
      }
      // print quests surrounding kingdom
      this.kingdom$.pipe(
        switchMap(kingdom => {
          if (kingdom) {
            const quests = this.angularFirestore.collection<any>('quests');
            return this.geofirex.query(quests.ref).within(kingdom.position, Math.max(1000, kingdom.power) / 1000, 'position');
          } else {
            return of([]);
          }
        }),
      ).pipe(untilDestroyed(this)).subscribe(async (quests: Array<any>) => {
        this.loadingService.startLoading();
        // this.notificationService.warning('world.map.refresh');
        this.mapboxService.clearMarkers(MarkerType.QUEST);
        quests.forEach((quest: any) => this.mapboxService.addMarker(quest, MarkerType.QUEST, false, false));
        this.mapboxService.refreshMarkers();
        await new Promise(resolve => setTimeout(resolve, 500));
        this.loadingService.stopLoading();
      });
      // print shops surrounding kingdom
      this.kingdom$.pipe(
        switchMap(kingdom => {
          if (kingdom) {
            const shops = this.angularFirestore.collection<any>('shops');
            return this.geofirex.query(shops.ref).within(kingdom.position, Math.max(1000, kingdom.power) / 1000, 'position');
          } else {
            return of([]);
          }
        }),
      ).pipe(untilDestroyed(this)).subscribe(async (shops: Array<any>) => {
        this.loadingService.startLoading();
        // this.notificationService.warning('world.map.refresh');
        this.mapboxService.clearMarkers(MarkerType.SHOP);
        shops.forEach((shop: any) => this.mapboxService.addMarker(shop, MarkerType.SHOP, false, false));
        this.mapboxService.refreshMarkers();
        await new Promise(resolve => setTimeout(resolve, 500));
        this.loadingService.stopLoading();
      });
    });
    // menus
    this.stores = await this.cacheService.getStores();
    this.locations = await this.cacheService.getLocations();
    this.factions = (await this.cacheService.getFactions()).filter((faction: any) => faction.id !== 'grey');
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

  addMe() {
    this.notificationService.warning('world.map.add');
    this.mapboxService.addMe();
  }

  async populateMap() {
    this.notificationService.warning('world.map.update');
    await this.mapboxService.populateMap();
  }

  ngOnDestroy(): void {
    this.mapboxService.clearMarkers();
  }

}
