import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private options: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  }

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  unauthorized() {
    this.snackBar.open('You must be logged in!', 'OK', {...this.options, panelClass: ['mat-toolbar', 'mat-primary']} );
    return this.snackBar._openedSnackBarRef
      .onAction()
      .pipe(
        tap(_ => 
          this.router.navigate(['/user/login'])
        )
      )
      .subscribe();
  }

}
