import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { AuthState } from 'src/app/shared/auth/auth.state';

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
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="research()" cdkFocusInitial>{{ 'kingdom.research.research' | translate }}</button>
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
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomTurn: any = this.store.selectSnapshot(AuthState.getKingdomTurn);

  constructor(
    @Inject(MAT_DIALOG_DATA) public charm: any,
    private dialogRef: MatDialogRef<ResearchComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      turns: [null, [Validators.required, Validators.min(1), Validators.max(this.kingdomTurn.quantity)]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async research() {
    if (this.form.valid && this.form.value.turns <= this.kingdomTurn.quantity) {
      try {
        let researched = await this.apiService.researchCharm(this.uid, this.charm.fid, this.form.value.turns);
        this.notificationService.success('kingdom.research.success');
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.research.error');
      }
    } else {
      this.notificationService.error('kingdom.research.error');
    }
  }

}
