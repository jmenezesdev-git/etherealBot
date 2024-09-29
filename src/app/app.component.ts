import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {HomeComponent} from './home/home.component';
import {ActivatedRoute, ParamMap, Router, RouterLink, RouterOutlet} from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpClientModule, HttpParameterCodec  } from '@angular/common/http';
import { catchError, throwError, Subscription, elementAt } from 'rxjs';
import { environment } from './environment';
import { externalAccessCall, peekPlaylist, popPlaylist, tester, clearCurrentSong, tryTwitchUserTokenRefresh, initializeWebSocket, getPlaylist, relocateItemInPlaylistArray, deletePlaylistAtLocation } from '../bot';
import { youtubeVideoInfo } from './apiFunctions/youtube';
import { SharedService } from './shared.service';

/*import {NgModule} from '@angular/core';
import {YouTubePlayerModule} from '@angular/youtube-player'; //npm i @angular/youtube-player
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
@NgModule({
  imports: [BrowserModule, FormsModule, YouTubePlayerModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})*/
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

//import { AppComponent } from './app.component';
import { YouTubePlayerModule } from '@angular/youtube-player';

import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray} from '@angular/cdk/drag-drop';
import { CdkContextMenuTrigger, CdkMenuModule } from '@angular/cdk/menu';


import {MatTable, MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import { SettingsComponent } from "./settings/settings.component";
import { botSettings } from 'src/botSettings';

// @NgModule({
//   imports: [BrowserModule, FormsModule, YouTubePlayerModule],
//   declarations: [AppComponent],
//   bootstrap: [AppComponent],
// })

// BrowserModule,
export interface youtubeVideoInfoDisplay {
  position: string;
  videoId: string;
  duration: string;
  requestedBy: string;
  songTitle: string;
}


export const DATAARR: youtubeVideoInfo[] = [
  // export const DATAARR: youtubeVideoInfoDisplay[] = [
  // {position: 1, rejectionReason: "", videoId:"gXCI8vJTjqA", duration: "PT5M56S", uploadStatus: "processed", failureReason: "", privacyStatus: "", channelTitle: "", embeddable: true, license: "youtube", publicStatsViewable:true, requestedBy:"etherealAffairs", songTitle:"【公式】【東方Vocal】幽閉サテライト / 華鳥風月/歌唱senya【FullMV】（原曲：六十年目の東方裁判 ～ Fate of Sixty Years）"},
  // {position: 2, rejectionReason: "", videoId:"gXCI8vJTjqA", duration: "PT5M56S", uploadStatus: "processed", failureReason: "", privacyStatus: "", channelTitle: "", embeddable: true, license: "youtube", publicStatsViewable:true, requestedBy:"testUser", songTitle:"【公式】【東方Vocal】幽閉サテライト / 華鳥風月/歌唱senya【FullMV】（原曲：六十年目の東方裁判 ～ Fate of Sixty Years）"},
  // {position: "1", videoId:"gXCI8vJTjqA", duration: "PT5M56S", requestedBy:"etherealAffairs", songTitle:"【公式】【東方Vocal】幽閉サテライト / 華鳥風月/歌唱senya【FullMV】（原曲：六十年目の東方裁判 ～ Fate of Sixty Years）"},
  // {position: "2", videoId:"gXCI8vJTjqA", duration: "PT5M56S", requestedBy:"TestUser", songTitle:"【公式】【東方Vocal】幽閉サテライト / 華鳥風月/歌唱senya【FullMV】（原曲：六十年目の東方裁判 ～ Fate of Sixty Years）"},];
]; 



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomeComponent, RouterLink, RouterOutlet, HttpClientModule, FormsModule, YouTubePlayerModule, CdkDropList, CdkDrag, MatTableModule, MatIconModule, CdkMenuModule, SettingsComponent],
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.component.css'],
})

//[width]="width"
//[height]="height"
//[videoId]="videoId" 

//  <iframe width="560" height="315" src="https://www.youtube.com/embed/ESv-IwHFOI8?si=DFOA0vr6mjHvxg6D" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

export class AppComponent implements OnInit{
  title = 'homes';

  // clickEventsubscription:Subscription;

  paramsObject : ParamMap | null | undefined;
  accessToken : string | null | undefined;
  refresh_token : string | null | undefined;
  accessTokenExpiry: number | undefined;
  token_type: string | null | undefined;
  scope: Array<string> | undefined;
  tempString: string|null|undefined ="";
  twProfilePic : string | null | undefined;

