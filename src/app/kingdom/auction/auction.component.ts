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
  data: MatTableDataSource<any> = new MatTableDataSource([]);
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
    public tutorialService: TutorialService,
  ) { }

  ngOnInit(): void {
    this.angularFirestore.collection<any>('auctions').valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(async auctions => {
      const data = auctions.map(auction => {
        auction.join = auction.hero || auction.item || auction.spell || auction.unit;
        return auction;
      });
      this.data = new MatTableDataSource(data);
      this.data.paginator = this.paginator;
      this.data.sort = this.sort;
      this.data.sortingDataAccessor = this.createSorter();
      this.data.filterPredicate = this.createFilter();
      this.filters.faction.options = [...new Set(data.map(auction => auction.join.faction))];
      this.applyFilter();
      await this.refreshAuctions();
      this.tutorialService.ready();
    });
  }

  applyFilter() {
    this.data.filter = JSON.stringify({
      name: this.filters.name.value,
      faction: this.filters.faction.value,
    });
  }

  createSorter(): (obj: any, property: string) => any {
    const sorterFunction = (obj: any, property: string): any => {
      if (property === 'name') return this.translateService.instant(obj['join']['name']);
      if (property === 'faction') return this.translateService.instant(obj['join']['faction']['name']);
      return obj[property];
    };
    return sorterFunction;
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

  async refreshAuctions() {
    if (!this.data.data.length || (this.data.data.length && moment().isAfter(moment(this.data.data[0].auctioned.toMillis())))) {
      this.loadingService.startLoading();
      try {
        await this.apiService.refreshAuction();
      } catch (error) {
        console.error(error);
      }
      this.loadingService.stopLoading();
    }
  }

  openBidDialog(auction: any, $event: Event): void {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(BidComponent, {
      panelClass: 'dialog-responsive',
      data: auction,
    });
  }

  openTomeDialog(tome: any): void {
    const dialogRef = this.dialog.open(TomeComponent, {
      panelClass: 'dialog-responsive',
      data: tome,
    });
  }

}
