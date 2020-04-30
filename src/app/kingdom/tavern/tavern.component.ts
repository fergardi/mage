import { Component, OnInit } from '@angular/core';
import { first, take } from 'rxjs/operators';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AngularFirestore } from '@angular/fire/firestore';
import { NotificationService } from 'src/app/services/notification.service';
import { fadeInOnEnterAnimation } from 'angular-animations';

@Component({
  selector: 'app-tavern',
  templateUrl: './tavern.component.html',
  styleUrls: ['./tavern.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class TavernComponent implements OnInit {

  kingdomArtifacts: any[] = [];
  kingdomContracts: any[] = [];
  maximumArtifacts: number = 1;

  constructor(
    private firebaseService: FirebaseService,
    private angularFireAuth: AngularFireAuth,
    private angularFirestore: AngularFirestore,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.angularFireAuth.authState.pipe(take(1), untilDestroyed(this)).subscribe(user => {
      this.firebaseService.leftJoin(`kingdoms/${user.uid}/artifacts`, 'items', 'id', 'id').pipe(untilDestroyed(this)).subscribe(artifacts => {
        this.kingdomArtifacts = artifacts.filter(artifact => artifact.join.hero && !artifact.contract);
        this.firebaseService.leftJoin(`kingdoms/${user.uid}/contracts`, 'heroes', 'id', 'id').pipe(untilDestroyed(this)).subscribe(contracts => {
          this.kingdomContracts = contracts.map(contract => {
            return {
              ...contract,
              contractArtifacts: artifacts.filter(artifact => artifact.join.hero && artifact.contract === contract.fid)
            }
          });
        });
      });
    });
  }

  assignArtifact($event: CdkDragDrop<any>) {
    if ($event.previousContainer === $event.container) {
      moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
    } else {
      if ($event.container.data.length < this.maximumArtifacts) {
        transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
        this.angularFireAuth.authState.pipe(take(1), untilDestroyed(this)).subscribe(async user => {
          try {
            await this.angularFirestore.collection(`kingdoms/${user.uid}/artifacts`)
              .doc($event.item.element.nativeElement.id)
              .update({ contract: $event.container.id === 'kingdom-tavern' ? null : $event.container.id });
            this.notificationService.success('kingdom.tavern.success')
          } catch(error) {
            console.error(error);
            this.notificationService.error('kingdom.tavern.error')
          }
        })
      } else {
        this.notificationService.warning('kingdom.tavern.maximum')
      }
    }
  }

}
