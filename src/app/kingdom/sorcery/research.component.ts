import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-research',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.research.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.research.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="charm.join.level | short" matBadgePosition="above before">
            <img mat-list-avatar [src]="charm.join.image">
          </div>
          <div mat-line>{{ charm.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="charm.join.description | translate | icon:charm.join.skills:charm.join.categories:charm.join.families:charm.join.units:charm.join.resources:charm.join.spells"></div>
          <div mat-line *ngIf="charm.turns < charm.join.research">
            <mat-progress-bar [value]="charm.turns * 100 / charm.join.research"></mat-progress-bar>
          </div>
          <div mat-list-avatar [matBadge]="charm.join.research - charm.turns" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'resource.turn.name' | translate }}</mat-label>
          <input type="number" placeholder="{{ 'resource.turn.name' | translate }}" matInput formControlName="turns">
          <mat-hint>{{ 'kingdom.research.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.research.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.research.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="research()" cdkFocusInitial>{{ 'kingdom.research.research' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class ResearchComponent implements OnInit {

  form: FormGroup = null;

  constructor(
    public dialogRef: MatDialogRef<ResearchComponent>,
    @Inject(MAT_DIALOG_DATA) public charm: any,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      turns: [null, [Validators.required, Validators.min(1), Validators.max(300)]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  research(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.turns);
    } else {
      this.notificationService.error('kingdom.research.error');
    }
  }

}
