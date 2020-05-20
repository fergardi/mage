import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-report',
  template: `
    <h1 mat-dialog-title>{{ letter.subject }}</h1>
    <div mat-dialog-content>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar>
            <img mat-list-avatar [src]="letter.join.join.image">
          </div>
          <div mat-line>{{ letter.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ letter.join.join.name | translate }}</div>
        </mat-list-item>
      </mat-list>
      <p>{{ letter.message }}</p>
      <mat-list dense *ngIf="letter.log">
        <mat-list-item *ngFor="let log of letter.log" [ngClass]="'log-' + log.side">
          <div mat-list-avatar [matBadge]="log.quantity | long" [matBadgePosition]="log.side === 'left' ? 'above before' : 'above after'">
            <img mat-list-avatar [src]="log.join.image">
          </div>
          <div mat-line>{{ log.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">texto de prueba</div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-actions>
      <button mat-raised-button color="primary" (click)="close()" cdkFocusInitial>{{ 'kingdom.report.close' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
    ::ng-deep .log-right .mat-list-item-content {
      flex-direction: row-reverse !important;
    }
    ::ng-deep .log-right .mat-list-text {
      padding: 0 16px 0 0 !important;
    }
    ::ng-deep .log-right .mat-line,
    ::ng-deep .log-right .mat-line.mat-card-subtitle {
      text-align: right;
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      justify-content: flex-end;
    }
  `]
})
export class ReportComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public letter: any,
    private dialogRef: MatDialogRef<ReportComponent>,
  ) { }

  close() {
    this.dialogRef.close();
  }

}
