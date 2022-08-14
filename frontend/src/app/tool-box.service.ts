import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToolBoxService {

  constructor(private _snackBar: MatSnackBar,) { }

  public openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }
}
