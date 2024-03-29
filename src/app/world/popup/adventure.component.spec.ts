import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AdventureComponent } from './adventure.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRefStub, NotificationServiceStub, ApiServiceStub, StoreStub } from 'src/stubs';
import { NotificationService } from 'src/app/services/notification.service';
import { TranslateModule } from '@ngx-translate/core';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatListModule } from '@angular/material/list';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';

describe('AdventureComponent', () => {
  let component: AdventureComponent;
  let fixture: ComponentFixture<AdventureComponent>;
  const data: any = {
    reward: {
      item: {
        name: 'test',
        faction: {
          id: 'green',
        },
        image: 'assets/images/items/treasure-map.png',
      },
      quantity: 1,
    },
    quest: {
      turns: 3,
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
        AdventureComponent,
        LegendaryPipe,
        IconPipe,
        LongPipe,
      ],
      providers: [
        { provide: MatDialogRef, useValue: MatDialogRefStub },
        { provide: Store, useValue: StoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: NotificationService, useValue: NotificationServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdventureComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should START an ADVENTURE', async () => {
    spyOn(ApiServiceStub, 'adventureQuest');
    await component.adventure();
    expect(ApiServiceStub.adventureQuest).toHaveBeenCalledWith(component.uid, component.data.quest.id);
  });

  it('should NOT START an ADVENTURE', async () => {
    component.kingdomTurn.quantity = 0;
    spyOn(ApiServiceStub, 'adventureQuest');
    await component.adventure();
    expect(ApiServiceStub.adventureQuest).not.toHaveBeenCalled();
  });

});
