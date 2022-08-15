import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concatAll, filter, interval, map, Observable } from 'rxjs';
import { API_SERVER } from '../common';

interface GetLogResp {
    lines: string[]
    pos: number
    filename: string
}

@Injectable()
export class RealLogService {
    previousDone = true;
    pos: number = 0;

    constructor(private client: HttpClient) {
    }

    sendReq(): Observable<GetLogResp> {
        this.previousDone = false;
        return this.client.get<GetLogResp>(API_SERVER + `/log/?pos=${this.pos}`);
    }

    processResp(resp: GetLogResp): GetLogResp {
        this.pos = resp.pos;
        this.previousDone = true;
        return resp;
    }

    getLog(): Observable<GetLogResp> {
        return interval(1000).pipe(
            filter(_ => this.previousDone),
            map(_ => this.sendReq()),
            concatAll(),
            map(x => this.processResp(x))
        )
    }
}
