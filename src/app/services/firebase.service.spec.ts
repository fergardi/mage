import { TestBed } from '@angular/core/testing';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

const FirestoreStub = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
      set: (d: any) => new Promise((resolve, reject) => resolve(undefined)),
    }),
  }),
};

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AngularFirestore, useValue: FirestoreStub },
      ],
    });
    service = TestBed.inject(FirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
