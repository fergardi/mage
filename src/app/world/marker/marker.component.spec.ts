import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MarkerComponent } from './marker.component';
import { MarkerType } from 'src/app/shared/type/common.type';

describe('MarkerComponent', () => {
  let component: MarkerComponent;
  let fixture: ComponentFixture<MarkerComponent>;
  const data: any = {
    type: MarkerType.KINGDOM,
    join: {
      image: '',
    },
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
    component.data = data;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

});
