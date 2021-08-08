import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BreakComponent } from './break.component';
import { NotificationService } from 'src/app/services/notification.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationServiceStub, StoreStub, DialogRefStub, ApiServiceStub } from 'src/stubs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from 'src/app/services/api.service';
import { ShortPipe } from 'src/app/pipes/short.pipe';

describe('BreakComponent', () => {
  let component: BreakComponent;
  let fixture: ComponentFixture<BreakComponent>;
  const enchantment = {
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
    from: {
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
        BreakComponent,
        LegendaryPipe,
        LongPipe,
        IconPipe,
        ShortPipe,
      ],
      providers: [
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: enchantment },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreakComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should BREAK an ENCHANTMENT', async () => {
    spyOn(ApiServiceStub, 'breakEnchantment');
    await component.break();
    expect(ApiServiceStub.breakEnchantment).toHaveBeenCalledWith(component.uid, component.enchantment.fid);
  });

  it('should BREAK an ENCHANTMENT and CATCH the ERROR', async () => {
    spyOn(ApiServiceStub, 'breakEnchantment').and.throwError(new Error('test'));
    await component.break();
    expect(ApiServiceStub.breakEnchantment).toThrowError('test');
  });

  it('should NOT BREAK an ENCHANTMENT', async () => {
    component.kingdomMana.quantity = 0;
    spyOn(ApiServiceStub, 'breakEnchantment');
    await component.break();
    expect(ApiServiceStub.breakEnchantment).not.toHaveBeenCalled();
  });

});
