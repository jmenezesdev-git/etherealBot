import { Injectable } from '@angular/core';
import {HousingLocation} from './housinglocation';


@Injectable({
  providedIn: 'root'
})
export class HousingService {

  constructor() { }
  
  submitApplication(firstName: string, lastName: string, email: string) {
    
    console.log(firstName, lastName, email);
  }
}
