import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { LetterComponent } from './letter.component';
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
  form: FormGroup = null;
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
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.firebaseService.leftJoin(`kingdoms/${this.uid}/letters`, 'kingdoms', 'from', 'id').pipe(untilDestroyed(this)).subscribe(letters => {
      this.data = new MatTableDataSource(letters);
      this.data.paginator = this.paginator;
      this.data.sort = this.sort;
      this.data.filterPredicate = this.createFilter();
      this.applyFilter();
    });
    this.angularFirestore.collection('kingdoms').valueChanges().pipe(untilDestroyed(this)).subscribe(kingdoms => {
      this.kingdoms = kingdoms;
    });
    this.form = this.formBuilder.group({
      from: [this.uid, [Validators.required]],
      to: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]],
    });
  }

  applyFilter() {
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

  isAllSelected() {
    return this.data.data.length === this.selection.selected.length;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.data.data.forEach(row => this.selection.select(row));
  }

  openLetterDialog(letter: any): void {
    const dialogRef = this.dialog.open(LetterComponent, {
      minWidth: '30%',
      maxWidth: '30%',
      data: letter,
    });
  }

  async deleteLetters() {
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

  async sendLetter() {
    if (this.form.valid) {
      try {
        await this.angularFirestore.collection(`kingdoms/${this.form.value.to}/letters`).add({
          from: this.form.value.from,
          to: this.form.value.to,
          subject: this.form.value.subject,
          message: this.form.value.message,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
        this.form.reset();
        this.notificationService.success('kingdom.letter.sent');
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.letter.error');
      }
    } else {
      console.error(this.form.errors);
      this.notificationService.error('kingdom.letter.error');
    }
  }

}
