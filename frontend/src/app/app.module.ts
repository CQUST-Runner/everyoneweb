import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainNavComponent } from './main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { LibraryComponent } from './library/library.component';
import { SavePageComponent } from './save-page/save-page.component';
import { SettingsComponent } from './settings/settings.component';
import { LogsComponent } from './logs/logs.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { HighlightService } from './service/highlight.service';
import { LogService } from './service/log.service';
import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter'
import { ClipboardModule } from '@angular/cdk/clipboard';
import { PagePreviewComponent } from './page-preview/page-preview.component';
import { PageInfoComponent } from './page-info/page-info.component';
import { ConflictsComponent } from './conflicts/conflicts.component';
import { VersionInfoComponent } from './version-info/version-info.component';
import { EditPageInfoComponent } from './edit-page-info/edit-page-info.component';
import { ExportAsComponent } from './export-as/export-as.component';
import { MakeConfirmComponent } from './make-confirm/make-confirm.component';
import { PageInfoDialogComponent } from './page-info-dialog/page-info-dialog.component';
import { AfterIfDirective } from './after-if.directive';
import { RatingComponent } from './rating/rating.component';
import { TagsInputComponent } from './tags-input/tags-input.component';
import { FormatSelectionComponent } from './format-selection/format-selection.component';
import { HttpClientModule } from '@angular/common/http';
import { RealLogService } from './service/reallog.service';
import { PageService } from './service/page.service';
import { FullScreenSpinnerComponent } from './full-screen-spinner/full-screen-spinner.component';

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    LibraryComponent,
    SavePageComponent,
    SettingsComponent,
    LogsComponent,
    PagePreviewComponent,
    PageInfoComponent,
    ConflictsComponent,
    VersionInfoComponent,
    EditPageInfoComponent,
    ExportAsComponent,
    MakeConfirmComponent,
    PageInfoDialogComponent,
    AfterIfDirective,
    RatingComponent,
    TagsInputComponent,
    FormatSelectionComponent,
    FullScreenSpinnerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    ClipboardModule,
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    HttpClientModule,
  ],
  providers: [HighlightService, LogService, RealLogService, PageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
