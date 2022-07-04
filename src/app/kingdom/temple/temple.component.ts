import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatDialog } from '@angular/material/dialog';
import { OfferComponent } from './offer.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { DispelComponent } from './dispel.component';
import { combineLatest } from 'rxjs';
import { TutorialService } from 'src/app/services/tutorial.service';
import { BreakComponent } from './break.component';
import { Enchantment, God, Incantation } from 'src/app/shared/type/interface.model';

@Component({
  selector: 'app-temple',
  templateUrl: './temple.component.html',
  styleUrls: ['./temple.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class TempleComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomGods: Array<God> = [];
  kingdomEnchantments: Array<Enchantment> = [];
  kingdomIncantations: Array<Incantation> = [];

  constructor(
    private angularFirestore: AngularFirestore,
    private dialog: MatDialog,
    private store: Store,
    public tutorialService: TutorialService,
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.angularFirestore.collection<God>('gods').valueChanges({ idField: 'fid' }),
      this.angularFirestore.collection<Enchantment>(`kingdoms/${this.uid}/enchantments`).valueChanges({ idField: 'fid' }),
      this.angularFirestore.collection<Incantation>(`kingdoms/${this.uid}/incantations`).valueChanges({ idField: 'fid' }),
    ])
    .pipe(untilDestroyed(this))
    .subscribe(([gods, enchantments, incantations]) => {
      this.kingdomGods = gods;
      this.kingdomEnchantments = enchantments.sort((a, b) => a.turns - b.turns);
      this.kingdomIncantations = incantations.sort((a, b) => a.turns - b.turns);
    });
  }

  openOfferDialog(god: God): void {
    const dialogRef = this.dialog.open(OfferComponent, {
      panelClass: 'dialog-responsive',
      data: god,
    });
  }

  openDispelDialog(enchantment: Enchantment): void {
    const dialogRef = this.dialog.open(DispelComponent, {
      panelClass: 'dialog-responsive',
      data: enchantment,
    });
  }

  openBreakDialog(incantation: Incantation): void {
    const dialogRef = this.dialog.open(BreakComponent, {
      panelClass: 'dialog-responsive',
      data: incantation,
    });
  }

  startTour(step: string): void {
    this.tutorialService.start(step);
  }

}
