import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatDialog } from '@angular/material/dialog';
import { OfferComponent } from './offer.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { DispelComponent } from './dispel.component';
import { combineLatest } from 'rxjs';
import { TutorialService } from 'src/app/services/tutorial.service';

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
    public tutorialService: TutorialService,
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.angularFirestore.collection<any>('gods').valueChanges({ idField: 'fid' }),
      this.angularFirestore.collection<any>(`kingdoms/${this.uid}/enchantments`).valueChanges({ idField: 'fid' }),
      this.angularFirestore.collection<any>(`kingdoms/${this.uid}/incantations`).valueChanges({ idField: 'fid' }),
    ])
    .pipe(untilDestroyed(this))
    .subscribe(([gods, enchantments, incantations]) => {
      this.kingdomGods = gods;
      this.kingdomEnchantments = enchantments.sort((a, b) => a.turns - b.turns);
      this.kingdomIncantations = incantations.sort((a, b) => a.turns - b.turns);
      this.tutorialService.ready();
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
