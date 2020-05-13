import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-recruit',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.recruit.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.recruit.help' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar matBadge="?" matBadgePosition="above before">
            <img mat-list-avatar [src]="unit.image">
          </div>
          <div mat-line>{{ unit.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="unit.description | translate | icon:unit.skills:unit.categories:unit.families:unit.units:unit.resources:unit.spells"></div>
          <div mat-list-avatar [matBadge]="unit.gold | long" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/gold.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'kingdom.recruit.quantity' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'kingdom.recruit.quantity' | translate }}" matInput formControlName="turns">
          <mat-hint>{{ 'kingdom.recruit.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.recruit.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.recruit.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="recruit()">{{ 'kingdom.recruit.recruit' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class RecruitComponent implements OnInit {

  form: FormGroup = null;

  constructor(
    public dialogRef: MatDialogRef<RecruitComponent>,
    @Inject(MAT_DIALOG_DATA) public unit: any,
    private formBuilder: FormBuilder,
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

  recruit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.turns);
    } else {
      this.notificationService.error('kingdom.recruit.error');
    }
  }

}
