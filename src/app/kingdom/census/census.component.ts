import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseService } from 'src/app/services/firebase.service';
import { fadeInOnEnterAnimation, fadeOutOnLeaveAnimation } from 'angular-animations';
import { BattleComponent } from './battle.component';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import * as moment from 'moment';
import { NotificationService } from 'src/app/services/notification.service';
import { LetterComponent } from './letter.component';
import { ActivateComponent } from '../sorcery/activate.component';
import { ConjureComponent } from '../sorcery/conjure.component';

@Component({
  selector: 'app-census',
  templateUrl: './census.component.html',
  styleUrls: ['./census.component.scss'],
  animations: [
    fadeInOnEnterAnimation({ duration: 250, delay: 250 }),
    fadeOutOnLeaveAnimation({ duration: 250, delay: 250 }),
  ],
})
@UntilDestroy()
export class CensusComponent implements OnInit, OnDestroy {

  uid: string = null;
  protection: number = 8;
  clock: Date = new Date();
  interval: any = null;
  columns = ['name', 'power', 'actions'];
  filters: any = {
    name: {
      type: 'text',
      value: '',
    },
  };
  data: MatTableDataSource<any> = null;

  constructor(
    private angularFirestore: AngularFirestore,
    private firebaseService: FirebaseService,
    private notificationService: NotificationService,
    public dialog: MatDialog,
    private store: Store,
  ) {
    this.interval = setInterval(() => this.clock = new Date(), 1000);
  }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.firebaseService.leftJoin('kingdoms', 'factions', 'faction', 'id', ref => ref.orderBy('power', 'desc')).pipe(untilDestroyed(this)).subscribe(kingdoms => {
      this.data = new MatTableDataSource(kingdoms.sort((a, b) => b.radius - a.radius).map((kingdom, index) => { return { ...kingdom, position: index + 1 } }));
      this.data.paginator = this.paginator;
      this.data.sort = this.sort;
      this.data.filterPredicate = this.createFilter();
      this.applyFilter();
    })
  }

  applyFilter() {
    this.data.filter = JSON.stringify({
      name: this.filters.name.value,
    });
  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: string): boolean {
      let filters = JSON.parse(filter);
      return data.name.toLowerCase().includes(filters.name);
    }
    return filterFunction;
  }

  openAttackDialog(kingdom: any): void {
    const dialogRef = this.dialog.open(BattleComponent, {
      panelClass: 'dialog-responsive',
      data: kingdom,
    });
    dialogRef.afterClosed().subscribe(async data => {
      if (data) {
        await this.angularFirestore.doc<any>(`kingdoms/${kingdom.fid}`).update({ lastAttacked: firestore.FieldValue.serverTimestamp() });
        this.notificationService.success('kingdom.census.report');
      }
    })
  }

  openLetterDialog(kingdom: any): void {
    const dialogRef = this.dialog.open(LetterComponent, {
      panelClass: 'dialog-responsive',
      data: kingdom,
    });
    dialogRef.afterClosed().subscribe(async form => {
      if (form) {
        await this.angularFirestore.collection(`kingdoms/${kingdom.fid}/letters`).add({
          from: this.uid,
          to: kingdom.fid,
          subject: form.subject,
          message: form.message,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
        this.notificationService.success('kingdom.letter.sent');
      }
    })
  }

  openActivateDialog(kingdom: any): void {
    const dialogRef = this.dialog.open(ActivateComponent, {
      panelClass: 'dialog-responsive',
      data: null,
    });
    dialogRef.afterClosed().subscribe(artifact => {
      if (artifact) {
        // TODO
      }
    })
  }

  openConjureDialog(kingdom: any): void {
    const dialogRef = this.dialog.open(ConjureComponent, {
      panelClass: 'dialog-responsive',
      data: null,
    });
    dialogRef.afterClosed().subscribe(async data => {
      if (data) {
        // TODO
      }
    })
  }

  canBeAttacked(kingdom: any): boolean {
    return kingdom.lastAttacked
      ? moment(this.clock).subtract(30, 'seconds').isAfter(moment(kingdom.lastAttacked.toMillis()))
      : true;
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

}
