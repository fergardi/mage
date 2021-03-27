import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EncyclopediaComponent } from './encyclopedia.component';
import { CacheServiceStub, MatDialogStub } from 'src/stubs';
import { CacheService } from 'src/app/services/cache.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TomeComponent } from './tome.component';
import { MatBadgeModule } from '@angular/material/badge';

describe('EncyclopediaComponent', () => {
  let component: EncyclopediaComponent;
  let fixture: ComponentFixture<EncyclopediaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatCardModule,
        MatTableModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatPaginatorModule,
        MatBadgeModule,
      ],
      declarations: [
        EncyclopediaComponent,
      ],
      providers: [
        { provide: CacheService, useValue: CacheServiceStub },
        { provide: MatDialog, useValue: MatDialogStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncyclopediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should OPEN the TOME dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openTomeDialog(null);
    expect(MatDialogStub.open).toHaveBeenCalledWith(TomeComponent, { panelClass: 'dialog-responsive', data: null });
  });

});