  @ViewChild('ytPlayer') player: any;
  apiLoaded = false;
  videoUrl = 'https://www.youtube.com/watch?v=QIZ9aZD6vs0';
  videoId = 'QIZ9aZD6vs0';// 'ZXZZZZZZZ';
  height = 200;
  width = 400;
  loggedIntoTwitch = false;
  connectTwitchVisibility = 'visible';
  showSettings = "none";
  settings: botSettings|undefined; //trying to avoid naming a variable the same as a class
  


  spanStyle = {'background-color' : 'rgb(255, 0, 0)'};
  ytPlayerVars = {'autoplay': 0, 'enablejsapi': 1};
  startSeconds = 60;
  endSeconds = 120;

  @ViewChild('table2', { static: true })
  table2!: MatTable<youtubeVideoInfo>;

  displayedColumns2: string[] = ['position', 'songname', 'duration', 'requestedby', 'channeltitle'];
  dataSource2 = DATAARR;//!:youtubeVideoInfo[]; //| undefined;


  rowDelete(ytVI: youtubeVideoInfo){
    // event: CdkContextMenuTrigger
    //console.log()
    console.log(ytVI);
    deletePlaylistAtLocation(ytVI);
  }

  drop2(event: CdkDragDrop<string>) {
    if (this.dataSource2 != undefined){
      const previousIndex = this.dataSource2.findIndex(d => d === event.item.data);

      //this.dataSource2[previousIndex].position = event.currentIndex + 1;
      relocateItemInPlaylistArray(previousIndex, event.currentIndex);
      //this.table2.renderRows(); This function redraws the table rows
    }
  }




  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private sharedService:SharedService){
    //, private ytPlayerVars: YT.PlayerVars
    // this.clickEventsubscription = 

    this.sharedService.GetUpdateActiveSongHook().subscribe((value)=>{
      this.updateActiveSong(value);});
    this.sharedService.GetUpdateActiveSongHookNoDB().subscribe((value)=>{
      this.updateActiveSong(value);});
    this.sharedService.GetUpdateDragDropSongHook().subscribe((value)=>{
      this.updateDragDrop(value);
    });
    this.sharedService.GetUpdateDragDropSongHookRenumber().subscribe((value)=>{
      this.updateDragDropRenumber(value);
    });

    

  }


  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
			"Accept": "application/json"
      //Authorization: 'my-auth-token'
    })
  };

  ytImagehttpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'image/webp',
			"Accept": "application/json"
      //Authorization: 'my-auth-token'
    })
  };
  

  

  private async responseToTwitchCodeRedirect(code: string | null){

    interface MyObject{
      access_token?: string;
      expires_in?: string;
      refresh_token?: string;
      scope?: Array<string>;
      token_type?: string;
    }

    //encodeURIComponent(
      //<HttpParams>
      //<Object>

    const response$ = this.http.post<Object>('https://id.twitch.tv/oauth2/token',
      JSON.stringify({"client_id": environment.CLIENT_ID, "client_secret": environment.CLIENT_SECRETID, "code": String(code), "grant_type": "authorization_code", "redirect_uri": "http://localhost:4200/"}),
       
      this.httpOptions);

      response$.subscribe(
        value => {
          if(value){
            console.log(value);
            console.log(value.hasOwnProperty('access_token'));
            
          }
          if(value.hasOwnProperty('access_token')){
            this.accessToken = (value as MyObject).access_token;
            if(this.accessToken !== undefined){
              environment.TwitchOAuthAccessToken = this.accessToken;
              localStorage.setItem('etherealBotTwitchOAuthAccessToken', this.accessToken);
            }
          }
          if(value.hasOwnProperty('expires_in')){
            this.tempString = (value as MyObject).expires_in;
            if(this.tempString !== undefined){
              this.accessTokenExpiry = parseInt(this.tempString); //idk if we want auto refresh before timeout?
            }
          }
          if(value.hasOwnProperty('refresh_token')){
            this.refresh_token = (value as MyObject).refresh_token;
            if(this.refresh_token !== undefined){
              environment.TwitchOAuthRefreshToken = this.refresh_token;
              localStorage.setItem('etherealBotTwitchRefreshToken', this.refresh_token);
            }
          }
          if(value.hasOwnProperty('scope')){
            //this.scope = value.get('scope');
            this.scope = (value as MyObject).scope;

            //var enc = new TextEncoder(); // always utf-8
            //this.scope = enc.encode(this.tempString);
          }
          if(value.hasOwnProperty('token_type')){
            this.token_type = (value as MyObject).token_type;
          }
          console.log(this.scope);
          //console.log(environment.TwitchOAuthAccessToken);
          //post based on retrieved information. I think?
          
          (async () => {
            await externalAccessCall(this.sharedService);


          if (localStorage.getItem("etherealBotProfileImageUrl")!= null && localStorage.getItem("etherealBotProfileImageUrl") != undefined  ){
            if (localStorage.getItem("etherealBotProfileImageUrl")?.toString() !=  ''){
              this.loggedIntoTwitch = true;
              this.connectTwitchVisibility = 'hidden';
              this.twProfilePic = localStorage.getItem("etherealBotProfileImageUrl");
            }
          }


            initializeWebSocket(this.sharedService);
          })();

      
          console.log('etherealBotBotUserId = ' + localStorage.getItem('etherealBotBotUserId'));
          console.log('etherealBotChatChannelUserId = ' + localStorage.getItem('etherealBotChatChannelUserId'));
          console.log('etherealBotStreamAccountName = ' + localStorage.getItem('etherealBotStreamAccountName'));
          console.log('etherealBotTwitchOAuthAccessToken = ' + localStorage.getItem('etherealBotTwitchOAuthAccessToken'));
          console.log('etherealBotTwitchRefreshToken = ' + localStorage.getItem('etherealBotTwitchRefreshToken'));
          console.log('etherealBotProfileImageUrl = ' + localStorage.getItem('etherealBotProfileImageUrl'));
          

          //Handling ytPlaylistInitialization

        }
  );
          // .pipe(
          //   catchError(this.handleError('addHero', hero))
          // )

  }
  


  async ngOnInit() {


// Youtube setup
    if (!this.apiLoaded) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      this.apiLoaded = true;
      
    }


    
    if(localStorage.getItem('etherealBotStreamAccountName')){ //I've logged in before  //////////XXXXXXXXX
      //try refresh
      if(await tryTwitchUserTokenRefresh(this.sharedService) != ''){
        this.route.queryParamMap 
          .subscribe((params) => {
            this.paramsObject = { ...params.keys, ...params };
            if(params.get('code')){
              console.log(params.get('code'));
              this.responseToTwitchCodeRedirect(params.get('code'));
              
            }
          }
        );

      }
      else{
        ///replace Connect to twitch with Image & text
        this.loggedIntoTwitch = true;
        this.connectTwitchVisibility = 'hidden';
        this.twProfilePic = localStorage.getItem("etherealBotProfileImageUrl");
        //Create dropdown menu for logging out.
      }

    }
    else{
      this.route.queryParamMap //Vanilla Route - I've never logged in before
        .subscribe((params) => {
          this.paramsObject = { ...params.keys, ...params };
          if(params.get('code')){
            console.log(params.get('code'));
            //run the authentication post?
            this.responseToTwitchCodeRedirect(params.get('code'));



            console.log('attempting router stuff');
            this.router.navigate([], {
            queryParams: {
                'code': null,
                'scope': null,
                'state': null,
              },
              queryParamsHandling: 'merge'
            });
            
          }
        }
        
      );
      
    }
    var dataTest:youtubeVideoInfo[] = [];
    this.dataSource2 = dataTest;
    tester(this.sharedService);

  }

  twLogout(){
    this.twProfilePic = "";
    localStorage.setItem('etherealBotBotUserId', '');
    localStorage.setItem('etherealBotChatChannelUserId', '');
    localStorage.setItem('etherealBotStreamAccountName', '');
    localStorage.setItem('etherealBotTwitchOAuthAccessToken', '');
    localStorage.setItem('etherealBotTwitchRefreshToken', '');
    localStorage.setItem('etherealBotProfileImageUrl', '');
    environment.TwitchOAuthAccessToken = "";
    environment.TwitchOAuthRefreshToken = "";
    this.loggedIntoTwitch = false;
    this.connectTwitchVisibility = 'visible'
    
    window.location.reload();
  }

  ethBotSettingsMenuOpen(){
    this.showSettings = "flex";

  }  
  ethBotSettingsCancel(){
    this.showSettings = "none";
  }
  ethBotSettingsSave(){
    this.showSettings = "none";
  }

  //TestIfPageExists before loading
  ytTestIfVideoExists(videoURL:string){
    const response$ = this.http.get<Object>('https://i.ytimg.com/vi_webp/ZXZZZZZZZ/sddefault.webp',

      this.ytImagehttpOptions);//.pipe(catchError(this.errorHandler));//;
    response$.subscribe(
      data => {
        console.log('get->data');
      },
      err => {
        console.log('Something (correctly) went wrong when querying ZXZZZZZ!');
      });
  }

