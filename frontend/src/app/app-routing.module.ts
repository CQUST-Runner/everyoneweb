import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LibraryComponent } from './library/library.component';
import { LogsComponent } from './logs/logs.component';
import { SavePageComponent } from './save-page/save-page.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: '', 'title': '首页', component: SavePageComponent },
  { path: 'save-page', 'title': '首页', component: SavePageComponent },
  { path: 'library', 'title': '已保存的网页', component: LibraryComponent },
  { path: 'settings', 'title': '设置', component: SettingsComponent },
  { path: 'logs', 'title': '日志', component: LogsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
