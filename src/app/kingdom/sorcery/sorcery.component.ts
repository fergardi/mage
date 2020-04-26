import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AngularFirestore } from '@angular/fire/firestore';
import { NotificationService } from 'src/app/services/notification.service';
import { AssignmentType } from '../army/army.component';
import { MatDialog } from '@angular/material/dialog';
import { ResearchComponent } from './research.component';

@Component({
  selector: 'app-sorcery',
  templateUrl: './sorcery.component.html',
  styleUrls: ['./sorcery.component.scss']
})
@UntilDestroy()
export class SorceryComponent implements OnInit {

  kingdomArtifacts: any[] = [];
  attackArtifacts: any[] = [];
  defenseArtifacts: any[] = [];
  maximumArtifacts: number = 1;
  
  kingdomCharms: any[] = [];
  attackCharms: any[] = [];
  defenseCharms: any[] = [];
  maximumCharms: number = 1;

  constructor(
    private firebaseService: FirebaseService,
    private angularFireAuth: AngularFireAuth,
    private angularFireStore: AngularFirestore,
    private notificationService: NotificationService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.angularFireAuth.authState.pipe(first()).subscribe(user => {
      this.firebaseService.leftJoin(`kingdoms/${user.uid}/artifacts`, 'items', 'id', 'id').pipe(untilDestroyed(this)).subscribe(artifacts => {
        this.kingdomArtifacts = artifacts.filter(artifact => artifact.assignment === AssignmentType.none || !artifact.assignment);
        this.attackArtifacts = artifacts.filter(artifact => artifact.assignment === AssignmentType.attack);
        this.defenseArtifacts = artifacts.filter(artifact => artifact.assignment === AssignmentType.defense);
      });
      this.firebaseService.leftJoin(`kingdoms/${user.uid}/charms`, 'spells', 'id', 'id').pipe(untilDestroyed(this)).subscribe(charms => {
        this.kingdomCharms = charms.filter(charm => charm.assignment === AssignmentType.none || !charm.assignment);
        this.attackCharms = charms.filter(charm => charm.assignment === AssignmentType.attack);
        this.defenseCharms = charms.filter(charm => charm.assignment === AssignmentType.defense);
      });
    });
  }

  assignArtifact($event: CdkDragDrop<any>) {
    if ($event.container.data.length < this.maximumArtifacts) {
      if ($event.previousContainer === $event.container) {
        moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
      } else {
        transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
      }
      this.updateArtifacts();
    } else {
      this.notificationService.warning('kingdom.sorcery.maximum')
    }
  }

  async updateArtifacts() {
    try {
      let refs = [];
      const artifacts = this.angularFireStore.collection(`kingdoms/wS6oK6Epj3XvavWFtngLZkgFx263/artifacts`);
      this.kingdomArtifacts.forEach(kingdomArtifact => {
        refs.push({ ref: artifacts.doc(kingdomArtifact.fid), assignment: AssignmentType.none });
      });
      this.attackArtifacts.forEach(attackArtifact => {
        refs.push({ ref: artifacts.doc(attackArtifact.fid), assignment: AssignmentType.attack });
      });
      this.defenseArtifacts.forEach(defenseArtifact => {
        refs.push({ ref: artifacts.doc(defenseArtifact.fid), assignment: AssignmentType.defense });
      });
      const batch = this.angularFireStore.firestore.batch();
      refs.forEach(r => batch.update(r.ref.ref, { assignment: r.assignment }))
      await batch.commit();
      this.notificationService.success('kingdom.army.success')
    } catch (error) {
      console.error(error);
      this.notificationService.error('kingdom.army.error')
    }
  }

  assignCharm($event: CdkDragDrop<any>) {
    if ($event.container.data.length < this.maximumCharms) {
      if ($event.previousContainer === $event.container) {
        moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
      } else {
        transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
      }
      this.updateCharms();
    } else {
      this.notificationService.warning('kingdom.sorcery.maximum')
    }
  }

  async updateCharms() {
    try {
      let refs = [];
      const charms = this.angularFireStore.collection(`kingdoms/wS6oK6Epj3XvavWFtngLZkgFx263/charms`);
      this.kingdomCharms.forEach(kingdomCharm => {
        refs.push({ ref: charms.doc(kingdomCharm.fid), assignment: AssignmentType.none });
      });
      this.attackCharms.forEach(attackCharm => {
        refs.push({ ref: charms.doc(attackCharm.fid), assignment: AssignmentType.attack });
      });
      this.defenseCharms.forEach(defenseCharm => {
        refs.push({ ref: charms.doc(defenseCharm.fid), assignment: AssignmentType.defense });
      });
      const batch = this.angularFireStore.firestore.batch();
      refs.forEach(r => batch.update(r.ref.ref, { assignment: r.assignment }))
      await batch.commit();
      this.notificationService.success('kingdom.sorcery.success')
    } catch (error) {
      console.error(error);
      this.notificationService.error('kingdom.sorcery.error')
    }
  }

  openResearchDialog(charm: any): void {
    const dialogRef = this.dialog.open(ResearchComponent, {
      width: '300px',
      data: charm
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.angularFireStore.collection(`kingdoms/wS6oK6Epj3XvavWFtngLZkgFx263/charms/`).doc(charm.fid).update({ turns: result });
      }
    })
  }

}
