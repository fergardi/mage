import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AngularFirestore } from '@angular/fire/firestore';
import { NotificationService } from 'src/app/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ResearchComponent } from './research.component';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ConjureComponent } from './conjure.component';
import { ActivateComponent } from './activate.component';

enum AssignmentType {
  'artifactNone', 'artifactAttack', 'artifactDefense', 'charmNone', 'charmAttack', 'charmDefense'
}

@Component({
  selector: 'app-sorcery',
  templateUrl: './sorcery.component.html',
  styleUrls: ['./sorcery.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class SorceryComponent implements OnInit {

  uid: string = null;

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
    private angularFirestore: AngularFirestore,
    private notificationService: NotificationService,
    public dialog: MatDialog,
    private store: Store,
  ) { }

  ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.firebaseService.leftJoin(`kingdoms/${this.uid}/artifacts`, 'items', 'id', 'id').pipe(untilDestroyed(this)).subscribe(artifacts => {
      this.kingdomArtifacts = artifacts.filter(artifact => artifact.assignment === AssignmentType.artifactNone || !artifact.assignment).sort((a, b) => {
        return a.join.battle === b.join.battle
          ? 0
          : a.join.battle
            ? -1
            : 1
      });
      this.attackArtifacts = artifacts.filter(artifact => artifact.assignment === AssignmentType.artifactAttack);
      this.defenseArtifacts = artifacts.filter(artifact => artifact.assignment === AssignmentType.artifactDefense);
    });
    this.firebaseService.leftJoin(`kingdoms/${this.uid}/charms`, 'spells', 'id', 'id').pipe(untilDestroyed(this)).subscribe(charms => {
      this.kingdomCharms = charms.filter(charm => charm.assignment === AssignmentType.charmNone || !charm.assignment).sort((a, b) => {
        return (a.turns >= a.join.research) === (b.turns >= b.join.research)
          ? 0
          : (a.turns >= a.join.research)
            ? -1
            : 1
      });
      this.attackCharms = charms.filter(charm => charm.assignment === AssignmentType.charmAttack);
      this.defenseCharms = charms.filter(charm => charm.assignment === AssignmentType.charmDefense);
    });
  }

  assignArtifact($event: CdkDragDrop<any>) {
    if ([0,3].includes(parseInt($event.container.id)) || $event.container.data.length < this.maximumArtifacts) {
      if ($event.previousContainer === $event.container) {
        moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
      } else {
        transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
      }
      this.angularFirestore.collection(`kingdoms/${this.uid}/artifacts`).doc($event.item.element.nativeElement.id).update({ assignment: parseInt($event.container.id) });
      this.notificationService.success('kingdom.sorcery.success');
    } else {
      this.notificationService.warning('kingdom.sorcery.maximum');
    }
  }

  assignCharm($event: CdkDragDrop<any>) {
    if ([1,4].includes(parseInt($event.container.id)) || $event.container.data.length < this.maximumCharms) {
      if ($event.previousContainer === $event.container) {
        moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
      } else {
        transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
      }
      this.angularFirestore.collection(`kingdoms/${this.uid}/charms`).doc($event.item.element.nativeElement.id).update({ assignment: parseInt($event.container.id) });
      this.notificationService.success('kingdom.sorcery.success');
    } else {
      this.notificationService.warning('kingdom.sorcery.maximum')
    }
  }

  openResearchDialog(charm: any): void {
    const dialogRef = this.dialog.open(ResearchComponent, {
      minWidth: '30%',
      maxWidth: '30%',
      data: charm
    });
  }

  openConjureDialog(charm: any): void {
    const dialogRef = this.dialog.open(ConjureComponent, {
      minWidth: '30%',
      maxWidth: '30%',
      data: charm
    });
  }

  openActivateDialog(artifact: any): void {
    const dialogRef = this.dialog.open(ActivateComponent, {
      minWidth: '30%',
      maxWidth: '30%',
      data: artifact
    });
  }

}
