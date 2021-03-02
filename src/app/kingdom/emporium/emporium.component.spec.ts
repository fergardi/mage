import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EmporiumComponent } from './emporium.component';
import { CacheService } from 'src/app/services/cache.service';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { StoreStub, MatDialogStub, CacheServiceStub } from 'src/stubs';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BuyComponent } from './buy.component';

describe('EmporiumComponent', () => {
  let component: EmporiumComponent;
  let fixture: ComponentFixture<EmporiumComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatCardModule,
        MatListModule,
        BrowserAnimationsModule,
      ],
      declarations: [
        EmporiumComponent,
      ],
      providers: [
        { provide: CacheService, useValue: CacheServiceStub },
        { provide: MatDialog, useValue: MatDialogStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmporiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should OPEN the BUY dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openBuyDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(BuyComponent, { panelClass: 'dialog-responsive', data: null });
  });

});
