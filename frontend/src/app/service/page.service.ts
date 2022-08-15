import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer, take } from 'rxjs';
import { API_SERVER } from '../common';
import { Page } from '../page.model';

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

    save(p: Page): Observable<Page> {
        return this.client.post<Page>(API_SERVER + '/page/', p);
    }

    update(p: Page): Observable<Page> {
        return this.client.patch<Page>(API_SERVER + `/page/${p.id}`, p);
    }
}
