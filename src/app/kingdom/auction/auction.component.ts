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
    private translateService: TranslateService,
    private dialog: MatDialog,
    private store: Store,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private angularFirestore: AngularFirestore,
  ) { }

  ngOnInit() {
    this.angularFirestore.collection<any>('auctions').valueChanges().pipe(untilDestroyed(this)).subscribe(async auctions => {
      const data = auctions.map(auction => {
        auction.join = auction.hero || auction.item || auction.spell || auction.unit;
        return auction;
      });
      this.data = new MatTableDataSource(data);
      this.data.paginator = this.paginator;
      this.data.sortingDataAccessor = (obj, property) => property === 'name' ? obj['gold'] : obj[property];
      this.data.sort = this.sort;
      this.data.filterPredicate = this.createFilter();
      this.filters.faction.options = [...new Set(data.map(auction => auction.join.faction))];
      this.applyFilter();
      const firstAuction: any = auctions[0];
      if (firstAuction && firstAuction.auctioned && moment().isAfter(moment(firstAuction.auctioned.toMillis()))) {
        this.loadingService.startLoading();
        try {
          await this.apiService.refreshAuction();
        } catch (error) {
          console.error(error);
        }
        this.loadingService.stopLoading();
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
        && data.join.faction.id.toLowerCase().includes(filters.faction);
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
