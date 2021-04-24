import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { ReportComponent } from './report.component';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { NotificationService } from 'src/app/services/notification.service';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { DateAdapter } from '@angular/material/core';
import { TutorialService } from 'src/app/services/tutorial.service';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class ArchiveComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
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
    },
  };
  selection: SelectionModel<any> = new SelectionModel<any>(true, []);
  data: MatTableDataSource<any> = new MatTableDataSource([]);

  constructor(
    private angularFirestore: AngularFirestore,
    private dialog: MatDialog,
    private store: Store,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private dateAdapter: DateAdapter<any>,
    public tutorialService: TutorialService,
  ) { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit(): void {
    this.dateAdapter.setLocale(this.translateService.currentLang);
    this.angularFirestore.collection<any>(`kingdoms/${this.uid}/letters`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(letters => {
      this.data = new MatTableDataSource(letters);
      this.data.paginator = this.paginator;
      this.data.sort = this.sort;
      this.data.filterPredicate = this.createFilter();
      this.applyFilter();
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
    const filterFunction = (data: any, filter: string): boolean => {
      const filters = JSON.parse(filter);
      return data && data.from && data.from.name && data.subject
        && this.translateService.instant(data.from.name).toLowerCase().includes(filters.from)
        && this.translateService.instant(data.subject).toString().toLowerCase().includes(filters.subject)
        && (!filters.timestamp || moment(data.timestamp.toMillis()).isBetween(moment(filters.timestamp).startOf('day'), moment(filters.timestamp).endOf('day'), 'days', '[]'));
    };
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

  async openReportDialog(report: any) {
    if (report.data) report.data.join = report.data.hero || report.data.item || report.data.spell || report.data.unit;
    const dialogRef = this.dialog.open(ReportComponent, {
      panelClass: 'dialog-responsive',
      data: report,
    });
  }

  async deleteReports() {
    if (this.selection.selected.length) {
      this.loadingService.startLoading();
      try {
        const fids = this.selection.selected.map(letter => letter.fid);
        await this.apiService.removeLetters(this.uid, fids);
        this.selection.clear();
        this.notificationService.success('kingdom.archive.success');
      } catch (error) {
        console.error(error);
        this.notificationService.success('kingdom.archive.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.success('kingdom.archive.error');
    }
  }

}
