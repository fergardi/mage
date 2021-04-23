import { Component, OnInit, ViewChild } from '@angular/core';
import { fadeInOnEnterAnimation, fadeOutOnLeaveAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { CacheService } from 'src/app/services/cache.service';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AngularFirestore } from '@angular/fire/firestore';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';
import * as moment from 'moment';
import { NotificationService } from 'src/app/services/notification.service';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { FoundationComponent } from './foundation.component';
import { Observable, combineLatest } from 'rxjs';
import { ManifestComponent } from './manifest.component';
import { TutorialService } from 'src/app/services/tutorial.service';

@Component({
  selector: 'app-clan',
  templateUrl: './clan.component.html',
  styleUrls: ['./clan.component.scss'],
  animations: [
    fadeInOnEnterAnimation({ duration: 250, delay: 250 }),
    fadeOutOnLeaveAnimation({ duration: 250, delay: 250 }),
  ],
})
@UntilDestroy()
export class ClanComponent implements OnInit {

  kingdomGuilds: any[] = [];
  kingdomGuild: any = null;
  kingdomClan$: Observable<any> = this.store.select(AuthState.getKingdomClan);
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomGuilded: any = null;
  columns = ['name', 'actions'];
  filters: any = {
    name: {
      type: 'text',
      value: '',
    },
  };
  data: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private store: Store,
    private cacheService: CacheService,
    private angularFirestore: AngularFirestore,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    public tutorialService: TutorialService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.kingdomGuilds = await this.cacheService.getGuilds();
    combineLatest([
      this.angularFirestore.collection<any>('clans').valueChanges({ idField: 'fid' }),
      this.store.select(AuthState.getKingdomGuild).pipe(map(data => JSON.parse(data))),
    ])
    .pipe(untilDestroyed(this))
    .subscribe(([clans, kingdomGuild]) => {
      this.data = new MatTableDataSource(clans);
      this.data.paginator = this.paginator;
      this.data.sortingDataAccessor = (obj, property) => property === 'name' ? obj['power'] : obj[property];
      this.data.sort = this.sort;
      this.data.filterPredicate = this.createFilter();
      this.applyFilter();
      if (kingdomGuild) {
        this.kingdomGuild = this.kingdomGuilds.find(guild => guild.id === kingdomGuild.guild.id);
        this.kingdomGuilded = kingdomGuild.guilded;
      }
      this.tutorialService.ready();
    });
  }

  applyFilter() {
    this.data.filter = JSON.stringify({
      name: this.filters.name.value,
    });
  }

  createFilter(): (data: any, filter: string) => boolean {
    const filterFunction = (data: any, filter: string): boolean => {
      const filters = JSON.parse(filter);
      return data.name.toLowerCase().includes(filters.name);
    };
    return filterFunction;
  }

  async joinClan(clan: any, $event: Event) {
    $event.stopPropagation();
    this.loadingService.startLoading();
    try {
      const joined = await this.apiService.joinClan(this.uid, clan.fid);
      this.notificationService.success('kingdom.clan.success');
    } catch (error) {
      console.error(error);
      this.notificationService.error('kingdom.clan.error');
    }
    this.loadingService.stopLoading();
  }

  async leaveClan(clan: any, $event: Event) {
    $event.stopPropagation();
    this.loadingService.startLoading();
    try {
      const joined = await this.apiService.leaveClan(this.uid, clan.fid);
      this.notificationService.success('kingdom.clan.success');
    } catch (error) {
      console.error(error);
      this.notificationService.error('kingdom.clan.error');
    }
    this.loadingService.stopLoading();
  }

  openManifestDialog(clan: any): void {
    const dialogRef = this.dialog.open(ManifestComponent, {
      panelClass: 'dialog-responsive',
      data: { ...clan, members: [] },
    });
  }

  openFoundationDialog(): void {
    const dialogRef = this.dialog.open(FoundationComponent, {
      panelClass: 'dialog-responsive',
      data: null,
    });
  }

  canBeFavored(): boolean {
    return this.kingdomGuilded
      ? moment(this.store.selectSnapshot(AuthState.getClock)).isAfter(moment(this.kingdomGuilded))
      : false;
  }

  async favor() {
    if (this.kingdomGuild) {
      this.loadingService.startLoading();
      try {
        const favored = await this.apiService.favorGuild(this.uid, this.kingdomGuild.id);
        this.notificationService.success('kingdom.guild.success');
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.guild.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.guild.error');
    }
  }

}
