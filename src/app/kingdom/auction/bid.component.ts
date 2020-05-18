import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-bid',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.bid.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.bid.help' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="auction.quantity" matBadgePosition="above before">
            <img mat-list-avatar [src]="auction.join.image">
          </div>
          <div mat-line>{{ auction.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="auction.join.description | translate | icon:auction.join.skills:auction.join.categories:auction.join.families:auction.join.units:auction.join.resources:auction.join.spells"></div>
          <div mat-list-avatar [matBadge]="auction.gold | long" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/gold.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.gold.name' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'kingdom.bid.quantity' | translate }}" matInput formControlName="gold">
          <mat-hint>{{ 'kingdom.bid.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.bid.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.bid.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="bid()" cdkFocusInitial>{{ 'kingdom.bid.bid' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class BidComponent implements OnInit {

  form: FormGroup = null;

  constructor(
    public dialogRef: MatDialogRef<BidComponent>,
    @Inject(MAT_DIALOG_DATA) public auction: any,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      gold: [null, [Validators.required, Validators.min(1)]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  bid(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.gold);
    } else {
      this.notificationService.error('kingdom.bid.error');
    }
  }

}
