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

  it('should JOIN two OBJECTS', () => {
    const left: any = {
      name: 'test',
      right1: 'test',
      right2: ['test'],
    };
    const right: any[] = [
      { id: 'test' },
    ];
    expect(left['join']).toEqual(undefined);
    service.joinObject(left, 'right1', right);
    service.joinObject(left, 'right2', right);
    expect(left['join']).toEqual(right[0]);
    expect(left['right2'][0]).toEqual(right[0]);
  });

  it('should SELFJOIN one OBJECT', async () => {
    const left: any = {
      faction: 'test',
    };
    await service.selfJoin(left);
    expect(left['join']).toEqual({ id: 'test', name: 'test' });
  });

});
