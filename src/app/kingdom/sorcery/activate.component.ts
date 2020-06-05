import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';

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
      <mat-form-field>
        <mat-label>{{ 'kingdom.activate.select' | translate }}</mat-label>
        <mat-select [(ngModel)]="selectedArtifact">
          <mat-select-trigger *ngIf="selectedArtifact">
            <mat-list dense>
              <mat-list-item>
                <div mat-list-avatar [matBadge]="selectedArtifact.quantity" matBadgePosition="above before">
                  <img mat-list-avatar [src]="selectedArtifact.join.image">
                </div>
                <div mat-line>{{ selectedArtifact.join.name | translate }}</div>
                <div mat-line class="mat-card-subtitle" [innerHTML]="selectedArtifact.join.description | translate | icon:selectedArtifact.join.skills:selectedArtifact.join.categories:selectedArtifact.join.families:selectedArtifact.join.units:selectedArtifact.join.resources:selectedArtifact.join.spells:selectedArtifact.join.adjacents:selectedArtifact.join.opposites"></div>
                <div mat-list-avatar [matBadge]="selectedArtifact.join.turns" matBadgePosition="above after">
                  <img mat-list-avatar src="/assets/images/resources/turn.png">
                </div>
              </mat-list-item>
            </mat-list>
          </mat-select-trigger>
          <mat-option *ngFor="let artifact of kingdomArtifacts" [value]="artifact">{{ artifact.join.name | translate }}</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.activate.cancel' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="!selectedArtifact" (click)="activate()" cdkFocusInitial>{{ 'kingdom.activate.activate' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
@UntilDestroy()
export class ActivateComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomTurn: any = this.store.selectSnapshot(AuthState.getKingdomTurn);
  kingdomArtifacts: any[] = [];
  selectedArtifact: any = null;

  constructor(
    private dialogRef: MatDialogRef<ActivateComponent>,
    private firebaseService: FirebaseService,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public artifact: any,
    private apiService: ApiService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    if (this.artifact) {
      this.kingdomArtifacts = [this.artifact];
      this.selectedArtifact = this.artifact;
    } else {
      this.firebaseService.leftJoin(`kingdoms/${this.uid}/artifacts`, 'items', 'id', 'id', ref => ref.where('assignment', '==', ArtifactAssignmentType.none)).pipe(untilDestroyed(this)).subscribe(artifacts => {
        this.kingdomArtifacts = artifacts.filter(artifact => !artifact.join.battle && !artifact.join.self);
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  async activate() {
    if (this.selectedArtifact.join.turns <= this.kingdomTurn.quantity) {
      try {
        let activated = await this.apiService.activateArtifact(this.uid, this.selectedArtifact.fid, this.uid);
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
