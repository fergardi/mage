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
import { firestore } from 'firebase/app'

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss'],
})
@UntilDestroy()
export class ArchiveComponent implements OnInit {

  columns = ['select', 'from', 'subject', 'timestamp'];
  selection: SelectionModel<any> = new SelectionModel<any>(true, []);
  data: MatTableDataSource<any> = new MatTableDataSource([]);

  constructor(
    private firebaseService: FirebaseService,
    private angularFirestore: AngularFirestore,
    public dialog: MatDialog,
  ) { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit() {
    this.firebaseService.leftJoin(`kingdoms/wS6oK6Epj3XvavWFtngLZkgFx263/letters`, 'kingdoms', 'from', 'id').pipe(untilDestroyed(this)).subscribe(letters => {
      this.data = new MatTableDataSource(letters);
      this.data.paginator = this.paginator;
      this.data.sort = this.sort;
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.data.filter = filterValue.trim().toLowerCase();
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
      width: '80%',
      data: letter
    });
  }

  deleteLetters() {
    if (this.selection.selected.length) {
      // TODO
    }
  }

  newLetter() {
    const letter = this.dialog.open(LetterComponent, {
      width: '50%',
      data: {
        fid: null,
        from: 'wS6oK6Epj3XvavWFtngLZkgFx263',
        to: null,
        subject: '',
        message: '',
      }
    });
    letter.afterClosed().pipe(untilDestroyed(this)).subscribe(data => {
      this.angularFirestore.collection(`kingdoms/${data.to}/letters`).add({ ...data, timestamp: firestore.FieldValue.serverTimestamp() });
    });
  }

}
