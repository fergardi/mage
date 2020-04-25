import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-marker',
  templateUrl: './marker.component.html',
  styleUrls: ['./marker.component.scss']
})
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
    this.firebaseService.leftJoin(`shops/${this.data.fid}/contracts`, 'heroes', 'id', 'id').subscribe(contracts => {
      this.shopContracts = contracts;
    });
    this.firebaseService.leftJoin(`shops/${this.data.fid}/troops`, 'units', 'id', 'id').subscribe(troops => {
      this.shopTroops = troops;
    });
    this.firebaseService.leftJoin(`shops/${this.data.fid}/artifacts`, 'items', 'id', 'id').subscribe(artifacts => {
      this.shopArtifacts = artifacts;
    });
    this.firebaseService.leftJoin(`shops/${this.data.fid}/charms`, 'spells', 'id', 'id').subscribe(charms => {
      this.shopCharms = charms;
    });
    // kingdom
    this.firebaseService.leftJoin(`kingdoms/${this.data.fid}/troops`, 'units', 'id', 'id').subscribe(troops => {
      this.kingdomTroops = troops;
    });
    // artifact
    this.firebaseService.leftJoin(`artifacts/${this.data.fid}/rewards`, 'resources', 'id', 'id').subscribe(rewards => {
      this.artifactRewards = rewards;
    });
    // quest
    this.firebaseService.leftJoin(`quests/${this.data.fid}/troops`, 'units', 'id', 'id').subscribe(troops => {
      this.questTroops = troops;
    });
    this.firebaseService.leftJoin(`quests/${this.data.fid}/rewards`, 'resources', 'id', 'id').subscribe(rewards => {
      this.questRewards = rewards;
    });
    this.firebaseService.leftJoin(`quests/${this.data.fid}/contracts`, 'heroes', 'id', 'id').subscribe(contracts => {
      this.questContracts = contracts;
    });
    this.firebaseService.leftJoin(`quests/${this.data.fid}/artifacts`, 'items', 'id', 'id').subscribe(artifacts => {
      this.questArtifacts = artifacts;
    });
  }

}
