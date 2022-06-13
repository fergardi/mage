import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoundationComponent } from './foundation.component';
import { LoadingService } from 'src/app/services/loading.service';
import { LoadingServiceStub, StoreStub, NotificationServiceStub, MatDialogRefStub, ApiServiceStub } from 'src/stubs';
import { Store } from '@ngxs/store';
import { NotificationService } from 'src/app/services/notification.service';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Clan } from 'src/app/shared/type/interface.model';

describe('FoundationComponent', () => {
  let component: FoundationComponent;
  let fixture: ComponentFixture<FoundationComponent>;
  const clan: Clan = {
    name: 'test',
    description: 'test',
    image: 'test',
    members: [],
    leader: undefined,
    power: 0
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatFormFieldModule,
        ReactiveFormsModule,
        FormsModule,
        MatSelectModule,
        MatListModule,
        MatChipsModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
      declarations: [
        FoundationComponent,
        LongPipe,
      ],
      providers: [
        FormBuilder,
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: LoadingService, useValue: LoadingServiceStub },
        { provide: MatDialogRef, useValue: MatDialogRefStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FoundationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should FOUNDATE a CLAN', async () => {
    component.kingdomGold.quantity = component.CLAN_COST;
    component.form.patchValue(clan);
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'foundateClan');
    await component.foundation();
    expect(ApiServiceStub.foundateClan).toHaveBeenCalledWith(component.uid, clan.name, clan.description, clan.image);
  });

  it('should NOT FOUNDATE a CLAN', async () => {
    component.kingdomGold.quantity = 0;
    component.form.patchValue(clan);
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'foundateClan');
    await component.foundation();
    expect(ApiServiceStub.foundateClan).not.toHaveBeenCalled();
  });

  it('should NOT FOUNDATE a CLAN and CATCH the ERROR', async () => {
    component.kingdomGold.quantity = component.CLAN_COST;
    component.form.patchValue(clan);
    component.form.updateValueAndValidity();
    spyOn(ApiServiceStub, 'foundateClan').and.throwError(new Error('test'));
    await component.foundation();
    expect(ApiServiceStub.foundateClan).toThrowError('test');
  });

});
