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
    private router: Router,
    private translateService: TranslateService,
  ) {}

  unauthorized() {
    this.snackBar.open('You must be logged in!', 'OK', {...this.options, panelClass: ['mat-toolbar', 'mat-primary']} );
    return this.snackBar._openedSnackBarRef
      .onAction()
      .pipe(
        untilDestroyed(this),
        tap(_ => 
          this.router.navigate(['/user/login'])
        )
      )
      .subscribe();
  }

  success(text: string) {
    this.snackBar.open(this.translateService.instant(text), '', {...this.options, panelClass: ['mat-toolbar', 'mat-primary']} );
  }

  warning(text: string) {
    this.snackBar.open(this.translateService.instant(text), '', {...this.options, panelClass: ['mat-toolbar', 'mat-accent']} );
  }

  error(text: string) {
    this.snackBar.open(this.translateService.instant(text), '', {...this.options, panelClass: ['mat-toolbar', 'mat-warn']} );
  }

}
