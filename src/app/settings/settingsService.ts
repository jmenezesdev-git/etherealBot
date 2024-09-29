import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { botSettings } from 'src/botSettings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private subject = new Subject<botSettings>();
  sendCloseSettingsEventHook(bS: botSettings) { //senders include settings Component on window close. bs Contains the new data, approved by the DB
    //console.log('sendCloseSettingsEventHook');
    this.subject.next(bS);
  }
  getCloseSettingsEventHook(): Observable<botSettings>{  //subscribers include app.component and update program logic
    //console.log('getCloseSettingsEventHook');
    return this.subject.asObservable();
  }

}
