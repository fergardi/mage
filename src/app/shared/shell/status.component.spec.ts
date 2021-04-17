import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusComponent } from './status.component';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { of } from 'rxjs';
import { BottomSheetRefStub } from 'src/stubs';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;
  const supplies = of([]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatListModule,
        TranslateModule.forRoot(),
      ],
      declarations: [
        StatusComponent,
      ],
      providers: [
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: supplies },
        { provide: MatBottomSheetRef, useValue: BottomSheetRefStub },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

});
