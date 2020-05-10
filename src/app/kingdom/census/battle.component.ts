import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirebaseService } from 'src/app/services/firebase.service';
import { TroopAssignmentType } from '../army/army.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

export enum BattleType {
  'siege' = 'siege',
  'pillage' = 'pillage',
  'attack' = 'attack',
}

@Component({
  selector: 'app-battle',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.battle.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.battle.description' | translate }}</p>
      <mat-form-field>
        <mat-label>{{ 'kingdom.battle.type' | translate }}</mat-label>
        <mat-select [(ngModel)]="attackType">
          <mat-option *ngFor="let type of attackTypes" [value]="type">{{ 'type.' + type + '.name' | translate }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-list dense>
        <mat-list-item *ngFor="let troop of kingdomTroops">
          <div mat-list-avatar matBadge="?" matBadgePosition="above before">
            <img mat-list-avatar [src]="troop.join.image">
          </div>
          <div mat-line>{{ troop.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">
            <img [title]="family.name | translate" class="icon" *ngFor="let family of troop.join.families" [src]="family.image"/>
            <img [title]="category.name | translate" class="icon" *ngFor="let category of troop.join.categories" [src]="category.image"/>
            <img [title]="skill.name | translate" class="icon" *ngFor="let skill of troop.join.skills" [src]="skill.image"/>
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.battle.cancel' | translate }}</button>
      <button mat-raised-button color="accent" [mat-dialog-close]="attackType" cdkFocusInitial>{{ 'kingdom.battle.attack' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
@UntilDestroy()
export class BattleComponent implements OnInit {

  attackTypes: BattleType[] = [
    BattleType.attack,
    BattleType.pillage,
    BattleType.siege,
  ];
  attackType: BattleType = BattleType.attack;
  kingdomTroops: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<BattleComponent>,
    private firebaseService: FirebaseService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this.firebaseService.leftJoin(`kingdoms/${this.data.fid}/troops`, 'units', 'id', 'id', ref => ref.where('assignment', '==', TroopAssignmentType.troopDefense)).pipe(untilDestroyed(this)).subscribe(troops => {
      this.kingdomTroops = troops.sort((a, b) => a.join.name - b.join.name);
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}
