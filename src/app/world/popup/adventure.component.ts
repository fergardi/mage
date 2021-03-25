import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-adventure',
  template: `
    <h1 mat-dialog-title>{{ 'world.adventure.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'world.adventure.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item [ngClass]="[data.item.faction.id, data.item.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="data.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="data.item.image">
          </div>
          <div mat-line>{{ data.item.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="data.item.description | translate | icon:data.item"></div>
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
      <button mat-button (click)="close()">{{ 'world.adventure.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="adventure()" cdkFocusInitial>{{ 'world.adventure.start' | translate }}</button>
    </div>
  `,
  styles: [
  ],
})
export class AdventureComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AdventureComponent>,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }

  adventure(): void {
    if (true) {
      try {
        // TODO
        this.notificationService.success('world.adventure.success');
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('world.adventure.error');
      }
    } else {
      this.notificationService.error('world.adventure.error');
    }
  }

}
