import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NotificationService } from 'src/app/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ResearchComponent } from './research.component';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { ConjureComponent } from './conjure.component';
import { ActivateComponent } from './activate.component';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';
import { TutorialService } from 'src/app/services/tutorial.service';
import { combineLatest } from 'rxjs';
import { Artifact, Charm } from 'src/app/shared/type/interface.model';
import { AssignmentType } from 'src/app/shared/type/enum.type';

const MAXIMUM_ARTIFACTS = 1;
const MAXIMUM_CHARMS = 1;

@Component({
  selector: 'app-sorcery',
  templateUrl: './sorcery.component.html',
  styleUrls: ['./sorcery.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class SorceryComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomArtifacts: Array<Artifact> = [];
  attackArtifacts: Array<Artifact> = [];
  defenseArtifacts: Array<Artifact> = [];
  kingdomCharms: Array<Charm> = [];
  attackCharms: Array<Charm> = [];
  defenseCharms: Array<Charm> = [];

  constructor(
    private angularFirestore: AngularFirestore,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private store: Store,
    private apiService: ApiService,
    private loadingService: LoadingService,
    public tutorialService: TutorialService,
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.angularFirestore.collection<Artifact>(`kingdoms/${this.uid}/artifacts`).valueChanges({ idField: 'fid' }),
      this.angularFirestore.collection<Charm>(`kingdoms/${this.uid}/charms`).valueChanges({ idField: 'fid' }),
    ])
    .pipe(untilDestroyed(this))
    .subscribe(([artifacts, charms]) => {
      this.kingdomArtifacts = artifacts.filter(artifact => artifact.assignment === AssignmentType.NONE || !artifact.assignment).sort((a, b) => a.item.battle === b.item.battle ? 0 : a.item.battle ? -1 : 1);
      this.attackArtifacts = artifacts.filter(artifact => artifact.assignment === AssignmentType.ATTACK);
      this.defenseArtifacts = artifacts.filter(artifact => artifact.assignment === AssignmentType.DEFENSE);
      this.kingdomCharms = charms.filter(charm => charm.assignment === AssignmentType.NONE || !charm.assignment).sort((a, b) => (a.turns >= a.spell.turnResearch) === (b.turns >= b.spell.turnResearch) ? 0 : (a.turns >= a.spell.turnResearch) ? -1 : 1);
      this.attackCharms = charms.filter(charm => charm.assignment === AssignmentType.ATTACK);
      this.defenseCharms = charms.filter(charm => charm.assignment === AssignmentType.DEFENSE);
    });
  }

  async assignArtifact($event: CdkDragDrop<Array<string>>) {
    try {
      this.loadingService.startLoading();
      if ($event.container && $event.previousContainer === $event.container) {
        moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
      } else {
        if ($event.container && (Number($event.container.id) === 0 || $event.container.data.length < MAXIMUM_ARTIFACTS)) {
          transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
          await this.apiService.assignArtifact(this.uid, $event.item.element.nativeElement.id, Number($event.container.id)); // ids 0,1,2
          this.notificationService.success('kingdom.sorcery.success');
        } else {
          this.notificationService.error('kingdom.sorcery.maximum');
        }
      }
    } catch (error) {
      this.notificationService.error('kingdom.sorcery.error', error as Error);
    } finally {
      this.loadingService.stopLoading();
    }
  }

  async assignCharm($event: CdkDragDrop<Array<string>>) {
    try {
      this.loadingService.startLoading();
      if ($event.container && $event.previousContainer === $event.container) {
        moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
      } else {
        if ($event.container && (Number($event.container.id) === 3 || $event.container.data.length < MAXIMUM_CHARMS)) {
          transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
          await this.apiService.assignCharm(this.uid, $event.item.element.nativeElement.id, Number($event.container.id) - 3); // ids 3,4,5
          this.notificationService.success('kingdom.sorcery.success');
        } else {
          this.notificationService.error('kingdom.sorcery.maximum');
        }
      }
    } catch (error) {
      this.notificationService.error('kingdom.sorcery.error', error as Error);
    } finally {
      this.loadingService.stopLoading();
    }
  }

  openResearchDialog(charm: Charm): void {
    const dialogRef = this.dialog.open(ResearchComponent, {
      panelClass: 'dialog-responsive',
      data: charm,
    });
  }

  openConjureDialog(charm: Charm): void {
    const dialogRef = this.dialog.open(ConjureComponent, {
      panelClass: 'dialog-responsive',
      data: {
        charm: charm,
        kingdom: null,
      },
    });
  }

  openActivateDialog(artifact: Artifact): void {
    const dialogRef = this.dialog.open(ActivateComponent, {
      panelClass: 'dialog-responsive',
      data: {
        artifact: artifact,
        kingdom: null,
      },
    });
  }

}
