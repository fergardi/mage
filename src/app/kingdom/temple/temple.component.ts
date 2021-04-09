import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatDialog } from '@angular/material/dialog';
import { OfferComponent } from './offer.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { DispelComponent } from './dispel.component';

@Component({
  selector: 'app-temple',
  templateUrl: './temple.component.html',
  styleUrls: ['./temple.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class TempleComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomGods: any[] = [];
  kingdomEnchantments: any[] = [];
  kingdomIncantations: any[] = [];

  constructor(
    private angularFirestore: AngularFirestore,
    private dialog: MatDialog,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.angularFirestore.collection<any>('gods').valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(gods => {
      this.kingdomGods = gods;
    });
    this.angularFirestore.collection<any>(`kingdoms/${this.uid}/enchantments`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(enchantments => {
      this.kingdomEnchantments = enchantments.sort((a, b) => a.turns - b.turns);
    });
    this.angularFirestore.collection<any>(`kingdoms/${this.uid}/incantations`).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(incantations => {
      this.kingdomIncantations = incantations.sort((a, b) => a.turns - b.turns);
    });
  }

  openOfferDialog(god: any): void {
    const dialogRef = this.dialog.open(OfferComponent, {
      panelClass: 'dialog-responsive',
      data: god,
    });
  }

  openDispelDialog(enchantment: any): void {
    const dialogRef = this.dialog.open(DispelComponent, {
      panelClass: 'dialog-responsive',
      data: enchantment,
    });
  }

  openBreakDialog(incantation: any): void {
    const dialogRef = this.dialog.open(DispelComponent, {
      panelClass: 'dialog-responsive',
      data: incantation,
    });
  }

}
