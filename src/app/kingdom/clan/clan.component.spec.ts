import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ClanComponent } from './clan.component';
import { TranslateModule } from '@ngx-translate/core';
import { CacheServiceStub, StoreStub, AngularFirestoreStub, ApiServiceStub, NotificationServiceStub, MatDialogStub } from 'src/stubs';
import { Store } from '@ngxs/store';
import { CacheService } from 'src/app/services/cache.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LongPipe } from 'src/app/pipes/long.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ShortPipe } from 'src/app/pipes/short.pipe';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from 'src/app/app-routing.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ManifestComponent } from './manifest.component';
import { FoundationComponent } from './foundation.component';
import { Clan, Guild } from 'src/app/shared/type/interface.model';
import { GuildType } from 'src/app/shared/type/enum.type';

describe('ClanComponent', () => {
  let component: ClanComponent;
  let fixture: ComponentFixture<ClanComponent>;
  const clan: Clan = {
    fid: 'test',
    name: 'test',
    description: 'test',
    image: 'test',
    members: [],
    leader: null,
    power: 0,
  };
  const guild: Guild = {
    subtype: 'test',
    faction: null,
    name: 'test',
    description: 'test',
    id: GuildType.HUNTER,
    image: 'test',
    attackBonus: 10,
    defenseBonus: 0,
    healthBonus: 0,
    goldBonus: 0,
    manaBonus: 0,
    populationBonus: 0,
    explorationBonus: 0,
    constructionBonus: 0,
    researchBonus: 0,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes(routes),
        TourMatMenuModule.forRoot(),
        BrowserAnimationsModule,
        MatCardModule,
        MatTableModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        FormsModule,
        MatSelectModule,
        MatIconModule,
        MatChipsModule,
        MatPaginatorModule,
        MatListModule,
        MatBadgeModule,
        MatToolbarModule,
      ],
      declarations: [
        ClanComponent,
        LongPipe,
        ShortPipe,
      ],
      providers: [
        { provide: CacheService, useValue: CacheServiceStub },
        { provide: Store, useValue: StoreStub },
        { provide: AngularFirestore, useValue: AngularFirestoreStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: MatDialog, useValue: MatDialogStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should OPEN the MANIFEST dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openManifestDialog(clan);
    expect(MatDialogStub.open).toHaveBeenCalledWith(ManifestComponent, { panelClass: 'dialog-responsive', data: { ...clan, members: [] } });
  });

  it('should OPEN the FOUNDATION dialog', () => {
    spyOn(MatDialogStub, 'open');
    component.openFoundationDialog();
    expect(MatDialogStub.open).toHaveBeenCalledWith(FoundationComponent, { panelClass: 'dialog-responsive', data: null });
  });

  it('should JOIN the CLAN', async () => {
    component.kingdomGuild = guild;
    spyOn(component, 'canBeFavored').and.returnValue(true);
    spyOn(ApiServiceStub, 'joinClan');
    await component.joinClan(clan, new Event('click'));
    expect(ApiServiceStub.joinClan).toHaveBeenCalledWith(component.uid, clan.fid);
  });

  it('should JOIN the CLAN and CATCH the ERROR', async () => {
    spyOn(ApiServiceStub, 'joinClan').and.throwError(new Error('test'));
    await component.joinClan(clan, new Event('click'));
    expect(ApiServiceStub.joinClan).toThrowError('test');
  });

  it('should LEAVE the CLAN', async () => {
    spyOn(ApiServiceStub, 'leaveClan');
    await component.leaveClan(clan, new Event('click'));
    expect(ApiServiceStub.leaveClan).toHaveBeenCalledWith(component.uid, clan.fid);
  });

  it('should LEAVE the CLAN and CATCH the ERROR', async () => {
    spyOn(ApiServiceStub, 'leaveClan').and.throwError(new Error('test'));
    await component.leaveClan(clan, new Event('click'));
    expect(ApiServiceStub.leaveClan).toThrowError('test');
  });

  it('should FAVOR the GUILD', async () => {
    component.kingdomGuild = guild;
    spyOn(component, 'canBeFavored').and.returnValue(true);
    spyOn(ApiServiceStub, 'favorGuild');
    await component.favorGuild();
    expect(ApiServiceStub.favorGuild).toHaveBeenCalledWith(component.uid, component.kingdomGuild.id);
  });

  it('should FAVOR the GUILD and CATCH the ERROR', async () => {
    component.kingdomGuild = guild;
    spyOn(component, 'canBeFavored').and.returnValue(true);
    spyOn(ApiServiceStub, 'favorGuild').and.throwError(new Error('test'));
    await component.favorGuild();
    expect(ApiServiceStub.favorGuild).toThrowError('test');
  });

  it('should NOT FAVOR the GUILD', async () => {
    spyOn(component, 'canBeFavored').and.returnValue(false);
    spyOn(ApiServiceStub, 'favorGuild');
    await component.favorGuild();
    expect(ApiServiceStub.favorGuild).not.toHaveBeenCalled();
  });

});
