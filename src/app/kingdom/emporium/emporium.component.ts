import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { CacheService } from 'src/app/services/cache.service';
import { MatDialog } from '@angular/material/dialog';
import { BuyComponent } from './buy.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { NotificationService } from 'src/app/services/notification.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';

@Component({
  selector: 'app-emporium',
  templateUrl: './emporium.component.html',
  styleUrls: ['./emporium.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
export class EmporiumComponent implements OnInit {

  uid: string = null;
  emporiumItems: any[] = [];
  emporiumPacks: any[] = [];

  constructor(
    private cacheService: CacheService,
    private angularFirestore: AngularFirestore,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private store: Store,
  ) { }

  async ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    let items = await this.cacheService.getItems();
    this.emporiumItems = items.filter((item: any) => item.gems > 0);
    let packs = await this.cacheService.getPacks();
    this.emporiumPacks = packs;
  }

  openBuyDialog(item: any) {
    const dialogRef = this.dialog.open(BuyComponent, {
      panelClass: 'dialog-responsive',
      data: item,
    });
    dialogRef.afterClosed().subscribe((id: string) => {
      if (id) {
        let gem = this.store.selectSnapshot(AuthState.getKingdomGem);
        if (item.gems <= gem.quantity) {
          this.angularFirestore.collection<any>(`kingdoms/${this.uid}/artifacts`, ref => ref.where('id', '==', id)).get().subscribe(async snapshot => {
            const batch = this.angularFirestore.firestore.batch();
            batch.update(this.angularFirestore.doc<any>(`kingdoms/${this.uid}/supplies/${gem.fid}`).ref, { quantity: firestore.FieldValue.increment(-item.gems) });
            if (snapshot.docs && snapshot.docs.length) {
              batch.update(this.angularFirestore.doc<any>(`kingdoms/${this.uid}/artifacts/${snapshot.docs[0].id}`).ref, { quantity: firestore.FieldValue.increment(1) });
            } else {
              batch.set(this.angularFirestore.collection<any>(`kingdoms/${this.uid}/artifacts`).doc().ref, { id: id, quantity: 1, assignment: 0 });
            }
            await batch.commit();
            this.notificationService.success('kingdom.emporium.success');
          });
        } else {
          this.notificationService.success('kingdom.emporium.error');
        }
      }
    });
  }

}
