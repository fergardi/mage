import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BattleComponent } from './battle.component';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { NotificationServiceStub, StoreStub, MatDialogRefStub, ApiServiceStub, CacheServiceStub } from 'src/stubs';
import { Store } from '@ngxs/store';
import { CacheService } from 'src/app/services/cache.service';
import { ApiService } from 'src/app/services/api.service';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Attack, Faction, Kingdom, Supply } from 'src/app/shared/type/interface.model';
import { FactionType } from 'src/app/shared/type/enum.type';

describe('BattleComponent', () => {
  let component: BattleComponent;
  let fixture: ComponentFixture<BattleComponent>;
  const faction: Faction = {
    type: undefined,
    subtype: null,
    name: undefined,
    description: undefined,
    image: undefined,
    marker: undefined,
    opposites: [],
    adjacents: [],
    id: FactionType.BLACK,
  };
  const attack: Attack = {
    type: '',
    subtype: '',
    id: '',
    faction: faction,
    name: '',
    description: '',
    image: ''
  }
  const kingdom: Kingdom = {
    fid: 'test',
    faction: faction,
    name: 'test',
    artifacts: [],
    buildings: [],
    charms: [],
    supplies: [],
    troops: [],
    clan: undefined,
    coordinates: undefined,
    guild: undefined,
    attacked: null,
    guilded: null,
    id: '',
    position: undefined,
    power: 0,
    tree: undefined,
  };
  const turn: Supply = {
    balance: 0,
    id: '',
    max: 0,
    quantity: 0,
    resource: undefined,
    timestamp: null,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatBadgeModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        BrowserAnimationsModule,
        MatListModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [
        BattleComponent,
        LongPipe,
        IconPipe,
      ],
      providers: [
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: CacheService, useValue: CacheServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: kingdom },
        { provide: MatDialogRef, useValue: MatDialogRefStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BattleComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    component.attack = attack;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should ATTACK another kingdom with ENOUGH TURNS', async () => {
    turn.quantity = component.BATTLE_TURNS;
    component.kingdomTurn = turn;
    await component.battle();
  });

  it('should NOT ATTACK another kingdom with NOT ENOUGH TURNS', async () => {
    turn.quantity = 0;
    component.kingdomTurn = turn;
    await component.battle();
  });

});
