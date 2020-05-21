import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
@UntilDestroy()
export class NotificationService {

  private options: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  }

  constructor(
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
  ) {}

  success(text: string, variable?: any) {
    this.snackBar.open(this.translateService.instant(text, variable), '✓', {...this.options, panelClass: ['mat-toolbar', 'mat-accent']} );
  }

  warning(text: string) {
    this.snackBar.open(this.translateService.instant(text), '‼', {...this.options, panelClass: ['mat-toolbar', 'mat-primary']} );
  }

  error(text: string) {
    this.snackBar.open(this.translateService.instant(text), '✗', {...this.options, panelClass: ['mat-toolbar', 'mat-warn']} );
  }

}
