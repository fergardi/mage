import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-tax',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.tax.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.tax.help' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="village.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="village.join.image">
          </div>
          <div mat-line>{{ village.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="village.join.description | translate | icon:village.join.skills:village.join.categories:village.join.families:village.join.units:village.join.resources:village.join.spells"></div>
          <div mat-list-avatar matBadge="?" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.turn.name' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'resource.turn.name' | translate }}" matInput formControlName="turns">
          <mat-hint>{{ 'kingdom.tax.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.tax.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.tax.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="tax()">{{ 'kingdom.tax.tax' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class TaxComponent implements OnInit {

  form: FormGroup = null;

  constructor(
    public dialogRef: MatDialogRef<TaxComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public village: any,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      turns: [0, [Validators.required, Validators.min(1)]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  tax(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.turns);
    } else {
      this.notificationService.error('kingdom.offer.error');
    }
  }

}
