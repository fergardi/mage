import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-buy',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.buy.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.buy.help' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="1" matBadgePosition="above before">
            <img mat-list-avatar [src]="item.image">
          </div>
          <div mat-line>{{ item.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="item.description | translate | icon:item.skills:item.categories:item.families:item.items:item.resources:item.spells"></div>
          <div mat-list-avatar [matBadge]="item.gems" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/gem.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.buy.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="buy()" cdkFocusInitial>{{ 'kingdom.buy.buy' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class BuyComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public item: any,
    private dialogRef: MatDialogRef<BuyComponent>,
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  buy(): void {
    this.dialogRef.close(this.item.id);
  }

}
