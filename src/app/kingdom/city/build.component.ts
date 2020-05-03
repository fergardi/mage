import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-build',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.build.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.build.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="data.building.quantity + ' + ?'" matBadgePosition="above before">
            <img mat-list-avatar [src]="data.building.join.image" alt="{{ data.building.join.name | translate }}"/>
          </div>
          <div mat-line>{{ data.building.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ data.building.join.description | translate }}</div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.land.name' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'resource.land.name' | translate }}" matInput formControlName="lands" />
          <mat-hint>{{ 'kingdom.build.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.build.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.build.cancel' | translate }}</button>
      <button mat-button (click)="build()" cdkFocusInitial>{{ 'kingdom.build.build' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class BuildComponent implements OnInit {

  form: FormGroup = null;

  constructor(
    public dialogRef: MatDialogRef<BuildComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      lands: [0, [Validators.required]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  build(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.lands);
    } else {
      this.notificationService.error('kingdom.build.error');
    }
  }

}