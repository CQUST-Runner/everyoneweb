import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { LibraryComponent } from './library/library.component';
import { LogsComponent } from './logs/logs.component';
import { SavePageComponent } from './save-page/save-page.component';
import { getConfig } from './settings.model';
import { SettingsComponent } from './settings/settings.component';
import { ViewComponent } from './view/view.component';

const routeMap: Map<string, Route> = new Map([
  ["default", { path: '', 'title': '新建', component: SavePageComponent }],
  ["new", { path: 'save-page', 'title': '新建', component: SavePageComponent }],
  ["library", { path: 'library', 'title': '网页库', component: LibraryComponent }],
  ["settings", { path: 'settings', 'title': '设置', component: SettingsComponent }],
  ["logs", { path: 'logs', 'title': '日志', component: LogsComponent }],
  ["view", { path: 'view', 'title': '查看', component: ViewComponent }],
]);

const routes: Routes = [
  routeMap.get("default")!,
  routeMap.get("new")!,
  routeMap.get("library")!,
  routeMap.get("settings")!,
  routeMap.get("logs")!,
  routeMap.get("view")!,
];

if (routeMap.has(getConfig().firstScreen)) {
  let route = routeMap.get(getConfig().firstScreen)!;
  routes[0] = { path: '', title: route.title, component: route.component };
}

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
