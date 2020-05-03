import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
//import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseService } from 'src/app/services/firebase.service';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSelectChange } from '@angular/material/select';

export enum TomeType {
  'any', 'spell', 'summon', 'enchantment', 'battle', 'unit', 'hero', 'god', 'structure', 'item', 'resource', 'location'
}

@Component({
  selector: 'app-encyclopedia',
  templateUrl: './encyclopedia.component.html',
  styleUrls: ['./encyclopedia.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
//@UntilDestroy()
export class EncyclopediaComponent implements OnInit {

  search: string = '';
  types = TomeType;
  type: TomeType = TomeType.any;
  columns: string[] = ['name', 'type', 'faction'];
  data: MatTableDataSource<any> = null;

  constructor(
    private firebaseService: FirebaseService,
  ) { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit() {
    combineLatest([
      this.firebaseService.leftJoin('spells', 'factions', 'faction', 'id'),
      this.firebaseService.leftJoin('units', 'factions', 'faction', 'id'),
      this.firebaseService.leftJoin('gods', 'factions', 'faction', 'id'),
      this.firebaseService.leftJoin('items', 'factions', 'faction', 'id'),
      this.firebaseService.leftJoin('structures', 'factions', 'faction', 'id'),
      this.firebaseService.leftJoin('resources', 'factions', 'faction', 'id'),
      this.firebaseService.leftJoin('locations', 'factions', 'faction', 'id'),
    ])
    .pipe(
      map(([
        spells,
        units,
        gods,
        items,
        structures,
        resources,
        locations,
      ]) => {
        return [
          ...spells,
          ...units,
          ...gods,
          ...items,
          ...structures,
          ...resources,
          ...locations,
        ]
      }
    ))
    //.pipe(untilDestroyed(this))
    .subscribe(data => {
      this.data = new MatTableDataSource(data);
      this.data.paginator = this.paginator;
      this.data.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.data.filter = filterValue.trim().toLowerCase();
  }

}
