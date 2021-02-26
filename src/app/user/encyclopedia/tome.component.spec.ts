import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TomeComponent } from './tome.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DialogRefStub } from 'src/stubs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

describe('TomeComponent', () => {
  let component: TomeComponent;
  let fixture: ComponentFixture<TomeComponent>;
  const tome: object = {
    type: 'god',
    id: 'death',
    name: 'god.death.name',
    description: 'god.death.description',
    image: '/assets/images/gods/death.png',
    faction: 'black',
    legendary: true,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatListModule,
        MatButtonModule,
        MatChipsModule,
        MatDialogModule,
        MatBadgeModule,
      ],
      declarations: [
        LegendaryPipe,
        TomeComponent,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: tome },
        { provide: MatDialogRef, useValue: DialogRefStub },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TomeComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE', () => {
    expect(component).toBeTruthy();
  });
});
