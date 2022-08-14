import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { API_SERVER } from '../common';

@Injectable()
export class PageService {
    constructor(private client: HttpClient) {
    }

    pageList(): Observable<any[]> {
        return this.client.get<any[]>(API_SERVER + '/pageList/').pipe(take(1));
    }
}
