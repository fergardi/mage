import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-offer',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.offer.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.offer.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar matBadge="?" matBadgePosition="above before">
            <img mat-list-avatar [src]="god.image">
          </div>
          <div mat-line>{{ god.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ god.description | translate }}</div>
          <div mat-list-avatar [matBadge]="god.gold" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/gold.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.gold.name' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'resource.gold.name' | translate }}" matInput formControlName="gold">
          <mat-hint>{{ 'kingdom.offer.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.offer.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.offer.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="offer()" cdkFocusInitial>{{ 'kingdom.offer.offer' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class OfferComponent implements OnInit {

  form: FormGroup = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public god: any,
    private dialogRef: MatDialogRef<OfferComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      gold: [null, [Validators.required, Validators.min(this.god.gold + 1)]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  offer(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.gold);
    } else {
      this.notificationService.error('kingdom.offer.error');
    }
  }

}
