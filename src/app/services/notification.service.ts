import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarDismiss, MatSnackBarRef } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { LongPipe } from '../pipes/long.pipe';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, tap, map, takeUntil, delay, take } from 'rxjs/operators';

enum SnackBarType {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

interface SnackBarQueueItem {
  message: string;
  showing: boolean;
  type: SnackBarType;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private options: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };
  private readonly snackBarQueue = new BehaviorSubject<SnackBarQueueItem[]>([]);
  private readonly snackBarQueue$ = this.snackBarQueue.asObservable();
  private readonly ngDestroy = new Subject();

  constructor(
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
  ) {
    this.snackBarQueue$
    .pipe(
      filter(queue => queue.length > 0 && !queue[0].showing),
      tap(() => {
        const updatedQueue = this.snackBarQueue.value;
        updatedQueue[0].showing = true;
        this.snackBarQueue.next(updatedQueue);
      }),
      map(queue => queue[0]),
      takeUntil(this.ngDestroy),
    ).subscribe(snackBar => this.showSnackbar(snackBar.message, snackBar.type));
  }

  private showSnackbar(message: string, type: SnackBarType): void {
    let matSnackBarRef: MatSnackBarRef<any> = null;
    switch (type) {
      case SnackBarType.SUCCESS:
        matSnackBarRef = this.snackBar.open(message, '✔️', {...this.options, panelClass: ['mat-toolbar', 'mat-accent']});
        break;
      case SnackBarType.WARNING:
        matSnackBarRef = this.snackBar.open(message, '⚠️', {...this.options, panelClass: ['mat-toolbar', 'mat-primary']});
        break;
      case SnackBarType.ERROR:
        matSnackBarRef = this.snackBar.open(message, '❌', {...this.options, panelClass: ['mat-toolbar', 'mat-warn']});
        break;
    }
    this.removeDismissedSnackBar(matSnackBarRef.afterDismissed());
  }

  private removeDismissedSnackBar(snackBar: Observable<MatSnackBarDismiss>): void {
    snackBar
    .pipe(
      delay(0),
      take(1),
    )
    .subscribe(() => {
      const updatedQueue = this.snackBarQueue.value;
      if (updatedQueue[0].showing) updatedQueue.shift();
      this.snackBarQueue.next(updatedQueue);
    });
  }

  success(text: string, variable?: any): void {
    if (variable) {
      Object.keys(variable).forEach((key, index) => {
        if (typeof variable[key] === 'number') variable[key] = new LongPipe().transform(variable[key]);
        if (typeof variable[key] === 'string' && variable[key].includes('.')) variable[key] = this.translateService.instant(variable[key]);
      });
    }
    const message = this.translateService.instant(text, variable);
    const type = SnackBarType.SUCCESS;
    this.snackBarQueue.next(this.snackBarQueue.value.concat([{ message, type, showing: false }]));
  }

  warning(text: string): void {
    const message = this.translateService.instant(text);
    const type = SnackBarType.WARNING;
    this.snackBarQueue.next(this.snackBarQueue.value.concat([{ message, type, showing: false }]));
  }

  error(text: string): void {
    const message = this.translateService.instant(text);
    const type = SnackBarType.ERROR;
    this.snackBarQueue.next(this.snackBarQueue.value.concat([{ message, type, showing: false }]));
  }

}
