import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private options = {
    duration: 5000
  }

  constructor(private snackBar: MatSnackBar, private router: Router) {}

  authError() {
    this.snackBar.open('You must be logged in!', 'OK', this.options);
    return this.snackBar._openedSnackBarRef
      .onAction()
      .pipe(
        tap(_ => 
          this.router.navigate(['/login'])
        )
      )
      .subscribe();
  }

}
