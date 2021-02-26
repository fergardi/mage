import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ExploreComponent } from './explore.component';
import { ApiService } from 'src/app/services/api.service';
import { ApiServiceStub, NotificationServiceStub, DialogRefStub, StoreStub } from 'src/stubs';
import { NotificationService } from 'src/app/services/notification.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatBadgeModule } from '@angular/material/badge';

describe('ExploreComponent', () => {
  let component: ExploreComponent;
  let fixture: ComponentFixture<ExploreComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatListModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatBadgeModule,
      ],
      declarations: [
        ExploreComponent,
        LongPipe,
      ],
      providers: [
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    Object.defineProperty(component, 'land$', { writable: true });
    Object.defineProperty(component, 'turn$', { writable: true });
    component.land$ = of({ quantity: 1000 });
    component.turn$ = of({ quantity: 1000 });
    fixture.detectChanges();
  });

  it('should CREATE', () => {
    expect(component).toBeTruthy();
  });

  it('should TAX some TURNS', async () => {
    component.form.patchValue({ turns: component.kingdomTurn.quantity });
    component.form.updateValueAndValidity();
    await component.explore();
    expect(component.form.valid).toBeTrue();
  });

  it('should NOT TAX some TURNS', async () => {
    component.form.patchValue({ turns: component.kingdomTurn.quantity + 1 });
    component.form.updateValueAndValidity();
    await component.explore();
    expect(component.form.valid).toBeFalse();
  });

});
