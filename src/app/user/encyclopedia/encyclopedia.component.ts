import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseService } from 'src/app/services/firebase.service';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { combineLatest, pipe, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export enum TomeType {
  'spell', 'unit', 'hero', 'god', 'structure'
}

@Component({
  selector: 'app-encyclopedia',
  templateUrl: './encyclopedia.component.html',
  styleUrls: ['./encyclopedia.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class EncyclopediaComponent implements OnInit {

  columns = ['name', 'type', 'faction'];
  data: MatTableDataSource<any> = null;

  constructor(
    private firebaseService: FirebaseService,
  ) { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit() {
    combineLatest([
      this.firebaseService.leftJoin('spells', 'factions', 'faction', 'id'),
      this.firebaseService.leftJoin('structures', 'factions', 'faction', 'id'),
    ]).pipe(
      untilDestroyed(this),
      map(([
        spells,
        structures,
      ]) => {
        console.log(spells, structures)
        return [
          ...spells.map(spell => { return { ...spell, type: TomeType.spell } }),
          ...structures.map(structure => { return { ...structure, type: TomeType.structure } }),
        ];
      }
    ))
    .subscribe(data => {
      console.log(data)
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
