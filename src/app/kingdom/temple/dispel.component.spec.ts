import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DispelComponent } from './dispel.component';
import { NotificationService } from 'src/app/services/notification.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatBadge } from '@angular/material/badge';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const NotificationServiceStub: any = {
  success: () => null,
  warning: () => null,
  error: () => null,
};

const StoreStub: any = {
  selectSnapshot: () => null,
};


describe('DispelComponent', () => {
  let component: DispelComponent;
  let fixture: ComponentFixture<DispelComponent>;
  const enchantment = {
    level: 0,
    turns: 0,
    join: {
      name: 'spell.death-decay.name',
      description: 'spell.death-decay.description',
      image: '/assets/images/spells/black/death-decay.png',
      faction: 'black',
      turnDuration: 300,
      legendary: false,
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
      ],
      declarations: [
        MatBadge,
        DispelComponent,
        LegendaryPipe,
        LongPipe,
        IconPipe,
      ],
      providers: [
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: enchantment },
        { provide: MatDialogRef, useValue: {} },
        { provide: Store, useValue: StoreStub },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
