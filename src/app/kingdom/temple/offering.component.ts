import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-offering',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.temple-offering.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.temple-offering.description' | translate }}</p>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'kingdom.temple-offering.gold' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'kingdom.temple-offering.gold' | translate }}" matInput formControlName="offering" />
          <mat-hint>{{ 'kingdom.temple-offering.error' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.temple-offering.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.temple-offering.cancel' | translate }}</button>
      <button mat-button (click)="offer()" cdkFocusInitial>{{ 'kingdom.temple-offering.offer' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class OfferingComponent implements OnInit {

  form: FormGroup = null;

  constructor(
    public dialogRef: MatDialogRef<OfferingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      offering: ['', [Validators.required, Validators.min(this.data.gold + 1)]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  offer(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
      this.notificationService.success('kingdom.temple-offering.success')
    } else {
      this.notificationService.error('kingdom.temple-offering.error')
    }
  }

}
