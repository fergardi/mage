import { Injectable } from '@angular/core';
import { AngularFirestore, QueryFn } from '@angular/fire/firestore';
import { map, first } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Query {
  collection: string
  id: string
  function: QueryFn
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private angularFirestore: AngularFirestore,
    private httpClient: HttpClient,
  ) { }

  leftJoin(left: string, right: string, from: string = 'id', to: string = 'id') {
    return combineLatest([
      this.angularFirestore.collection<any>(left).valueChanges({ idField: 'fid' }),
      this.angularFirestore.collection<any>(right).valueChanges(),
    ]).pipe(
      map(([
        leftCollection,
        rightCollection,
      ]) => {
        return leftCollection.map(leftElement => {
          return {
            ...leftElement,
            join: rightCollection.find(rightElement => leftElement[from] === rightElement[to])
          }
        })
      })
    )
  }

  retrieveElementFromPath(path: string) {
    return this.angularFirestore.doc<any>(path).get();
  }

  addElementToCollection(collection: string, element: any, id?: string) {
    return id
    ? this.angularFirestore.collection<any>(collection).doc<any>(id).set(element)
    : this.angularFirestore.collection<any>(collection).add(element);
  }

  delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  addElementsToCollection(collection: string, elements: any[], master: boolean = false) {
    elements.forEach(async (element, index) => {
      await this.delay(index * 500);
      await this.addElementToCollection(collection, element, master ? element.id : null);
    })
  }

  importCollectionFromJson(collection: string) {
    this.httpClient.get<any[]>(`assets/fixtures/${collection}.json`).pipe(first()).subscribe(elements => {
      this.addElementsToCollection(collection, elements, true);
    });
  }

}
