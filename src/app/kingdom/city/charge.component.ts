import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-charge',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.charge.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.charge.help' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="node.quantity | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="node.join.image">
          </div>
          <div mat-line>{{ node.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="node.join.description | translate | icon:node.join.skills:node.join.categories:node.join.families:node.join.units:node.join.resources:node.join.spells"></div>
          <div mat-list-avatar matBadge="?" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.turn.name' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'resource.turn.name' | translate }}" matInput formControlName="turns" />
          <mat-hint>{{ 'kingdom.charge.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.charge.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.charge.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="charge()" cdkFocusInitial>{{ 'kingdom.charge.charge' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class ChargeComponent implements OnInit {

  form: FormGroup = null;

  constructor(
    public dialogRef: MatDialogRef<ChargeComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public node: any,
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

  charge(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.turns);
    } else {
      this.notificationService.error('kingdom.charge.error');
    }
  }

}
