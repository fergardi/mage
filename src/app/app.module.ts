import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { AuthState } from './shared/auth/auth.state';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorIntl } from './shared/custom/paginator.intl';
import { NgxCurrencyModule } from 'ngx-currency';
import { DisqusModule } from 'ngx-disqus';

// AOT compilation support
export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

// i18n initializer to force translations to be loaded before startup
export function appInitializerFactory(translateService: TranslateService): () => Promise<void> {
  return () => {
    translateService.setDefaultLang('es');
    return translateService.use('es').toPromise();
  };
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
      isolate: false,
    }),
    NgxsModule.forRoot(
      [AuthState],
      { developmentMode: !environment.production },
    ),
    NgxsReduxDevtoolsPluginModule.forRoot({
      name: 'Legendarium',
      disabled: environment.production,
    }),
    TourMatMenuModule.forRoot(),
    NgxCurrencyModule,
    DisqusModule.forRoot('legendarium-test'),
  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    { provide: MatPaginatorIntl, useClass: PaginatorIntl },
    { provide: APP_INITIALIZER, useFactory: appInitializerFactory, deps: [TranslateService], multi: true },
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
