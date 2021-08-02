import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TourComponent } from './tour.component';
import { TourService, TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { TourServiceStub } from 'src/stubs';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { IconPipe } from 'src/app/pipes/icon.pipe';

describe('TourComponent', () => {
  let component: TourComponent;
  let fixture: ComponentFixture<TourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TourMatMenuModule.forRoot(),
        MatCardModule,
        TranslateModule.forRoot(),
        MatIconModule,
      ],
      declarations: [
        TourComponent,
        IconPipe,
      ],
      providers: [
        { provide: TourService, useValue: TourServiceStub },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

});
