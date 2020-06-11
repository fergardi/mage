import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirebaseService } from 'src/app/services/firebase.service';
import { TroopAssignmentType } from '../army/army.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';

export enum BattleType {
  'siege' = 'siege',
  'pillage' = 'pillage',
  'attack' = 'attack',
}

const BATTLE_TURNS = 2;

@Component({
  selector: 'app-battle',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.battle.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.battle.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="kingdom.position | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="kingdom.join.image">
          </div>
          <div mat-line>{{ kingdom.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ kingdom.join.name | translate }}</div>
          <div mat-list-avatar [matBadge]="BATTLE_TURNS" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'kingdom.battle.type' | translate }}</mat-label>
          <mat-select formControlName="type">
            <mat-option *ngFor="let type of battleTypes" [value]="type">{{ 'type.' + type + '.name' | translate }}</mat-option>
          </mat-select>
          <mat-hint>{{ 'kingdom.battle.hint' | translate }}</mat-hint>
          <mat-error>{{ 'kingdom.battle.error' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.battle.cancel' | translate }}</button>
      <div class="button-container">
        <div class="spinner-container" *ngIf="loading"><mat-spinner color="primary" diameter="24"></mat-spinner></div>
        <button mat-raised-button color="primary" [disabled]="form.invalid || loading" (click)="battle()" cdkFocusInitial>{{ 'kingdom.battle.attack' | translate }}</button>
      </div>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
    .list-margened {
      margin-top: 15px;
    }
  `]
})
@UntilDestroy()
export class BattleComponent implements OnInit {

  readonly BATTLE_TURNS = BATTLE_TURNS;
  form: FormGroup = null;
  battleTypes: BattleType[] = [
    BattleType.attack,
    BattleType.pillage,
    BattleType.siege,
  ];
  kingdomTroops: any[] = [];
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomTurn: any = this.store.selectSnapshot(AuthState.getKingdomTurn);
  loading: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public kingdom: any,
    private dialogRef: MatDialogRef<BattleComponent>,
    private firebaseService: FirebaseService,
    private store: Store,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      type: [null, [Validators.required]]
    });
    this.firebaseService.leftJoin(`kingdoms/${this.kingdom.fid}/troops`, 'units', 'id', 'id', ref => ref.where('assignment', '==', TroopAssignmentType.troopDefense)).pipe(untilDestroyed(this)).subscribe(troops => {
      this.kingdomTroops = troops.sort((a, b) => a.join.name - b.join.name);
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async battle() {
    this.loading = true;
    if (this.form.valid && this.BATTLE_TURNS <= this.kingdomTurn.quantity) {
      try {
        let battled = await this.apiService.battleKingdom(this.uid, this.kingdom.fid, this.form.value.type);
        this.notificationService.success('kingdom.battle.success');
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.battle.error');
      }
    } else {
      this.notificationService.error('kingdom.battle.error');
    }
    this.loading = false;
  }

}
