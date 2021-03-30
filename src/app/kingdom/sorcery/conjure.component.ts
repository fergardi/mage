import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { take } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { AngularFirestore } from '@angular/fire/firestore';

export enum CharmAssignmentType {
  'none' = 3,
  'attack' = 4,
  'defense' = 5,
}

@Component({
  selector: 'app-conjure',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.conjure.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.conjure.description' | translate }}</p>
      <div matSubheader>{{ 'kingdom.conjure.charm' | translate }}:</div>
      <mat-list dense *ngIf="!kingdomCharms && selectedCharm">
        <mat-list-item [ngClass]="[selectedCharm.spell.faction.id, selectedCharm.spell.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="selectedCharm.spell.level" matBadgePosition="above before">
            <img mat-list-avatar [src]="selectedCharm.spell.image">
          </div>
          <div mat-line>{{ selectedCharm.spell.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="selectedCharm.spell.description | translate | icon:selectedCharm"></div>
          <div mat-list-avatar [matBadge]="selectedCharm.spell.turnCost" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <mat-form-field *ngIf="kingdomCharms">
        <mat-label>{{ 'kingdom.conjure.select' | translate }}</mat-label>
        <mat-select [(ngModel)]="selectedCharm">
          <mat-select-trigger *ngIf="selectedCharm">
            <mat-list dense>
              <mat-list-item [ngClass]="[selectedCharm.spell.faction.id, selectedCharm.spell.legendary ? 'legendary' : 'common']">
                <div mat-list-avatar [matBadge]="selectedCharm.spell.level" matBadgePosition="above before">
                  <img mat-list-avatar [src]="selectedCharm.spell.image">
                </div>
                <div mat-line>{{ selectedCharm.spell.name | translate }}</div>
                <div mat-line class="mat-card-subtitle" [innerHTML]="selectedCharm.spell.description | translate | icon:selectedCharm"></div>
                <div mat-list-avatar [matBadge]="selectedCharm.spell.turnCost" matBadgePosition="above after">
                  <img mat-list-avatar src="/assets/images/resources/turn.png">
                </div>
              </mat-list-item>
            </mat-list>
          </mat-select-trigger>
          <mat-option *ngFor="let charm of kingdomCharms" [value]="charm">
            <mat-list dense>
              <mat-list-item [ngClass]="[charm.spell.faction.id, charm.spell.legendary ? 'legendary' : 'common']">
                <div mat-list-avatar [matBadge]="charm.spell.level" matBadgePosition="above before">
                  <img mat-list-avatar [src]="charm.spell.image">
                </div>
                <div mat-line>{{ charm.spell.name | translate }}</div>
                <div mat-line class="mat-card-subtitle" [innerHTML]="charm.spell.description | translate | icon:charm"></div>
                <div mat-list-avatar [matBadge]="charm.spell.turnCost" matBadgePosition="above after">
                  <img mat-list-avatar src="/assets/images/resources/turn.png">
                </div>
              </mat-list-item>
            </mat-list>
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <div mat-dialog-content *ngIf="selectedCharm">
      <div matSubheader>{{ 'kingdom.conjure.costs' | translate }}:</div>
      <mat-chip-list>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/mana.png">{{ selectedCharm.spell.manaCost | long }}</mat-chip>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/turn.png">{{ selectedCharm.spell.turnCost | long }}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.conjure.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="!selectedCharm" (click)="conjure()">{{ 'kingdom.conjure.conjure' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
})
@UntilDestroy()
export class ConjureComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomTurn: any = this.store.selectSnapshot(AuthState.getKingdomTurn);
  kingdomMana: any = this.store.selectSnapshot(AuthState.getKingdomMana);
  kingdomCharms: any[] = null;
  selectedCharm: any = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public charm: any,
    private dialogRef: MatDialogRef<ConjureComponent>,
    private store: Store,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private angularFirestore: AngularFirestore,
  ) { }

  ngOnInit(): void {
    // TODO
    if (this.charm) {
      // this.kingdomCharms = [this.charm];
      this.selectedCharm = this.charm;
    } else {
      this.angularFirestore.collection<any>(`kingdoms/${this.uid}/charms`, ref => ref.where('charm.spell.battle', '==', true).where('charm.spell.self', '==', false)).valueChanges({ idField: 'fid' }).pipe(take(1), untilDestroyed(this)).subscribe(charms => {
        this.kingdomCharms = charms;
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  async conjure() {
    if (this.selectedCharm.spell.turnCost <= this.kingdomTurn.quantity && this.selectedCharm.spell.manaCost <= this.kingdomMana.quantity) {
      try {
        const conjured = await this.apiService.conjureCharm(this.uid, this.selectedCharm.fid, this.uid);
        this.notificationService.success('kingdom.conjure.success');
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.conjure.error');
      }
    } else {
      this.notificationService.error('kingdom.conjure.error');
    }
  }

}
