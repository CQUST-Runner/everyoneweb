import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { Page } from './page.model';

@Injectable({
  providedIn: 'root'
})
export class ToolBoxService {

  constructor(private _snackBar: MatSnackBar,) { }

  public openSnackBar<D>(message: string, action: string, config?: MatSnackBarConfig<D>) {
    let c = config;
    if (!c) {
      c = { duration: 3 * 1000 };
    }
    this._snackBar.open(message, action, c);
  }

  public openComponentSnackBar<T, D>(comp: ComponentType<T>, config?: MatSnackBarConfig<D>): MatSnackBarRef<T> {
    let c = config;
    if (!c) {
      c = { duration: 3 * 1000 };
    }
    return this._snackBar.openFromComponent(comp, c);
  }

  public getLocalUrl(page: Page): string {
    return `http://127.0.0.1:16224/view/${page.id}`
  }
}