//  image/webp


  ytOnReady(event:YT.PlayerEvent){
    console.log("OnReady: " + event.target.getPlayerState().toString());
    //this.player.playerVars = "autoplay=1"
    this.player.mute();         
    //this.player.playVideo();    

      
  }

  ytOnStateChange(event:YT.OnStateChangeEvent){//one of the state changes is pause/play
    //this.player.playVideo();
    console.log("OnStateChange: " +event.data.toString());
    if (event.data.toString() == "0"){ //0=Video End? 1=play 2=pause? 3=load?  //-1 error? //5 loaded and ready?
      //pop ytList and order the next song?
      var feedback = this.ytAttemptPlayNextSong();
      if (feedback == ""){
        clearCurrentSong();
      }
    }
    else if (event.data.toString() == "5"){
      event.target.playVideo();
    }
  }

  optionalInjectBackUpPlaylist(nextTrack:youtubeVideoInfo){
    console.log("next track is:");
    console.log(nextTrack);
    if (nextTrack.songTitle == ""){
      //pull from backup playlist                                                                                                   //INJECT BACKUP PLAYLIST CODE HERE

    }
    else{
    }
    return nextTrack;
  }

  ytOnError(event:YT.OnErrorEvent){  //150 video not available
    //output what the error code was.
    console.log("OnError: " + event.data.toString());
    //onerror event.target -> access to directly invoke functions on object.
    //pop ytList and order the next song? on error?
    if (event.data.toString() == "150"){
      //SEND MESSAGE AS BOT :   "Skipping video X123, it can't be run because reasons."
      this.ytAttemptPlayNextSong();
    }

  }

  ytAttemptPlayNextSong(){

    //console.log('Going to next video');
    if (peekPlaylist() != undefined){
      //this.videoId = this.optionalInjectBackUpPlaylist(popPlaylist()).videoId;
      this.sharedService.sendUpdateActiveSongHook(popPlaylist());
      
      return peekPlaylist().videoId;
    }
    else{
      console.log('Playlist is empty you fool!');
      return "";
    }
  }

  ytBackButton(){


  }

  ytNextButton(){
    this.ytAttemptPlayNextSong();
  }

  ytOnApiChange(event:YT.PlayerEvent){
    console.log("OnApiChange: " + event.target.getPlayerState().toString());
  }
  
  updateActiveSong(ytVI:youtubeVideoInfo){
    //newTrack:youtubeVideoInfo
    // console.log('running updateActiveSong');
    this.updateDragDropRenumber(getPlaylist());
    this.videoId = ytVI.videoId;
  }
  
  updateActiveSong_IDOnly(vid:string){
    //newTrack:youtubeVideoInfo
    // console.log('running updateActiveSong');
    this.videoId = vid;
  }
  
  updateDragDrop(ytVI:youtubeVideoInfo[]){
    //console.log('updateDragDrop'); 
    //console.log(ytVI);

    //setting mandatory values for display purposes only. SHOULD NEVER IMPACT underlying data 
    // ytVI.forEach((element, index)=> {
      // element.position = index + 1;
      //element.setShortRealTime();
    // });

    this.dataSource2 = ytVI;
    this.table2.renderRows();
  }

  updateDragDropRenumber(ytVI:youtubeVideoInfo[]){
    //console.log('updateDragDrop'); 
    //console.log(ytVI);

    //setting mandatory values for display purposes only. SHOULD NEVER IMPACT underlying data 
    ytVI.forEach((element, index)=> {
      element.position = index + 1;
      //element.setShortRealTime();
    });

    this.dataSource2 = ytVI;
    this.table2.renderRows();
  }

///To my understanding what we want to do for refresh tokens
///act as if things have not expired until we get a 401? error.
///OnError check if 401, if so retry after attempting a refresh.
///If still error and refresh applied - prompt sign in again.

///Provided Rationale - Access token is short-lived so it's safer than attempting to refresh often.
}
