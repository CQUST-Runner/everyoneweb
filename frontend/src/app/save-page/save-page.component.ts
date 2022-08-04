import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-save-page',
  templateUrl: './save-page.component.html',
  styleUrls: ['./save-page.component.css']
})
export class SavePageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  value: string;
  emailFormControl = new FormControl('', [Validators.required, Validators.pattern(/^(ftp|http|https):\/\/[^ "]+$/)]);

  matcher = new MyErrorStateMatcher();
  
  onFolderSelected(ev:Event) {
    
  }
}
