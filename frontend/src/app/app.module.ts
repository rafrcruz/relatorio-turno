import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { ReportComponent } from './pages/report/report.component';
import { PostComposerComponent } from './pages/report/post-composer/post-composer.component';
import { AreaIndicatorsComponent } from './pages/report/area-indicators/area-indicators.component';
import { PostListComponent } from './pages/report/post-list/post-list.component';
import { ReplyThreadComponent } from './pages/report/reply-thread/reply-thread.component';
import { AdminComponent } from './pages/admin/admin.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AppRoutingModule } from './app-routing.module';

registerLocaleData(localePt);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ReportComponent,
    PostComposerComponent,
    AreaIndicatorsComponent,
    PostListComponent,
    ReplyThreadComponent,
    AdminComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
