import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-confirm',
  template: `
    <h1 mat-dialog-title>{{ 'world.confirm.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'world.confirm.description' | translate }}</p>
      <mat-list dense *ngIf="data && data.object && data.object.join">
        <mat-list-item [ngClass]="[data.object.join.faction, (data.object.join | legendary) ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="data.object.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="data.object.join.image">
          </div>
          <div mat-line>{{ data.object.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="data.object.join.description | translate | icon:data.object.join"></div>
          <div mat-list-avatar *ngIf="data.object.gold > 0" [matBadge]="data.object.gold | long" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/gold.png">
          </div>
          <div mat-list-avatar *ngIf="data.object.turns > 0" [matBadge]="data.object.turns | long" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'world.confirm.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="confirm()" cdkFocusInitial>{{ 'world.confirm.confirm' | translate }}</button>
    </div>
  `,
  styles: [
  ],
})
export class ConfirmComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConfirmComponent>,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    if (true) {
      try {
        // TODO
        this.notificationService.success('world.confirm.success');
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('world.confirm.error');
      }
    } else {
      this.notificationService.error('world.confirm.error');
    }
  }

}
