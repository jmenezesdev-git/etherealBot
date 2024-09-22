import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {youtubeVideoInfo} from './apiFunctions/youtube'

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private subject = new Subject<youtubeVideoInfo>();
  sendUpdateActiveSongHook(ytVI: youtubeVideoInfo) {
    //console.log('sendUpdateActiveSongHook');
    this.subject.next(ytVI);
  }
  GetUpdateActiveSongHook(): Observable<youtubeVideoInfo>{ 
    //console.log('GetUpdateActiveSongHook');
    return this.subject.asObservable();
  }

  
  private subject_2 = new Subject<youtubeVideoInfo>();
  sendUpdateActiveSongHookNoDB(ytVI: youtubeVideoInfo) {
    //console.log('sendUpdateActiveSongHookNoDB');
    this.subject_2.next(ytVI);
  }
  GetUpdateActiveSongHookNoDB(): Observable<youtubeVideoInfo>{ 
    //console.log('GetUpdateActiveSongHookNoDB');
    return this.subject_2.asObservable();
  }


  private subject2 = new Subject<youtubeVideoInfo[]>();
  sendUpdateDragDropSongHook(ytVIA: youtubeVideoInfo[]) {
    //console.log('sendUpdateDragDropSongHook');
    this.subject2.next(ytVIA);
  }
  GetUpdateDragDropSongHook(): Observable<youtubeVideoInfo[]>{ 
    //console.log('GetUpdateDragDropSongHook');
    return this.subject2.asObservable();
  }

  private subject2_2 = new Subject<youtubeVideoInfo[]>();
  sendUpdateDragDropSongHookRenumber(ytVIA: youtubeVideoInfo[]) {
    //console.log('sendUpdateDragDropSongHookRenumber');
    this.subject2_2.next(ytVIA);
  }
  GetUpdateDragDropSongHookRenumber(): Observable<youtubeVideoInfo[]>{ 
    //console.log('GetUpdateDragDropSongHookRenumber');
    return this.subject2_2.asObservable();
  }



  

}
