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

@Component({
  selector: 'app-auction',
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class AuctionComponent implements OnInit {

  columns = ['name', 'timestamp'];
  filters: any = {
    name: {
      type: 'text',
      value: '',
    },
    timestamp: {
      type: 'timestamp',
      value: null,
    }
  };
  data: MatTableDataSource<any> = null;

  constructor(
    private firebaseService: FirebaseService,
    private translateService: TranslateService,
    private dialog: MatDialog,
  ) { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit() {
    this.firebaseService.leftJoin('auctions', 'items', 'item', 'id').pipe(untilDestroyed(this)).subscribe(auctions => {
      this.data = new MatTableDataSource(auctions);
      this.data.paginator = this.paginator;
      this.data.sort = this.sort;
      this.data.filterPredicate = this.createFilter();
      this.applyFilter();
    })
  }

  applyFilter() {
    this.data.filter = JSON.stringify({
      name: this.filters.name.value,
      timestamp: this.filters.timestamp.value,
    });
  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = (data: any, filter: string): boolean => {
      let filters = JSON.parse(filter);
      return this.translateService.instant(data.join.name).toLowerCase().includes(filters.name)
      && (!filters.timestamp || moment(data.timestamp.toMillis()).isBetween(moment(filters.timestamp).startOf('day'), moment(filters.timestamp).endOf('day'), 'days', '[]'));
    }
    return filterFunction;
  }

  openBidDialog(auction: any): void {
    const dialogRef = this.dialog.open(BidComponent, {
      minWidth: '20%',
      maxWidth: '80%',
      data: auction,
    });
  }

}
