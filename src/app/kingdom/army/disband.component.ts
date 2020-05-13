import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-disband',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.disband.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.disband.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="troop.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="troop.join.image">
          </div>
          <div mat-line>{{ troop.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="troop.join.description | translate | icon:troop.join.skills:troop.join.categories:troop.join.families:troop.join.units:troop.join.resources:troop.join.spells"></div>
          <div mat-list-avatar [matBadge]="0" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'kingdom.disband.quantity' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'kingdom.disband.quantity' | translate }}" matInput formControlName="quantity">
          <mat-hint>{{ 'kingdom.disband.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.disband.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.disband.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="disband()" cdkFocusInitial>{{ 'kingdom.disband.disband' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class DisbandComponent implements OnInit {

  form: FormGroup = null;

  constructor(
    public dialogRef: MatDialogRef<DisbandComponent>,
    @Inject(MAT_DIALOG_DATA) public troop: any,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      quantity: [0, [Validators.required, Validators.min(1), Validators.max(this.troop.quantity)]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  disband(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.quantity);
    } else {
      this.notificationService.error('kingdom.disband.error');
    }
  }

}
