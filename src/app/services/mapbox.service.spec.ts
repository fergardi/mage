import { TestBed } from '@angular/core/testing';
import { MapboxService } from './mapbox.service';
import { ComponentService } from './component.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngxs/store';
import { RandomService } from './random.service';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { AngularFirestoreStub, StoreStub, ApiServiceStub, NotificationServiceStub } from 'src/stubs';

describe('MapboxService', () => {
  let service: MapboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ComponentService,
        RandomService,
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: Store, useValue: StoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
      ],
    });
    service = TestBed.inject(MapboxService);
  });

  it('should CREATE the INSTANCE', () => {
    expect(service).toBeTruthy();
  });
});
