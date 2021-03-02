import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DischargeComponent } from './discharge.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogRefStub } from 'src/stubs';
import { TranslateModule } from '@ngx-translate/core';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';

describe('DischargeComponent', () => {
  let component: DischargeComponent;
  let fixture: ComponentFixture<DischargeComponent>;
  const contract: any = {
    join: {
      name: 'test',
      description: 'test',
      faction: 'red',
      image: 'assets/images/heroes/red/dragon-rider.png',
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatListModule,
        MatBadgeModule,
        MatButtonModule,
      ],
      declarations: [
        DischargeComponent,
        LegendaryPipe,
        IconPipe,
      ],
      providers: [
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: contract },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DischargeComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });
});
