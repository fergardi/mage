import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MarkerComponent } from './marker.component';
import { FactionType, MarkerType } from 'src/app/shared/type/enum.type';
import { Faction, Marker } from 'src/app/shared/type/interface.model';

describe('MarkerComponent', () => {
  let component: MarkerComponent;
  let fixture: ComponentFixture<MarkerComponent>;
  const faction: Faction = {
    type: undefined,
    subtype: null,
    name: undefined,
    description: undefined,
    image: undefined,
    marker: undefined,
    opposites: [],
    adjacents: [],
    id: FactionType.BLACK,
  };
  const marker: Marker = {
    id: 'test',
    type: MarkerType.KINGDOM,
    marker: null,
    circle: undefined,
    faction: faction,
    store: null,
    location: null,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        MarkerComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkerComponent);
    component = fixture.componentInstance;
    component.data = marker;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

});
