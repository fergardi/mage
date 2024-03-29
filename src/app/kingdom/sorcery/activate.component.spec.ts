import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivateComponent } from './activate.component';
import { NotificationService } from 'src/app/services/notification.service';
import { NotificationServiceStub, MatDialogRefStub, StoreStub, ApiServiceStub, AngularFirestoreStub } from 'src/stubs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { ApiService } from 'src/app/services/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { LegendaryPipe } from 'src/app/pipes/legendary.pipe';
import { IconPipe } from 'src/app/pipes/icon.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Artifact, Faction, Item } from 'src/app/shared/type/interface.model';
import { AssignmentType, FactionType } from 'src/app/shared/type/enum.type';

describe('ActivateComponent', () => {
  let component: ActivateComponent;
  let fixture: ComponentFixture<ActivateComponent>;
  const faction: Faction = {
    type: undefined,
    subtype: null,
    name: undefined,
    description: undefined,
    image: undefined,
    marker: undefined,
    opposites: [],
    adjacents: [],
    id: FactionType.GREY,
  };
  const item: Item = {
    name: 'test',
    description: 'test',
    image: 'assets/images/items/magic-compass.png',
    turns: 1,
    faction: faction,
    type: '',
    subtype: '',
    id: '',
    skills: [],
    families: [],
    categories: [],
    resistances: [],
    units: [],
    resources: [],
    spells: [],
    amount: [],
    battle: false,
    self: false,
    multiple: false,
    gems: 0,
    legendary: false
  }
  const artifact: Artifact = {
    item: item,
    quantity: 1,
    assignment: AssignmentType.NONE,
    id: ''
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
        FormsModule,
        MatListModule,
        MatButtonModule,
        MatBadgeModule,
        BrowserAnimationsModule,
      ],
      declarations: [
        ActivateComponent,
        LegendaryPipe,
        IconPipe,
      ],
      providers: [
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: artifact },
        { provide: MatDialogRef, useValue: MatDialogRefStub },
        { provide: Store, useValue: StoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should ACTIVATE an ARTIFACT', async () => {
    component.selectedArtifact = artifact;
    spyOn(ApiServiceStub, 'activateArtifact');
    await component.activate();
    expect(ApiServiceStub.activateArtifact).toHaveBeenCalledWith(component.uid, component.selectedArtifact.fid, component.uid);
  });

  it('should NOT ACTIVATE an ARTIFACT', async () => {
    component.selectedArtifact = artifact;
    component.kingdomTurn.quantity = 0;
    spyOn(ApiServiceStub, 'activateArtifact');
    await component.activate();
    expect(ApiServiceStub.activateArtifact).not.toHaveBeenCalled();
  });

});
