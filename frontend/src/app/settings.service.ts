import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_SERVER } from './common';
import { Settings } from './settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private client: HttpClient) {
  }

  update(s: Settings): Observable<Settings> {
    return this.client.patch<Settings>(API_SERVER + `/settings/patch`, s);
  }
}
