import { Component, OnInit, ViewChild } from '@angular/core';
import { fadeInOnEnterAnimation, fadeOutOnLeaveAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { CacheService } from 'src/app/services/cache.service';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AngularFirestore } from '@angular/fire/compat/firestore';
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
import { Clan, Filter, Guild, Kingdom } from 'src/app/shared/type/interface.model';

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

  kingdomGuilds: Array<Guild> = [];
  kingdomGuild: Guild = null;
  kingdomClan$: Observable<Clan> = this.store.select(AuthState.getKingdomClan);
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomGuilded: number = null;
  columns = [
    'name',
    'actions',
  ];
  filters: Filter = {
    name: {
      type: 'text',
      value: '',
    },
  };
  table: MatTableDataSource<Clan> = new MatTableDataSource();
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
    private tutorialService: TutorialService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.kingdomGuilds = await this.cacheService.getGuilds();
    combineLatest([
      this.angularFirestore.collection<Clan>('clans').valueChanges({ idField: 'fid' }),
      this.store.select(AuthState.getKingdomGuild).pipe(map(((data: string) => JSON.parse(data) as { guild: Guild, guilded: number }))),
    ])
    .pipe(untilDestroyed(this))
    .subscribe(([clans, kingdomGuild]) => {
      this.table = new MatTableDataSource(clans);
      this.table.paginator = this.paginator;
      this.table.sortingDataAccessor = (obj, property) => property === 'name' ? obj['power'] : obj[property];
      this.table.sort = this.sort;
      this.table.filterPredicate = this.createFilter();
      this.applyFilter();
      if (kingdomGuild) {
        this.kingdomGuild = this.kingdomGuilds.find(guild => guild.id === kingdomGuild.guild.id);
        this.kingdomGuilded = kingdomGuild.guilded;
      }
    });
  }

  applyFilter(): void {
    this.table.filter = JSON.stringify({
      name: this.filters.name.value,
    });
  }

  createFilter(): (data: Clan, filter: string) => boolean {
    const filterFunction = (data: Clan, filter: string): boolean => {
      const filters = JSON.parse(filter);
      return data.name.toLowerCase().includes(filters.name);
    };
    return filterFunction;
  }

  clearFilter(): void {
    this.filters.name.value = '';
    if (this.table.paginator) {
      this.table.paginator.pageSize = this.table.paginator.pageSizeOptions[0];
      this.table.paginator.pageIndex = 0;
    }
    if (this.table.sort) {
      if (this.table.sort.active !== 'name' && this.table.sort.direction !== 'desc') {
        this.table.sort.sort({
          id: 'name',
          start: 'desc',
          disableClear: false,
        });
      }
    }
    this.applyFilter();
  }

  async joinClan(clan: Clan, $event: Event): Promise<void> {
    try {
      $event.stopPropagation();
      this.loadingService.startLoading();
      await this.apiService.joinClan(this.uid, clan.fid);
      this.notificationService.success('kingdom.clan.success');
    } catch (error) {
      this.notificationService.error('kingdom.clan.error', error as Error);
    } finally {
      this.loadingService.stopLoading();
    }
  }

  async leaveClan(clan: Clan, $event: Event): Promise<void> {
    try {
      $event.stopPropagation();
      this.loadingService.startLoading();
      await this.apiService.leaveClan(this.uid, clan.fid);
      this.notificationService.success('kingdom.clan.success');
    } catch (error) {
      this.notificationService.error('kingdom.clan.error', error as Error);
    } finally {
      this.loadingService.stopLoading();
    }
  }

  openManifestDialog(clan: Clan): void {
    const dialogRef = this.dialog.open(ManifestComponent, {
      panelClass: 'dialog-responsive',
      data: {
        ...clan,
        members: [],
      },
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

  async favorGuild(): Promise<void> {
    if (this.kingdomGuild && this.canBeFavored()) {
      try {
        this.loadingService.startLoading();
        await this.apiService.favorGuild(this.uid, this.kingdomGuild.id);
        this.notificationService.success('kingdom.guild.success');
      } catch (error) {
        this.notificationService.error('kingdom.guild.error', error as Error);
      } finally {
        this.loadingService.stopLoading();
      }
    } else {
      this.notificationService.error('kingdom.guild.error');
    }
  }

  startTour(step: string): void {
    this.tutorialService.start(step);
  }

}
