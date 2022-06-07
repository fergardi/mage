import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { MapboxService } from './mapbox.service';
import { ComponentService } from './component.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngxs/store';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { AngularFirestoreStub, StoreStub, ApiServiceStub, NotificationServiceStub, MatDialogStub } from 'src/stubs';
import * as mapboxgl from 'mapbox-gl';
import { Component } from '@angular/core';
import { MarkerType } from '../shared/type/enum.type';
import { MatDialog } from '@angular/material/dialog';

@Component({
  template: `
    <div id="map" class="map-container"></div>
  `,
  styles: [`
    .map-container {
      height: 500px;
      width: 500px;
      overflow: hidden;
      position: relative;
    }
  `],
})
class TestComponent {
}

describe('MapboxService', () => {
  let service: MapboxService;
  let container: HTMLElement;
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  const data = {
    id: 'test',
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    power: 1000,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
      ],
      providers: [
        ComponentService,
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: Store, useValue: StoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
      ],
    })
    .compileComponents();
    service = TestBed.inject(MapboxService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    container = document.getElementById('map');
  });

  it('should CREATE the INSTANCE', () => {
    expect(service).toBeTruthy();
  });

  it('should INITIALIZE the MAP', () => {
    service.initialize(container);
    expect(service.map).toBeInstanceOf(mapboxgl.Map);
  });

  it('should ADD a MARKER', () => {
    service.initialize(container);
    expect(service.markers.length).toBe(0);
    const marker = service.addMarker(data, MarkerType.KINGDOM, true, true);
    expect(marker).toBeInstanceOf(mapboxgl.Marker);
    expect(service.markers.length).toBe(1);
    spyOn(marker.getPopup(), 'setDOMContent');
    marker.togglePopup();
    expect(marker.getPopup().setDOMContent).toHaveBeenCalledWith(jasmine.any(HTMLDivElement));
    marker.togglePopup();
    expect(marker.getPopup().setDOMContent).toHaveBeenCalledWith(jasmine.any(HTMLDivElement));
  });

  it('should REMOVE a MARKER', () => {
    service.initialize(container);
    expect(service.markers.length).toBe(0);
    service.addMarker(data, MarkerType.KINGDOM, false, false);
    expect(service.markers.length).toBe(1);
    service.removeMarker(data.id);
    expect(service.markers.length).toBe(0);
  });

  it('should CLEAR the MARKERS', () => {
    service.initialize(container);
    expect(service.markers.length).toBe(0);
    service.addMarker(data, MarkerType.KINGDOM, false, false);
    expect(service.markers.length).toBe(1);
    service.clearMarkers();
    expect(service.markers.length).toBe(0);
  });

  it('should REFRESH the MARKERS', () => {
    service.initialize(container);
    service.addMarker(data, MarkerType.KINGDOM, false, false);
    service.refreshMarkers();
    expect(service.markers[0].marker.getElement().style.display).toBe('none');
  });

  it('should RESIZE the MAP', () => {
    service.initialize(container);
    spyOn(service.map, 'resize');
    service.resizeMap();
    expect(service.map.resize).toHaveBeenCalled();
  });

  it('should VIEW the MARKER', () => {
    service.initialize(container);
    service.addMarker(data, MarkerType.KINGDOM, false, false);
    expect(service.markerVisible(service.markers[0])).toBe(false);
  });

  it('should TERMINALIZE the MAP', () => {
    service.initialize(container);
    expect(service.map).toBeInstanceOf(mapboxgl.Map);
    service.terminalize();
    expect(service.map).toBe(null);
  });

});
