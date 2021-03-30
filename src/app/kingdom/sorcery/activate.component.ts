import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { AngularFirestore } from '@angular/fire/firestore';

export enum ArtifactAssignmentType {
  'none' = 0,
  'attack' = 1,
  'defense' = 2,
}

@Component({
  selector: 'app-activate',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.activate.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.activate.description' | translate }}</p>
      <div matSubheader>{{ 'kingdom.activate.artifact' | translate }}:</div>
      <mat-list dense *ngIf="!kingdomArtifacts">
        <mat-list-item [ngClass]="[selectedArtifact.item.faction.id, selectedArtifact.item.legendary ? 'legendary' : 'common']" *ngIf="selectedArtifact">
          <div mat-list-avatar [matBadge]="selectedArtifact.quantity" matBadgePosition="above before">
            <img mat-list-avatar [src]="selectedArtifact.item.image">
          </div>
          <div mat-line>{{ selectedArtifact.item.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="selectedArtifact.item.description | translate | icon:selectedArtifact.item"></div>
          <div mat-list-avatar [matBadge]="selectedArtifact.item.turns" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <mat-form-field *ngIf="kingdomArtifacts">
        <mat-label>{{ 'kingdom.activate.select' | translate }}</mat-label>
        <mat-select [(ngModel)]="selectedArtifact">
          <mat-select-trigger *ngIf="selectedArtifact">
            <mat-list dense>
              <mat-list-item [ngClass]="[selectedArtifact.item.faction.id, selectedArtifact.item.legendary ? 'legendary' : 'common']">
                <div mat-list-avatar [matBadge]="selectedArtifact.quantity" matBadgePosition="above before">
                  <img mat-list-avatar [src]="selectedArtifact.item.image">
                </div>
                <div mat-line>{{ selectedArtifact.item.name | translate }}</div>
                <div mat-line class="mat-card-subtitle" [innerHTML]="selectedArtifact.item.description | translate | icon:selectedArtifact.item"></div>
                <div mat-list-avatar [matBadge]="selectedArtifact.item.turns" matBadgePosition="above after">
                  <img mat-list-avatar src="/assets/images/resources/turn.png">
                </div>
              </mat-list-item>
            </mat-list>
          </mat-select-trigger>
          <mat-option *ngFor="let artifact of kingdomArtifacts" [value]="artifact">
            <mat-list dense>
              <mat-list-item [ngClass]="[artifact.item.faction.id, artifact.item.legendary ? 'legendary' : 'common']">
                <div mat-list-avatar [matBadge]="artifact.quantity" matBadgePosition="above before">
                  <img mat-list-avatar [src]="artifact.item.image">
                </div>
                <div mat-line>{{ artifact.item.name | translate }}</div>
                <div mat-line class="mat-card-subtitle" [innerHTML]="artifact.item.description | translate | icon:artifact.item"></div>
                <div mat-list-avatar [matBadge]="artifact.item.turns" matBadgePosition="above after">
                  <img mat-list-avatar src="/assets/images/resources/turn.png">
                </div>
              </mat-list-item>
            </mat-list>
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.activate.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="!selectedArtifact" (click)="activate()">{{ 'kingdom.activate.activate' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
})
@UntilDestroy()
export class ActivateComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomTurn: any = this.store.selectSnapshot(AuthState.getKingdomTurn);
  kingdomArtifacts: any[] = null;
  selectedArtifact: any = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public artifact: any,
    private dialogRef: MatDialogRef<ActivateComponent>,
    private angularFirestore: AngularFirestore,
    private store: Store,
    private apiService: ApiService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    if (this.artifact) {
      // this.kingdomArtifacts = [this.artifact];
      this.selectedArtifact = this.artifact;
    } else {
      this.angularFirestore.collection<any>(`kingdoms/${this.uid}/artifacts`, ref => ref.where('assignment', '==', ArtifactAssignmentType.none)).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(artifacts => {
        this.kingdomArtifacts = artifacts.filter(artifact => !artifact.item.battle && !artifact.item.self);
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  async activate() {
    if (this.selectedArtifact.quantity && this.selectedArtifact.item.turns <= this.kingdomTurn.quantity) {
      try {
        const activated = await this.apiService.activateArtifact(this.uid, this.selectedArtifact.fid, this.uid);
        this.notificationService.success('kingdom.activate.success');
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.activate.error');
      }
    } else {
      this.notificationService.error('kingdom.activate.error');
    }
  }

}
