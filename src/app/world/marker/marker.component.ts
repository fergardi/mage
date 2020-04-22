import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-marker',
  templateUrl: './marker.component.html',
  styleUrls: ['./marker.component.scss']
})
export class MarkerComponent implements OnInit {

  data: any = null;
  contracts: any[] = [];
  troops: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
  ) { }

  ngOnInit(): void {
    this.firebaseService.leftJoin(`shops/${this.data.fid}/contracts`, 'heroes', 'id', 'id').subscribe(contracts => {
      this.contracts = contracts;
    });
    this.firebaseService.leftJoin(`kingdoms/${this.data.fid}/troops`, 'units', 'id', 'id').subscribe(troops => {
      this.troops = troops;
    });
  }

}
