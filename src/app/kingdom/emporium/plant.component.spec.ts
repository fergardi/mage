import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlantComponent } from './plant.component';
import { NotificationService } from 'src/app/services/notification.service';
import { NotificationServiceStub, MatDialogRefStub, StoreStub, ApiServiceStub } from 'src/stubs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';

describe('PlantComponent', () => {
  let component: PlantComponent;
  let fixture: ComponentFixture<PlantComponent>;
  const tree: any = {
    branches: {},
    gems: 5,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatListModule,
        MatBadgeModule,
      ],
      declarations: [
        PlantComponent,
        IconPipe,
      ],
      providers: [
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: tree },
        { provide: MatDialogRef, useValue: MatDialogRefStub },
        { provide: Store, useValue: StoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should PLANT the TREE', async () => {
    spyOn(ApiServiceStub, 'plantTree');
    await component.plant();
    expect(ApiServiceStub.plantTree).toHaveBeenCalledWith(component.uid, component.tree.branches, component.tree.gems);
  });

  it('should PLANT the TREE and CATCH errors', async () => {
    spyOn(ApiServiceStub, 'plantTree').and.throwError(new Error('test'));
    await component.plant();
    expect(ApiServiceStub.plantTree).toThrowError('test');
  });

  it('should NOT PLANT the TREE', async () => {
    component.kingdomGem.quantity = 0;
    spyOn(ApiServiceStub, 'plantTree');
    await component.plant();
    expect(ApiServiceStub.plantTree).not.toHaveBeenCalled();
  });

});
