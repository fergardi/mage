import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-emporium',
  templateUrl: './emporium.component.html',
  styleUrls: ['./emporium.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class EmporiumComponent implements OnInit {

  uid: string = null;
  emporiumArtifacts: any[] = [];
  emporiumPacks: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private store: Store,
  ) {}

  ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.firebaseService.leftJoin(`kingdoms/${this.uid}/artifacts`, 'items', 'id', 'id').pipe(untilDestroyed(this)).subscribe(artifacts => {
      this.emporiumArtifacts = artifacts;
    });
    this.emporiumPacks = [{
      quantity: 10,
      name: 'Cafe',
      description: 'lol',
      money: '0.99€'
    }]
  }

}
