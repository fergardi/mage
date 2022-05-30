import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from 'src/app/services/loading.service';

export enum CharmAssignmentType {
  NONE,
  ATTACK,
  DEFENSE,
}

@Component({
  selector: 'app-conjure',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.conjure.name' | translate }}</h1>
    <div mat-dialog-content>
      <p [innerHTML]="'kingdom.conjure.description' | translate | icon"></p>
      <div matSubheader>{{ 'kingdom.conjure.charm' | translate }}:</div>
      <mat-list dense *ngIf="!kingdomCharms && selectedCharm">
        <mat-list-item [ngClass]="[selectedCharm.spell.faction.id, selectedCharm.spell.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="selectedCharm.spell.level" matBadgePosition="above before">
            <img mat-list-avatar [src]="selectedCharm.spell.image">
          </div>
          <div mat-line>{{ selectedCharm.spell.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" *ngIf="['god', 'family', 'skill', 'resource', 'category'].includes(selectedCharm.spell.type)">{{ selectedCharm.spell.description | translate }}</div>
          <div mat-line class="mat-card-subtitle" *ngIf="['spell', 'item'].includes(selectedCharm.spell.type)" [innerHTML]="selectedCharm.spell.description | translate | icon:selectedCharm.spell"></div>
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
                <div mat-line class="mat-card-subtitle" *ngIf="['god', 'family', 'skill', 'resource', 'category'].includes(selectedCharm.spell.type)">{{ selectedCharm.spell.description | translate }}</div>
                <div mat-line class="mat-card-subtitle" *ngIf="['spell', 'hero', 'item'].includes(selectedCharm.spell.type)" [innerHTML]="selectedCharm.spell.description | translate | icon:selectedCharm.spell"></div>
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
                <div mat-line class="mat-card-subtitle" *ngIf="['god', 'family', 'skill', 'resource', 'category'].includes(charm.spell.type)">{{ charm.spell.description | translate }}</div>
                <div mat-line class="mat-card-subtitle" *ngIf="['spell', 'hero', 'item'].includes(charm.spell.type)" [innerHTML]="charm.spell.description | translate | icon:charm.spell"></div>
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
    @Inject(MAT_DIALOG_DATA) public conjuration: any,
    private dialogRef: MatDialogRef<ConjureComponent>,
    private store: Store,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private angularFirestore: AngularFirestore,
    private loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
    this.angularFirestore.collection<any>(`kingdoms/${this.uid}/charms`, ref => ref.where('spell.battle', '==', false).where('spell.self', '==', !this.conjuration.kingdom)).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(charms => {
      this.kingdomCharms = charms;
      if (this.conjuration.charm) this.selectedCharm = this.kingdomCharms.find(charm => charm.fid === this.conjuration.charm.fid);
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  async conjure() {
    if (this.selectedCharm.spell.turnCost <= this.kingdomTurn.quantity && this.selectedCharm.spell.manaCost <= this.kingdomMana.quantity) {
      this.loadingService.startLoading();
      try {
        const conjured = await this.apiService.conjureCharm(this.uid, this.selectedCharm.fid, this.conjuration.kingdom ? this.conjuration.kingdom.fid : this.uid);
        if (this.selectedCharm.spell.subtype === 'summon') this.notificationService.success('kingdom.conjure.summon', conjured);
        if (this.selectedCharm.spell.subtype === 'resource') this.notificationService.success('kingdom.conjure.resource', conjured);
        if (this.selectedCharm.spell.subtype === 'item') this.notificationService.success('kingdom.conjure.item', conjured);
        if (this.selectedCharm.spell.subtype === 'spell') this.notificationService.success('kingdom.conjure.spell', conjured);
        if (this.selectedCharm.spell.subtype === 'enchantment' && !this.selectedCharm.spell.multiple) this.notificationService.success('kingdom.conjure.enchantment', conjured);
        if (this.selectedCharm.spell.subtype === 'enchantment' && this.selectedCharm.spell.multiple) this.notificationService.success('kingdom.dispel.success');
        this.close();
      } catch (error) {
        this.notificationService.error('kingdom.conjure.error', error as Error);
      }
    } else {
      this.notificationService.error('kingdom.conjure.error');
    }
    this.loadingService.stopLoading();
  }

}
