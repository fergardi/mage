import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { LongPipe } from '../pipes/long.pipe';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private options: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  }

  constructor(
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
  ) {}

  success(text: string, variable?: any) {
    if (variable) {
      Object.keys(variable).forEach((key, index) => {
        if (typeof variable[key] === 'number') variable[key] = new LongPipe().transform(variable[key]);
      });
    }
    this.snackBar.open(this.translateService.instant(text, variable), '✔️', {...this.options, panelClass: ['mat-toolbar', 'mat-accent']} );
  }

  warning(text: string) {
    this.snackBar.open(this.translateService.instant(text), '❕', {...this.options, panelClass: ['mat-toolbar', 'mat-primary']} );
  }

  error(text: string) {
    this.snackBar.open(this.translateService.instant(text), '❌', {...this.options, panelClass: ['mat-toolbar', 'mat-warn']} );
  }

}
