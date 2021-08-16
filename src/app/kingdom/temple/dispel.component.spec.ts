import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DispelComponent } from './dispel.component';
import { NotificationService } from 'src/app/services/notification.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationServiceStub, StoreStub, MatDialogRefStub, ApiServiceStub } from 'src/stubs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from 'src/app/services/api.service';
import { ShortPipe } from 'src/app/pipes/short.pipe';

describe('DispelComponent', () => {
  let component: DispelComponent;
  let fixture: ComponentFixture<DispelComponent>;
  const incantation = {
    fid: 'test',
    level: 0,
    turns: 0,
    spell: {
      name: 'spell.death-decay.name',
      description: 'spell.death-decay.description',
      image: '/assets/images/spells/black/death-decay.png',
      faction: {
        id: 'black',
      },
      turnDuration: 300,
      legendary: false,
      manaCost: 1,
    },
    to: {
      id: 'test',
      faction: {
        id: 'test',
      },
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatBadgeModule,
        MatChipsModule,
        MatProgressBarModule,
        MatListModule,
        MatButtonModule,
        MatProgressBarModule,
      ],
      declarations: [
        DispelComponent,
        LegendaryPipe,
        LongPipe,
        IconPipe,
        ShortPipe,
      ],
      providers: [
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: incantation },
        { provide: MatDialogRef, useValue: MatDialogRefStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispelComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should DISPEL an INCANTATION', async () => {
    spyOn(ApiServiceStub, 'dispelIncantation');
    await component.dispel();
    expect(ApiServiceStub.dispelIncantation).toHaveBeenCalledWith(component.uid, component.incantation.fid);
  });

  it('should DISPEL an INCANTATION and CATCH the ERROR', async () => {
    spyOn(ApiServiceStub, 'dispelIncantation').and.throwError(new Error('test'));
    await component.dispel();
    expect(ApiServiceStub.dispelIncantation).toThrowError('test');
  });

  it('should NOT DISPEL an INCANTATION', async () => {
    component.incantation.spell.manaCost = 999999;
    spyOn(ApiServiceStub, 'dispelIncantation');
    await component.dispel();
    expect(ApiServiceStub.dispelIncantation).not.toHaveBeenCalled();
  });

});
