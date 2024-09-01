import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {youtubeVideoInfo} from './apiFunctions/youtube'

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private subject = new Subject<any>();
  sendUpdateActiveSongHook(ytVI: any) {
    this.subject.next(ytVI);
  }
  GetUpdateActiveSongHook(): Observable<any>{ 
    return this.subject.asObservable();
  }
}
