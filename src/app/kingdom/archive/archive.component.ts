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
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DateAdapter } from '@angular/material/core';
import { TutorialService } from 'src/app/services/tutorial.service';
import { Filter, Letter } from 'src/app/shared/type/interface.model';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class ArchiveComponent implements OnInit {

  uid = this.store.selectSnapshot(AuthState.getUserUID);
  columns = [
    'select',
    'from',
    'subject',
    'timestamp',
  ];
  filters: Filter = {
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
  selection: SelectionModel<Letter> = new SelectionModel<Letter>(true, []);
  table: MatTableDataSource<Letter> = new MatTableDataSource([]);
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private angularFirestore: AngularFirestore,
    private dialog: MatDialog,
    private store: Store,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private dateAdapter: DateAdapter<Letter>,
    public tutorialService: TutorialService,
  ) { }

  ngOnInit(): void {
    this.dateAdapter.setLocale(this.translateService.currentLang);
    this.angularFirestore.collection<Letter>(`kingdoms/${this.uid}/letters`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(letters => {
      this.table = new MatTableDataSource(letters);
      this.table.paginator = this.paginator;
      this.table.sort = this.sort;
      this.table.filterPredicate = this.createFilter();
      this.applyFilter();
    });
  }

  applyFilter(): void {
    this.table.filter = JSON.stringify({
      from: this.filters.from.value,
      subject: this.filters.subject.value,
      timestamp: this.filters.timestamp.value,
    });
  }

  createFilter(): (data: Letter, filter: string) => boolean {
    const filterFunction = (data: Letter, filter: string): boolean => {
      const filters = JSON.parse(filter);
      return data && data.from && data.from.name && data.subject
        && this.translateService.instant(data.from.name).toLowerCase().includes(filters.from)
        && this.translateService.instant(data.subject).toString().toLowerCase().includes(filters.subject)
        && (!filters.timestamp || moment(data.timestamp.toMillis()).isBetween(moment(filters.timestamp).startOf('day'), moment(filters.timestamp).endOf('day'), 'days', '[]'));
    };
    return filterFunction;
  }

  clearFilter(): void {
    this.filters.name.value = '';
    if (this.table.paginator) {
      this.table.paginator.pageSize = this.table.paginator.pageSizeOptions[0];
      this.table.paginator.pageIndex = 0;
    }
    if (this.table.sort) {
      if (this.table.sort.active !== 'timestamp' && this.table.sort.direction !== 'desc') {
        this.table.sort.sort({
          id: 'timestamp',
          start: 'desc',
          disableClear: false,
        });
      }
    }
    this.applyFilter();
  }

  isAllSelected(): boolean {
    return this.table.data.length === this.selection.selected.length;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.table.data.forEach(row => this.selection.select(row));
  }

  async openReportDialog(report: Letter): Promise<void> {
    if (report.data) report.data.join = report.data.hero || report.data.item || report.data.spell || report.data.unit;
    const dialogRef = this.dialog.open(ReportComponent, {
      panelClass: 'dialog-responsive',
      data: report,
    });
  }

  async deleteReports(): Promise<void> {
    if (this.selection.selected.length) {
      try {
        this.loadingService.startLoading();
        const fids = this.selection.selected.map(letter => letter.fid);
        await this.apiService.removeLetters(this.uid, fids);
        this.selection.clear();
        this.notificationService.success('kingdom.archive.success');
      } catch (error) {
        this.notificationService.error('kingdom.archive.error', error as Error);
      } finally {
        this.loadingService.stopLoading();
      }
    } else {
      this.notificationService.error('kingdom.archive.error');
    }
  }

}
