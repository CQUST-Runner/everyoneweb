import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { API_SERVER } from '../common';

@Injectable()
export class PageService {
    constructor(private client: HttpClient) {
    }

    delete(id: string): Observable<void> {
        return this.client.delete<void>(API_SERVER + `/page/${id}`)
    }

    pageList(): Observable<any[]> {
        return this.client.get<any[]>(API_SERVER + '/pageList/').pipe(take(1));
    }
}
