import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { CacheService } from 'src/app/services/cache.service';
import { Attack, Kingdom, Supply } from 'src/app/shared/type/interface.model';

const BATTLE_TURNS = 2;

@Component({
  selector: 'app-battle',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.battle.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.battle.description' | translate }}</p>
      <div matSubheader>{{ 'kingdom.battle.target' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="kingdom.faction.id">
          <div mat-list-avatar [matBadge]="kingdom.position | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="kingdom.faction.image">
          </div>
          <div mat-line>{{ kingdom.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ kingdom.faction.name | translate }}</div>
          <div mat-list-avatar [matBadge]="BATTLE_TURNS" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <div matSubheader>{{ 'kingdom.battle.select' | translate }}:</div>
      <mat-form-field>
        <mat-label>{{ 'kingdom.battle.type' | translate }}</mat-label>
        <mat-select [(ngModel)]="attack">
          <mat-select-trigger>
            <mat-list dense>
              <mat-list-item>
                <div mat-list-avatar>
                  <img mat-list-avatar [src]="attack.image">
                </div>
                <div mat-line>{{ attack.name | translate }}</div>
                <div mat-line class="mat-card-subtitle" [innerHTML]="attack.description | translate | icon:attack"></div>
              </mat-list-item>
            </mat-list>
          </mat-select-trigger>
          <mat-option *ngFor="let atk of attacks" [value]="atk">
            <mat-list dense>
              <mat-list-item>
                <div mat-list-avatar>
                  <img mat-list-avatar [src]="atk.image">
                </div>
                <div mat-line>{{ atk.name | translate }}</div>
                <div mat-line class="mat-card-subtitle" [innerHTML]="atk.description | translate | icon:atk"></div>
              </mat-list-item>
            </mat-list>
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.battle.cancel' | translate }}</button>
      <div class="button-container">
        <div class="spinner-container" *ngIf="loading"><mat-spinner color="primary" diameter="24"></mat-spinner></div>
        <button mat-raised-button color="primary" [disabled]="loading" (click)="battle()" cdkFocusInitial>{{ 'kingdom.battle.attack' | translate }}</button>
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
  `],
})
@UntilDestroy()
export class BattleComponent implements OnInit {

  readonly BATTLE_TURNS = BATTLE_TURNS;
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomTurn: Supply = this.store.selectSnapshot(AuthState.getKingdomTurn);
  attacks: Array<Attack> = [];
  attack: Attack = null;
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public kingdom: Kingdom,
    private dialogRef: MatDialogRef<BattleComponent>,
    private store: Store,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private cacheService: CacheService,
  ) { }

  async ngOnInit(): Promise<void> {
    const attacks = await this.cacheService.getAttacks();
    this.attacks = attacks;
    this.attack = this.attacks[0];
  }

  close(): void {
    this.dialogRef.close();
  }

  async battle(): Promise<void> {
    if (this.BATTLE_TURNS <= this.kingdomTurn.quantity) {
      try {
        this.loading = true;
        await this.apiService.battleKingdom(this.uid, this.kingdom.fid, this.attack.id);
        this.notificationService.success('kingdom.battle.success');
        this.close();
      } catch (error) {
        this.notificationService.error('kingdom.battle.error', error as Error);
      } finally {
        this.loading = false;
      }
    } else {
      this.notificationService.error('kingdom.battle.error');
    }
  }

}
