import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, first } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private angularFirestore: AngularFirestore,
    private httpClient: HttpClient,
  ) { }

  leftJoin(left: string, right: string, from: string = 'id', to: string = 'id') {
    console.log(`Joining query {${left}}[${from}] with {${right}}[${to}]...`);
    return combineLatest([
      this.angularFirestore.collection<any>(left).valueChanges(),
      this.angularFirestore.collection<any>(right).valueChanges(),
    ]).pipe(
      map(([
        leftCollection,
        rightCollection,
      ]) => {
        return leftCollection.map(leftElement => {
          return {
            ...leftElement,
            ...rightCollection.find(rightElement => {
              return leftElement[from] === rightElement[to]
            })
          }
        })
      })
    )
  }

  retrieveElement(path: string) {
    return this.angularFirestore.doc<any>(path).get();
  }

  saveElement(collection: string, element: any, id?:string) {
    return id
      ? this.angularFirestore.collection<any>(collection).doc<any>(id).set(element)
      : this.angularFirestore.collection<any>(collection).add(element);
  }

  importCollection(collection: string) {
    return this.httpClient.get<any[]>(`assets/fixtures/${collection}.json`).pipe(first()).subscribe(data => {
      data.forEach(element => {
        return this.saveElement(collection, element, element.id);
      })
    });
  }

}
