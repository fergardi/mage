import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeolocationComponent } from './geolocation.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogRefStub } from 'src/stubs';
import { TranslateModule } from '@ngx-translate/core';

describe('GeolocationComponent', () => {
  let component: GeolocationComponent;
  let fixture: ComponentFixture<GeolocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
      ],
      declarations: [
        GeolocationComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: MatDialogRefStub },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeolocationComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

});
