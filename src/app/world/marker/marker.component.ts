import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-marker',
  templateUrl: './marker.component.html',
  styleUrls: ['./marker.component.scss']
})
export class MarkerComponent implements OnInit {

  data: any = null;

  constructor() { }

  ngOnInit(): void {
    console.log(this.data);
  }

}
