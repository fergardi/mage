import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/firestore';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@Component({
  selector: 'app-manifest',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.manifest.name' | translate }}</h1>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.manifest.clan' | translate }}:</div>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar>
            <img mat-list-avatar [src]="clan.image">
          </div>
          <div mat-line>{{ clan.name }}</div>
          <div mat-line class="mat-card-subtitle">{{ clan.description }}</div>
          <div mat-list-avatar [matBadge]="clan.power | short" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/icons/power.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.manifest.leader' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="clan.leader.faction.id">
          <div mat-list-avatar>
            <img mat-list-avatar [src]="clan.leader.faction.image">
          </div>
          <div mat-line>{{ clan.leader.name }}</div>
          <div mat-line class="mat-card-subtitle">{{ clan.leader.faction.name | translate }}</div>
          <div mat-list-avatar [matBadge]="clan.leader.power | short" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/icons/power.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.manifest.members' | translate }}:</div>
      <mat-list dense>
        <mat-list-item *ngFor="let member of clan.members" [ngClass]="member.faction.id">
          <div mat-list-avatar>
            <img mat-list-avatar [src]="member.faction.image">
          </div>
          <div mat-line>{{ member.name }}</div>
          <div mat-line class="mat-card-subtitle">{{ member.faction.name | translate }}</div>
          <div mat-list-avatar [matBadge]="member.power | short" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/icons/power.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-actions>
      <button mat-raised-button color="primary" (click)="close()">{{ 'kingdom.manifest.close' | translate }}</button>
    </div>
  `,
  styles: [
  ],
})
@UntilDestroy()
export class ManifestComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public clan: any,
    private dialogRef: MatDialogRef<ManifestComponent>,
    private angularFirestore: AngularFirestore,
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.angularFirestore.collection<any>(`clans/${this.clan.fid}/members`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(members => {
      this.clan.members = members;
    });
  }

}
