import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-research',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.research.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.research.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item [ngClass]="[charm.spell.faction.id, charm.spell.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="charm.spell.level" matBadgePosition="above before">
            <img mat-list-avatar [src]="charm.spell.image">
          </div>
          <div mat-line>{{ charm.spell.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="charm.spell.description | translate | icon:charm.spell"></div>
          <div mat-line *ngIf="charm.turns < charm.spell.turnResearch">
            <mat-progress-bar [value]="charm.turns * 100 / charm.spell.turnResearch"></mat-progress-bar>
          </div>
          <div mat-list-avatar [matBadge]="((charm.turns) | long) + ' / ' + (charm.spell.turnResearch | long)" matBadgePosition="above after">
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
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="research()">{{ 'kingdom.research.research' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
})
export class ResearchComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomTurn: any = this.store.selectSnapshot(AuthState.getKingdomTurn);
  form: FormGroup = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public charm: any,
    private dialogRef: MatDialogRef<ResearchComponent>,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private store: Store,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      turns: [null, [Validators.required, Validators.min(1), Validators.max(this.kingdomTurn.quantity)]],
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async research() {
    if (this.form.valid && this.form.value.turns <= this.kingdomTurn.quantity) {
      this.loadingService.startLoading();
      try {
        const researched = await this.apiService.researchCharm(this.uid, this.charm.fid, this.form.value.turns);
        this.notificationService.success('kingdom.research.success');
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.research.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.research.error');
    }
  }

}
