import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseService } from 'src/app/services/firebase.service';
import { fadeInOnEnterAnimation } from 'angular-animations';
import * as moment from 'moment';
import { BidComponent } from './bid.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Store } from '@ngxs/store';
import { combineLatest } from 'rxjs';
import { CacheService } from 'src/app/services/cache.service';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-auction',
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class AuctionComponent implements OnInit {

  columns: string[] = [
    'name',
    'faction',
    'actions',
  ];
  filters: any = {
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
  data: MatTableDataSource<any> = null;
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private firebaseService: FirebaseService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private store: Store,
    private cacheService: CacheService,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) { }

  async ngOnInit() {
    const factions = await this.cacheService.getFactions();
    combineLatest([
      this.firebaseService.leftJoin('auctions', 'items', 'item', 'id', x => x.where('type', '==', 'artifact')),
      this.firebaseService.leftJoin('auctions', 'heroes', 'hero', 'id', x => x.where('type', '==', 'contract')),
      this.firebaseService.leftJoin('auctions', 'units', 'unit', 'id', x => x.where('type', '==', 'troop')),
      this.firebaseService.leftJoin('auctions', 'spells', 'spell', 'id', x => x.where('type', '==', 'charm')),
    ])
    .pipe(untilDestroyed(this))
    .subscribe(async ([artifacts, contracts, troops, charms]) => {
      let data = [artifacts,  contracts, troops, charms];
      data = data.reduce((a, b) => a.concat(b), []);
      this.data = new MatTableDataSource(data);
      this.data.paginator = this.paginator;
      this.data.paginator._changePageSize(20);
      this.data.sortingDataAccessor = (obj, property) => property === 'name' ? obj['gold'] : obj[property];
      this.data.sort = this.sort;
      this.filters.faction.options = factions.map(faction => ({ name: 'faction.' + faction.id + '.name', value: faction.id }));
      this.data.filterPredicate = this.createFilter();
      this.applyFilter();
      const firstAuction: any = data[0];
      if (firstAuction.auctioned && moment().isAfter(moment(firstAuction.auctioned.toMillis()))) {
        this.loadingService.setLoading(true);
        await this.apiService.refreshAuction();
        this.loadingService.setLoading(false);
      }
    });
  }

  applyFilter() {
    this.data.filter = JSON.stringify({
      name: this.filters.name.value,
      faction: this.filters.faction.value,
    });
  }

  createFilter(): (data: any, filter: string) => boolean {
    const filterFunction = (data: any, filter: string): boolean => {
      const filters = JSON.parse(filter);
      return (this.translateService.instant(data.join.name).toLowerCase().includes(filters.name)
        || this.translateService.instant(data.join.description).toLowerCase().includes(filters.name))
        && data.join.join.id.toLowerCase().includes(filters.faction);
    };
    return filterFunction;
  }

  openBidDialog(auction: any): void {
    const dialogRef = this.dialog.open(BidComponent, {
      panelClass: 'dialog-responsive',
      data: auction,
    });
  }

}
