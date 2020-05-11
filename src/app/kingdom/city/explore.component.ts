import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-explore',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.explore.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.explore.help' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="lands | long" matBadgePosition="above before">
            <img mat-list-avatar src="/assets/images/resources/land.png">
          </div>
          <div mat-line>{{ 'resource.land.name' | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ 'resource.land.description' | translate }}</div>
          <div mat-list-avatar matBadge="?" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.turn.name' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'resource.turn.name' | translate }}" matInput formControlName="turns" />
          <mat-hint>{{ 'kingdom.explore.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.explore.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.explore.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="explore()" cdkFocusInitial>{{ 'kingdom.explore.explore' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class ExploreComponent implements OnInit {

  form: FormGroup = null;

  constructor(
    public dialogRef: MatDialogRef<ExploreComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public lands: number,
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

  explore(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.turns);
    } else {
      this.notificationService.error('kingdom.explore.error');
    }
  }

}
