import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { ReportComponent } from './report.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import * as moment from 'moment';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class ArchiveComponent implements OnInit {

  uid: string = null;
  kingdoms: any[] = [];
  columns = ['select', 'from', 'subject', 'timestamp'];
  filters: any = {
    from: {
      type: 'text',
      value: '',
    },
    subject: {
      type: 'text',
      value: '',
    },
    timestamp: {
      type: 'timestamp',
      value: null,
    }
  };
  selection: SelectionModel<any> = new SelectionModel<any>(true, []);
  data: MatTableDataSource<any> = new MatTableDataSource([]);

  constructor(
    private firebaseService: FirebaseService,
    private angularFirestore: AngularFirestore,
    public dialog: MatDialog,
    private store: Store,
    private notificationService: NotificationService,
  ) { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit(): void {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.firebaseService.leftJoin(`kingdoms/${this.uid}/letters`, 'kingdoms', 'from', 'id').pipe(untilDestroyed(this)).subscribe(async letters => {
      letters = await Promise.all(letters.map(async letter => {
        return {
          ...letter,
          join: await this.firebaseService.selfJoin(letter.join),
        }
      }));
      this.data = new MatTableDataSource(letters);
      this.data.paginator = this.paginator;
      this.data.sort = this.sort;
      this.data.filterPredicate = this.createFilter();
      this.applyFilter();
    });
    this.angularFirestore.collection('kingdoms').valueChanges().pipe(untilDestroyed(this)).subscribe(kingdoms => {
      this.kingdoms = kingdoms;
    });
  }

  applyFilter(): void {
    this.data.filter = JSON.stringify({
      from: this.filters.from.value,
      subject: this.filters.subject.value,
      timestamp: this.filters.timestamp.value,
    });
  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: string): boolean {
      let filters = JSON.parse(filter);
      return data.join.name.toLowerCase().includes(filters.from)
        && data.subject.toString().toLowerCase().includes(filters.subject)
        && (!filters.timestamp || moment(data.timestamp.toMillis()).isBetween(moment(filters.timestamp).startOf('day'), moment(filters.timestamp).endOf('day'), 'days', '[]'));
    }
    return filterFunction;
  }

  isAllSelected(): boolean {
    return this.data.data.length === this.selection.selected.length;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.data.data.forEach(row => this.selection.select(row));
  }

  async openReportDialog(letter: any) {
    letter.log = await Promise.all(letter.log.sort((a, b) => a.sort - b.sort).map(async (log: any) => {
      return await this.firebaseService.selfJoin(log);
    }));
    const dialogRef = this.dialog.open(ReportComponent, {
      panelClass: 'dialog-responsive',
      data: letter,
    });
  }

  async deleteReports() {
    if (this.selection.selected.length) {
      try {
        const batch = this.angularFirestore.firestore.batch();
        this.selection.selected.forEach(letter => {
          batch.delete(this.angularFirestore.collection(`kingdoms/${this.uid}/letters`).doc(letter.fid).ref);
        });
        await batch.commit();
        this.selection.clear();
        this.notificationService.success('kingdom.letter.deleted');
      } catch (error) {
        this.notificationService.error('kingdom.letter.error');
      }
    }
  }

}
