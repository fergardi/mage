import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';

@Component({
  selector: 'app-dispel',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.dispel.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.dispel.help' | translate }}</p>
      <mat-list dense>
        <mat-list-item (click)="dispel()" [ngClass]="[enchantment.join.faction, (enchantment.join | legendary) ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="enchantment.level" matBadgePosition="above before" [matBadgeColor]="enchantment.from === uid ? 'accent' : 'warn'">
            <img mat-list-avatar [src]="enchantment.join.image">
          </div>
          <div mat-line>{{ enchantment.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="enchantment.join.description | translate | icon:enchantment.join"></div>
          <div mat-line>
            <mat-progress-bar [color]="enchantment.from === uid ? 'accent' : 'warn'" [value]="enchantment.turns * 100 / enchantment.join.turnDuration"></mat-progress-bar>
          </div>
          <div mat-list-avatar [matBadge]="enchantment.turns" matBadgePosition="above after" [matBadgeColor]="enchantment.from === uid ? 'accent' : 'warn'">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <mat-chip-list>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/mana.png">{{ 20000 | long }}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.dispel.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="dispel()" cdkFocusInitial>{{ 'kingdom.dispel.dispel' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class DispelComponent implements OnInit {

  uid: string = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public enchantment: any,
    private dialogRef: MatDialogRef<DispelComponent>,
    private notificationService: NotificationService,
    private store: Store,
  ) { }

  ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
  }

  close(): void {
    this.dialogRef.close();
  }

  dispel(): void {
    this.dialogRef.close();
  }

}
