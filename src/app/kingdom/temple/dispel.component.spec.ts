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
import { NotificationServiceStub, StoreStub, DialogRefStub, ApiServiceStub } from 'src/stubs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from 'src/app/services/api.service';

describe('DispelComponent', () => {
  let component: DispelComponent;
  let fixture: ComponentFixture<DispelComponent>;
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
      ],
      declarations: [
        DispelComponent,
        LegendaryPipe,
        LongPipe,
        IconPipe,
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
    fixture = TestBed.createComponent(DispelComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should DISPEL an ENCHANTMENT', async () => {
    console.log(component.enchantment.spell.manaCost, component.kingdomMana.quantity)
    spyOn(ApiServiceStub, 'dispelEnchantment');
    await component.dispel();
    expect(ApiServiceStub.dispelEnchantment).toHaveBeenCalledWith(component.uid, component.enchantment.fid);
  });

  it('should DISPEL an ENCHANTMENT and CATCH the ERROR', async () => {
    spyOn(ApiServiceStub, 'dispelEnchantment').and.throwError(new Error('test'));
    await component.dispel();
    expect(ApiServiceStub.dispelEnchantment).toThrowError('test');
  });

  it('should NOT DISPEL an ENCHANTMENT', async () => {
    component.enchantment.spell.manaCost = 999999;
    spyOn(ApiServiceStub, 'dispelEnchantment');
    await component.dispel();
    expect(ApiServiceStub.dispelEnchantment).not.toHaveBeenCalled();
  });

});
