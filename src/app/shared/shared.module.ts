// angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutModule } from '@angular/cdk/layout';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
// material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
// plugins
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { NgxCurrencyModule, CurrencyMaskInputMode } from 'ngx-currency';
// components
import { ShellComponent } from './shell/shell.component';
// pipes
import { ShortPipe } from '../pipes/short.pipe';
import { IconPipe } from '../pipes/icon.pipe';
import { LongPipe } from '../pipes/long.pipe';
import { LegendaryPipe } from '../pipes/legendary.pipe';
import { TurnPipe } from '../pipes/turn.pipe';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { StatusComponent } from './shell/status.component';
import { TourComponent } from './tour/tour.component';

// AOT compilation support
export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

const components = [
  ShellComponent,
  ShortPipe,
  IconPipe,
  LongPipe,
  LegendaryPipe,
  TurnPipe,
  TourComponent,
];
const modules = [
  CommonModule,
  RouterModule,
  MatToolbarModule,
  MatIconModule,
  LayoutModule,
  MatButtonModule,
  MatSidenavModule,
  MatListModule,
  MatMenuModule,
  MatIconModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSnackBarModule,
  FlexLayoutModule,
  MatChipsModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  HttpClientModule,
  MatSelectModule,
  MatTabsModule,
  MatBadgeModule,
  DragDropModule,
  MatProgressBarModule,
  MatDialogModule,
  FormsModule,
  MatCheckboxModule,
  MatFormFieldModule,
  ReactiveFormsModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatBottomSheetModule,
  MatExpansionModule,
  MatTooltipModule,
];

@NgModule({
  declarations: [
    ...components,
    StatusComponent,
  ],
  imports: [
    ...modules,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient],
      },
      isolate: false,
    }),
    TourMatMenuModule,
    NgxCurrencyModule.forRoot({
      align: 'right',
      allowNegative: false,
      allowZero: true,
      decimal: ',',
      precision: 0,
      prefix: '',
      suffix: '',
      thousands: '.',
      nullable: true,
      min: null,
      max: null,
      inputMode: CurrencyMaskInputMode.FINANCIAL,
    }),
    ScrollingModule,
  ],
  exports: [
    ...components,
    ...modules,
    TranslateModule,
  ],
})
export class SharedModule { }
