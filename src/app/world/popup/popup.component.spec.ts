import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PopupComponent, ConfirmType } from './popup.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { FirebaseServiceStub, MatDialogStub } from 'src/stubs';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { PopupType } from 'src/app/shared/type/common.type';
import { ConfirmComponent } from './confirm.component';

describe('PopupComponent', () => {
  let component: PopupComponent;
  let fixture: ComponentFixture<PopupComponent>;
  const data: any = {
    type: PopupType.KINGDOM,
    join: {
      name: 'test',
      description: 'test',
      image: 'assets/images/factions/black.png',
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatCardModule,
      ],
      declarations: [
        PopupComponent,
      ],
      providers: [
        { provide: FirebaseService, useValue: FirebaseServiceStub },
        { provide: MatDialog, useValue: MatDialogStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should CREATE the INSTANCE as KINGDOM popup', () => {
    const kingdom: any = {
      type: PopupType.KINGDOM,
      join: {
        name: 'test',
        description: 'test',
        image: 'assets/images/factions/black.png',
      },
    };
    fixture = TestBed.createComponent(PopupComponent);
    component = fixture.componentInstance;
    component.data = kingdom;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.data.type).toBe(PopupType.KINGDOM);
  });

  it('should CREATE the INSTANCE as SHOP popup', () => {
    const shop: any = {
      type: PopupType.SHOP,
      join: {
        name: 'test',
        description: 'test',
        image: 'assets/images/stores/inn.png',
      },
    };
    fixture = TestBed.createComponent(PopupComponent);
    component = fixture.componentInstance;
    component.data = shop;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.data.type).toBe(PopupType.SHOP);
  });

  it('should CREATE the INSTANCE as QUEST popup', () => {
    const quest: any = {
      type: PopupType.QUEST,
      join: {
        name: 'test',
        description: 'test',
        image: 'assets/images/locations/volcano.png',
      },
    };
    fixture = TestBed.createComponent(PopupComponent);
    component = fixture.componentInstance;
    component.data = quest;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.data.type).toBe(PopupType.QUEST);
  });

  it('should OPEN the CONFIRM dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openConfirmDialog(null, ConfirmType.charm);
    expect(MatDialogStub.open).toHaveBeenCalledWith(ConfirmComponent, { panelClass: 'dialog-responsive', data: { object: null, type: ConfirmType.charm } });
  });

});
