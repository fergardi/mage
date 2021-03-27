import { TestBed } from '@angular/core/testing';
import { FirebaseService } from './firebase.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { CacheService } from './cache.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularFireAuthStub, CacheServiceStub, AngularFirestoreStub } from 'src/stubs';

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: AngularFireAuth, useValue: AngularFireAuthStub },
        { provide: CacheService, useValue: CacheServiceStub },
      ],
    });
    service = TestBed.inject(FirebaseService);
  });

  it('should CREATE the INSTANCE', () => {
    expect(service).toBeTruthy();
  });

});
