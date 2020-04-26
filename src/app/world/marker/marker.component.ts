import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-marker',
  templateUrl: './marker.component.html',
  styleUrls: ['./marker.component.scss']
})
@UntilDestroy()
export class MarkerComponent implements OnInit {

  data: any = null;
  shopContracts: any[] = [];
  shopArtifacts: any[] = [];
  shopTroops: any[] = [];
  kingdomTroops: any[] = [];
  artifactRewards: any[] = [];
  shopCharms: any[] = [];
  questContracts: any[] = [];
  questTroops: any[] = [];
  questRewards: any[] = [];
  questArtifacts: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
  ) { }

  ngOnInit(): void {
    // shop
    this.firebaseService.leftJoin(`shops/${this.data.fid}/contracts`, 'heroes', 'id', 'id').pipe(untilDestroyed(this)).subscribe(contracts => {
      this.shopContracts = contracts;
    });
    this.firebaseService.leftJoin(`shops/${this.data.fid}/troops`, 'units', 'id', 'id').pipe(untilDestroyed(this)).subscribe(troops => {
      this.shopTroops = troops;
    });
    this.firebaseService.leftJoin(`shops/${this.data.fid}/artifacts`, 'items', 'id', 'id').pipe(untilDestroyed(this)).subscribe(artifacts => {
      this.shopArtifacts = artifacts;
    });
    this.firebaseService.leftJoin(`shops/${this.data.fid}/charms`, 'spells', 'id', 'id').pipe(untilDestroyed(this)).subscribe(charms => {
      this.shopCharms = charms;
    });
    // kingdom
    this.firebaseService.leftJoin(`kingdoms/${this.data.fid}/troops`, 'units', 'id', 'id').pipe(untilDestroyed(this)).subscribe(troops => {
      this.kingdomTroops = troops;
    });
    // artifact
    this.firebaseService.leftJoin(`artifacts/${this.data.fid}/rewards`, 'resources', 'id', 'id').pipe(untilDestroyed(this)).subscribe(rewards => {
      this.artifactRewards = rewards;
    });
    // quest
    this.firebaseService.leftJoin(`quests/${this.data.fid}/troops`, 'units', 'id', 'id').pipe(untilDestroyed(this)).subscribe(troops => {
      this.questTroops = troops;
    });
    this.firebaseService.leftJoin(`quests/${this.data.fid}/rewards`, 'resources', 'id', 'id').pipe(untilDestroyed(this)).subscribe(rewards => {
      this.questRewards = rewards;
    });
    this.firebaseService.leftJoin(`quests/${this.data.fid}/contracts`, 'heroes', 'id', 'id').pipe(untilDestroyed(this)).subscribe(contracts => {
      this.questContracts = contracts;
    });
    this.firebaseService.leftJoin(`quests/${this.data.fid}/artifacts`, 'items', 'id', 'id').pipe(untilDestroyed(this)).subscribe(artifacts => {
      this.questArtifacts = artifacts;
    });
  }

}
