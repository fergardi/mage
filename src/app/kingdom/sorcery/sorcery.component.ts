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
import { ConjureComponent, CharmAssignmentType } from './conjure.component';
import { ActivateComponent, ArtifactAssignmentType } from './activate.component';

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
      this.kingdomArtifacts = artifacts.filter(artifact => artifact.assignment === ArtifactAssignmentType.none || !artifact.assignment).sort((a, b) => {
        return a.join.battle === b.join.battle
          ? 0
          : a.join.battle
            ? -1
            : 1
      });
      this.attackArtifacts = artifacts.filter(artifact => artifact.assignment === ArtifactAssignmentType.attack);
      this.defenseArtifacts = artifacts.filter(artifact => artifact.assignment === ArtifactAssignmentType.defense);
    });
    this.firebaseService.leftJoin(`kingdoms/${this.uid}/charms`, 'spells', 'id', 'id').pipe(untilDestroyed(this)).subscribe(charms => {
      this.kingdomCharms = charms.filter(charm => charm.assignment === CharmAssignmentType.none || !charm.assignment).sort((a, b) => {
        return (a.turns >= a.join.research) === (b.turns >= b.join.research)
          ? 0
          : (a.turns >= a.join.research)
            ? -1
            : 1
      });
      this.attackCharms = charms.filter(charm => charm.assignment === CharmAssignmentType.attack);
      this.defenseCharms = charms.filter(charm => charm.assignment === CharmAssignmentType.defense);
    });
  }

  async assignArtifact($event: CdkDragDrop<any>) {
    if ($event.previousContainer === $event.container) {
      moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
    } else {
      if (parseInt($event.container.id) === 0 || $event.container.data.length < this.maximumArtifacts) {
        transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
        await this.angularFirestore.collection(`kingdoms/${this.uid}/artifacts`).doc($event.item.element.nativeElement.id).update({ assignment: parseInt($event.container.id) });
        this.notificationService.success('kingdom.sorcery.success');
      } else {
        this.notificationService.error('kingdom.sorcery.maximum');
      }
    }
  }

  async assignCharm($event: CdkDragDrop<any>) {
    if ($event.previousContainer === $event.container) {
      moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
    } else {
      if (parseInt($event.container.id) === 3 || $event.container.data.length < this.maximumCharms) {
        transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
        await this.angularFirestore.collection(`kingdoms/${this.uid}/charms`).doc($event.item.element.nativeElement.id).update({ assignment: parseInt($event.container.id) });
        this.notificationService.success('kingdom.sorcery.success');
      } else {
        this.notificationService.error('kingdom.sorcery.maximum')
      }
    }
  }

  openResearchDialog(charm: any): void {
    const dialogRef = this.dialog.open(ResearchComponent, {
      panelClass: 'dialog-responsive',
      data: charm
    });
  }

  openConjureDialog(charm: any): void {
    const dialogRef = this.dialog.open(ConjureComponent, {
      panelClass: 'dialog-responsive',
      data: charm
    });
  }

  openActivateDialog(artifact: any): void {
    const dialogRef = this.dialog.open(ActivateComponent, {
      panelClass: 'dialog-responsive',
      data: artifact
    });
  }

}
