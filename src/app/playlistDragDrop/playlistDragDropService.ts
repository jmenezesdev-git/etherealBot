import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
// import { botSettings } from 'src/botSettings';
import { youtubeVideoInfo } from '../scripts/youtube';

@Injectable({
  providedIn: 'root'
})
export class playlistDragDropService {

  private subject = new Subject<youtubeVideoInfo[]>();
  SendSetPlayListDragDropDataSource(ytVI: youtubeVideoInfo[]) { //senders include settings Component on window close. bs Contains the new data, approved by the DB
    //console.log('sendCloseSettingsEventHook');
    this.subject.next(ytVI);
  }
  GetSetPlayListDragDropDataSource(): Observable<youtubeVideoInfo[]>{  //subscribers include app.component and update program logic
    //console.log('getCloseSettingsEventHook');
    return this.subject.asObservable();
  }

}
