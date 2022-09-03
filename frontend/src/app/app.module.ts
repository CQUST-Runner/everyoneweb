import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { LayoutModule } from '@angular/cdk/layout';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdePopoverModule } from '@material-extended/mde';
import { NgxFilesizeModule } from 'ngx-filesize';
import { AboutComponent } from './about/about.component';
import { AfterIfDirective } from './after-if.directive';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CategoryInputComponent } from './category-input/category-input.component';
import { ColumnEditComponent } from './column-edit/column-edit.component';
import { ConflictsComponent } from './conflicts/conflicts.component';
import { DateTimePickerComponent } from './date-time-picker/date-time-picker.component';
import { EditPageInfoComponent } from './edit-page-info/edit-page-info.component';
import { ExportAsComponent } from './export-as/export-as.component';
import { FormatSelectionComponent } from './format-selection/format-selection.component';
import { FullScreenSpinnerComponent } from './full-screen-spinner/full-screen-spinner.component';
import { GeneralInputDialogComponent } from './general-input-dialog/general-input-dialog.component';
import { LibraryComponent } from './library/library.component';
import { LogsComponent } from './logs/logs.component';
import { MainNavComponent } from './main-nav/main-nav.component';
import { MakeConfirmComponent } from './make-confirm/make-confirm.component';
import { MaterialModule } from './material.module';
import { PageInfoDialogComponent } from './page-info-dialog/page-info-dialog.component';
import { PageInfoComponent } from './page-info/page-info.component';
import { PagePreviewComponent, SafePipe } from './page-preview/page-preview.component';
import { RatingComponent } from './rating/rating.component';
import { SavePageSuccessActionsComponent } from './save-page-success-actions/save-page-success-actions.component';
import { SavePageComponent } from './save-page/save-page.component';
import { ScrollTriggerComponent } from './scroll-trigger/scroll-trigger.component';
import { HighlightService } from './service/highlight.service';
import { LogService } from './service/log.service';
import { PageService } from './service/page.service';
import { RealLogService } from './service/reallog.service';
import { SettingsComponent } from './settings/settings.component';
import { TabToolBarComponent } from './tab-tool-bar/tab-tool-bar.component';
import { TagsInputComponent } from './tags-input/tags-input.component';
import { UrlWithCopyBtnComponent } from './url-with-copy-btn/url-with-copy-btn.component';
import { VersionInfoComponent } from './version-info/version-info.component';
import { MoveToDialogComponent } from './move-to-dialog/move-to-dialog.component';

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
    GeneralInputDialogComponent,
    SavePageSuccessActionsComponent,
    DateTimePickerComponent,
    UrlWithCopyBtnComponent,
    AboutComponent,
    ScrollTriggerComponent,
    ColumnEditComponent,
    TabToolBarComponent,
    CategoryInputComponent,
    SafePipe,
    MoveToDialogComponent,
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
    NgxFilesizeModule,
    MdePopoverModule,
  ],
  providers: [HighlightService, LogService, RealLogService, PageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
