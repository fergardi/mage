import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Kingdom, Troop } from 'src/app/shared/type/interface.model';

@Component({
  selector: 'app-detail',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.detail.name' | translate }}</h1>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.detail.kingdom' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="[kingdom.faction.id, kingdom.fid === uid ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="kingdom.position | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="kingdom.faction.image">
          </div>
          <div mat-line>{{ kingdom.name }}</div>
          <div mat-line class="mat-card-subtitle">{{ kingdom.faction.name | translate }}</div>
          <div mat-list-avatar [matBadge]="kingdom.power | short" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/icons/power.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.detail.troops' | translate }}:</div>
      <mat-list dense>
        <mat-list-item *ngFor="let troop of kingdomTroops" [ngClass]="[troop.unit.faction.id, troop.unit.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar matBadge="?" matBadgePosition="above before">
            <img mat-list-avatar [src]="troop.unit.image">
          </div>
          <div mat-line>{{ troop.unit.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">
            <img [title]="family.name | translate" class="icon" *ngFor="let family of troop.unit.families" [src]="family.image">
            <img [title]="skill.name | translate" class="icon" *ngFor="let skill of troop.unit.skills" [src]="skill.image">
            <img [title]="category.name | translate" class="icon" *ngFor="let category of troop.unit.categories" [src]="category.image">
          </div>
          <div mat-line class="mat-card-subtitle" *ngIf="troop.unit.resistances && troop.unit.resistances.length">
            <img [title]="('category.resistance.name' | translate) + (category.name | translate)" class="icon grayscale" *ngFor="let category of troop.unit.resistances" [src]="category.image">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-actions>
      <button mat-raised-button color="primary" (click)="close()">{{ 'kingdom.detail.close' | translate }}</button>
    </div>
  `,
  styles: [
  ],
})
@UntilDestroy()
export class DetailComponent implements OnInit {

  kingdomTroops: Array<Troop> = [];
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);

  constructor(
    @Inject(MAT_DIALOG_DATA) public kingdom: Kingdom,
    private dialogRef: MatDialogRef<DetailComponent>,
    private angularFirestore: AngularFirestore,
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.angularFirestore.collection<Troop>(`kingdoms/${this.kingdom.id}/troops`, ref => ref.where('assignment', '==', 2)).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(troops => {
      this.kingdomTroops = troops;
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}
