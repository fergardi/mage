import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fadeInOnEnterAnimation } from 'angular-animations';
import * as moment from 'moment';
import { BidComponent } from './bid.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { TomeComponent } from 'src/app/user/encyclopedia/tome.component';
import { TutorialService } from 'src/app/services/tutorial.service';
import { NotificationService } from 'src/app/services/notification.service';
import { CacheService } from 'src/app/services/cache.service';
import { Auction, Filter, Tome } from 'src/app/shared/type/interface.model';

@Component({
  selector: 'app-auction',
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class AuctionComponent implements OnInit {

  columns = [
    'name',
    'faction',
    'actions',
  ];
  filters: Filter = {
    name: {
      type: 'text',
      value: '',
    },
    faction: {
      type: 'select',
      value: '',
      options: [],
    },
  };
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  table: MatTableDataSource<Auction> = new MatTableDataSource([]);

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private translateService: TranslateService,
    private dialog: MatDialog,
    private store: Store,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private angularFirestore: AngularFirestore,
    private notificationService: NotificationService,
    public tutorialService: TutorialService,
    private cacheService: CacheService,
  ) { }

  ngOnInit(): void {
    this.angularFirestore.collection<Auction>('auctions').valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(async auctions => {
      const data = auctions.map((auction: Auction) => {
        auction.join = auction.hero || auction.item || auction.spell || auction.unit;
        return auction;
      });
      this.table = new MatTableDataSource(data);
      this.table.paginator = this.paginator;
      this.table.sort = this.sort;
      this.table.sortingDataAccessor = this.createSorter();
      this.table.filterPredicate = this.createFilter();
      // this.filters.faction.options = [...new Set(data.map((auction: Auction) => auction.join.faction))];
      this.filters.faction.options = this.filters.faction.options.concat(
        [{ id: '', name: 'table.filter.anything', image: '/assets/images/factions/grey.png' }],
        await this.cacheService.getFactions(),
      );
      this.filters.faction.value = this.filters.faction.options[0];
      this.applyFilter();
      await this.refreshAuctions();
    });
  }

  applyFilter() {
    this.table.filter = JSON.stringify({
      name: this.filters.name.value,
      faction: this.filters.faction.value,
    });
  }

  createSorter(): (obj: Auction, property: string) => string {
    const sorterFunction = (obj: Auction, property: string): string => {
      if (property === 'name') return this.translateService.instant(obj['join']['name']);
      if (property === 'faction') return this.translateService.instant(obj['join']['faction']['name']);
      return obj[property];
    };
    return sorterFunction;
  }

  createFilter(): (data: Auction, filter: string) => boolean {
    const filterFunction = (data: Auction, filter: string): boolean => {
      const filters = JSON.parse(filter);
      return (this.translateService.instant(data.join.name).toLowerCase().includes(filters.name)
        || this.translateService.instant(data.join.description).toLowerCase().includes(filters.name))
        && (!filters.faction || data.join.faction.id.toLowerCase().includes(filters.faction.id));
    };
    return filterFunction;
  }

  clearFilter(): void {
    this.filters.name.value = '';
    this.filters.faction.value = this.filters.faction.options[0];
    if (this.table.paginator) {
      this.table.paginator.pageSize = this.table.paginator.pageSizeOptions[0];
      this.table.paginator.pageIndex = 0;
    }
    if (this.table.sort) {
      if (this.table.sort.active !== 'name' && this.table.sort.direction !== 'asc') {
        this.table.sort.sort({
          id: 'name',
          start: 'asc',
          disableClear: false,
        });
      }
    }
    this.applyFilter();
  }

  async refreshAuctions(): Promise<void> {
    if (!this.table.data.length || (this.table.data.length && moment().isAfter(moment(this.table.data[0].auctioned.toMillis())))) {
      try {
        this.loadingService.startLoading();
        await this.apiService.refreshAuction();
      } catch (error) {
        this.notificationService.error('kingdom.auction.error', error as Error);
      } finally {
        this.loadingService.stopLoading();
      }
    }
  }

  openBidDialog(auction: Auction, $event: Event): void {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(BidComponent, {
      panelClass: 'dialog-responsive',
      data: auction,
    });
  }

  openTomeDialog(tome: Tome): void {
    const dialogRef = this.dialog.open(TomeComponent, {
      panelClass: 'dialog-responsive',
      data: tome,
    });
  }

}
