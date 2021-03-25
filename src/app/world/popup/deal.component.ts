import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-deal',
  template: `
    <h1 mat-dialog-title>{{ 'world.deal.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'world.deal.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item [ngClass]="[data.join.faction.id, data.join.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="data.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="data.join.image">
          </div>
          <div mat-line>{{ data.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="data.join.description | translate | icon:data.join"></div>
          <div mat-list-avatar *ngIf="data.gold > 0" [matBadge]="data.gold | long" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/gold.png">
          </div>
          <div mat-list-avatar *ngIf="data.turns > 0" [matBadge]="data.turns | long" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'world.deal.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="deal()" cdkFocusInitial>{{ 'world.deal.trade' | translate }}</button>
    </div>
  `,
  styles: [
  ],
})
export class DealComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DealComponent>,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }

  deal(): void {
    if (true) {
      try {
        // TODO
        this.notificationService.success('world.deal.success');
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('world.deal.error');
      }
    } else {
      this.notificationService.error('world.deal.error');
    }
  }

}
