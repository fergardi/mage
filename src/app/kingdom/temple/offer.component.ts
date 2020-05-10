import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-offer',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.offer.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.offer.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar>
            <img mat-list-avatar [src]="data.god.image">
          </div>
          <div mat-line>{{ data.god.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ data.god.description | translate }}</div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.gold.name' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'resource.gold.name' | translate }}" matInput formControlName="offer" />
          <mat-hint>{{ 'kingdom.offer.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.offer.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.offer.cancel' | translate }}</button>
      <button mat-button (click)="offer()" cdkFocusInitial>{{ 'kingdom.offer.offer' | translate }}</button>
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
    public dialogRef: MatDialogRef<OfferComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      offer: ['', [Validators.required, Validators.min(this.data.gold + 1)]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  offer(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.offer);
    } else {
      this.notificationService.error('kingdom.offer.error');
    }
  }

}
