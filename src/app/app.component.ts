import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, ParamMap, Router, RouterLink, RouterOutlet} from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpClientModule, HttpParameterCodec  } from '@angular/common/http';
import { catchError, throwError, Subscription, elementAt } from 'rxjs';
import { environment } from './environment';
import { externalAccessCall, tester, clearCurrentSong, tryTwitchUserTokenRefresh, initializeWebSocket, getBotSettings, getCurrentSong} from '../bot';
import { youtubeVideoInfo } from './scripts/youtube';
import { SharedService } from './shared.service';
import { playlistDragDropService } from './playlistDragDrop/playlistDragDropService';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

//import { AppComponent } from './app.component';
import { YouTubePlayer, YouTubePlayerModule } from '@angular/youtube-player';
import { CdkContextMenuTrigger, CdkMenuModule } from '@angular/cdk/menu';

import { SettingsComponent } from "./settings/settings.component";
import { playlistDragDropComponent } from "./playlistDragDrop/playlistDragDrop.component";
import { botSettings } from 'src/botSettings';
import { decodeTextForOutput, playNextSong } from './scripts/botSupportingFunctions';
import { publicTrackListComponent } from "./publicTrackList/publicTrackList.component";

// @NgModule({
//   imports: [BrowserModule, FormsModule, YouTubePlayerModule],
//   declarations: [AppComponent],
//   bootstrap: [AppComponent],
// })

export interface youtubeVideoInfoDisplay {
  position: string;
  videoId: string;
  duration: string;
  requestedBy: string;
  songTitle: string;
}


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet, HttpClientModule, FormsModule, YouTubePlayerModule, CdkMenuModule, SettingsComponent, playlistDragDropComponent, CommonModule, publicTrackListComponent],
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.component.css'],
})



//[width]="width"
//[height]="height"
//[videoId]="videoId" 

//  <iframe width="560" height="315" src="https://www.youtube.com/embed/ESv-IwHFOI8?si=DFOA0vr6mjHvxg6D" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

export class AppComponent implements OnInit{
  title = 'EtherealBot';

  // clickEventsubscription:Subscription;

  paramsObject : ParamMap | null | undefined;
  accessToken : string | null | undefined;
  refresh_token : string | null | undefined;
  accessTokenExpiry: number | undefined;
  token_type: string | null | undefined;
  scope: Array<string> | undefined;
  tempString: string|null|undefined ="";
  twProfilePic : string | null | undefined;

  //@ViewChild('ytPlayer') player: any;
  apiLoaded = false;
  videoUrl = 'https://www.youtube.com/watch?v=QIZ9aZD6vs0';
  videoId = 'QIZ9aZD6vs0';// 'ZXZZZZZZZ';
  height = 200;
  width = 400;
  loggedIntoTwitch = false;
  connectTwitchVisibility = 'visible';
  showSettings = "none";
  settings: botSettings|undefined; //trying to avoid naming a variable the same as a class
  showPublicTracks= "none";
  showMain = "initial";
  ptlUser: string | null | undefined;
  


  spanStyle = {'background-color' : 'rgb(255, 0, 0)'};
  ytPlayerVars = {'autoplay': 0, 'enablejsapi': 1};
  startSeconds = 60;
  endSeconds = 120;

  
  initialVideo = 2;
  @ViewChild('ytPlayer') player: any;
  // @ViewChild('ytPlayer') child_component: YouTubePlayer;


  onSaveSettings(uncommittedSettings: botSettings){
    this.ethBotSettingsCloseWindow();
  }


  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private sharedService:SharedService, private playlistDragDropService:playlistDragDropService){

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
            this.scope = (value as MyObject).scope;

            //var enc = new TextEncoder(); // always utf-8
            //this.scope = enc.encode(this.tempString);
          }
          if(value.hasOwnProperty('token_type')){
            this.token_type = (value as MyObject).token_type;
          }
          console.log(this.scope);
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

      
          // console.log('etherealBotBotUserId = ' + localStorage.getItem('etherealBotBotUserId'));
          // console.log('etherealBotChatChannelUserId = ' + localStorage.getItem('etherealBotChatChannelUserId'));
          // console.log('etherealBotStreamAccountName = ' + localStorage.getItem('etherealBotStreamAccountName'));
          // console.log('etherealBotTwitchOAuthAccessToken = ' + localStorage.getItem('etherealBotTwitchOAuthAccessToken'));
          // console.log('etherealBotTwitchRefreshToken = ' + localStorage.getItem('etherealBotTwitchRefreshToken'));
          // console.log('etherealBotProfileImageUrl = ' + localStorage.getItem('etherealBotProfileImageUrl'));
          

          //Handling ytPlaylistInitialization

        }
    );

  }
  
  ngAfterViewInit(): void {
    const doc = (<any>window).document;
    const playerApiScript = doc.createElement('script');
    playerApiScript.type = 'text/javascript';
    playerApiScript.src = 'https://www.youtube.com/iframe_api';
    doc.body.appendChild(playerApiScript);

    (<any>window).onYouTubeIframeAPIReady = () => {
      this.player = new (<any>window).YT.Player('ytPlayer', {
        height: '500px',
        width: '100%',
        //videoId: 'hHMyZR87VvQ',
        playerVars: { 'autoplay': 0, 'rel': 0, 'controls': 2, 'origin':'http://localhost:4200' },
        events: {
          'onReady': (event: any) => {
            console.log('Player is ready');
            this.ytOnReady(event);
          },
          'onStateChange': (event: any) => {
            this.ytOnStateChange(event);
          }
        }
      });
    };
    
  }

  async ngOnInit() {

    this.route.queryParamMap //get params determine if we want to load main page.
        .subscribe((params) => {
          this.paramsObject = { ...params.keys, ...params };
          if(params.get('uid')){
            console.log(params.get('uid'));
            this.showPublicTracks = "flex";
            this.showMain = "none";
            if (params.get('uid') != null){
              this.ptlUser = params.get('uid');
            }
          }
          else{
            this.showPublicTracks = "none";
            this.showMain = "initial";
          }
        }
      );

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
    dataTest.forEach((element, index)=> {
      element.channelTitle = decodeTextForOutput(element.channelTitle);
      element.songTitle = decodeTextForOutput(element.songTitle);
    });
    this.playlistDragDropService.SendSetPlayListDragDropDataSource(dataTest);
    this.settings = getBotSettings();

  }

  reinitializePage(){
    this.router.navigate([], {
      queryParams: {
        'uid': null,
        'code': null,
      },
      queryParamsHandling: 'merge'
    });

  }


  twLogout(){
    this.twProfilePic = "";
    localStorage.setItem('etherealBotBotUserId', '');
    localStorage.setItem('etherealBotChatChannelUserId', '');
    localStorage.setItem('etherealBotStreamAccountName', '');
    localStorage.setItem('etherealBotTwitchOAuthAccessToken', '');
    localStorage.setItem('etherealBotTwitchRefreshToken', '');
    localStorage.setItem('etherealBotProfileImageUrl', '');
    environment.TwitchOAuthRefreshToken = "";
    this.loggedIntoTwitch = false;
    this.connectTwitchVisibility = 'visible'
    
    window.location.reload();
  }

  ethBotSettingsMenuOpen(){
    this.showSettings = "flex";
  }  
  ethBotSettingsCloseWindow(){
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

  ytOnReady(event:YT.PlayerEvent){
    console.log("OnReady: " + event.target.getPlayerState().toString());
    this.sharedService.GetUpdateActiveSongHook().subscribe((value)=>{
      this.updateActiveSong(value);});
    this.sharedService.GetUpdateActiveSongHookNoDB().subscribe((value)=>{
      this.updateActiveSong(value);});
      
    this.sharedService.GetPlaylistPauseRequest().subscribe((value)=>{
      this.pausePlaylist();});
    this.sharedService.GetPlaylistResumeRequest().subscribe((value)=>{
      this.resumePlaylist();});

    var currentSong = getCurrentSong();
    console.log(currentSong);
    this.player.cueVideoById({videoId:currentSong.videoId});
    //this.player.playerVars = "autoplay=1"
    this.player.mute();         
    //this.player.playVideo();    

    //this.player.cueVideoById({videoId:"QIZ9aZD6vs0"});
    this.player.pauseVideo();
  }

  async ytOnStateChange(event:YT.OnStateChangeEvent){//one of the state changes is pause/play
    //this.player.playVideo();
    console.log("OnStateChange: " +event.data.toString());
    if (event.data.toString() == "0"){ //0=Video End? 1=play 2=pause? 3=load?  //-1 error? //5 loaded and ready?
      //pop ytList and order the next song?
      var feedback = await this.ytAttemptPlayNextSong();
      if (feedback == ""){
        clearCurrentSong();
      }
    }
    if (event.data.toString() == "3"){
      this.initialVideo = 0;
    }
    else if (event.data.toString() == "5" && this.initialVideo > 0){
      this.initialVideo--;
    }
    else if (event.data.toString() == "5" && this.initialVideo == 0){
      event.target.playVideo();
    }
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

  async ytAttemptPlayNextSong(){

    return await playNextSong(this.sharedService);
  }

  ytBackButton(){
    this.player.seekTo(0, true);
  }

  ytNextButton(){
    this.ytAttemptPlayNextSong();
  }

  ytOnApiChange(event:YT.PlayerEvent){
    console.log("OnApiChange: " + event.target.getPlayerState().toString());
  }
  
  updateActiveSong(ytVI:youtubeVideoInfo){

    if (this.videoId == ytVI.videoId){
      this.player.seekTo(0, true);
    }

    this.videoId = ytVI.videoId;
    
    this.player.playerVars = { 'autoplay': 1, 'rel': 0, 'controls': 2 };
    this.player.cueVideoById({videoId:ytVI.videoId});
  }
  
  updateActiveSong_IDOnly(vid:string){
    this.videoId = vid;
    this.player.cueVideoById({videoId:vid});
  }
  pausePlaylist(){
    this.player.pauseVideo();
  }
  resumePlaylist(){
    this.player.playVideo();
  }

///To my understanding what we want to do for refresh tokens
///act as if things have not expired until we get a 401? error.
///OnError check if 401, if so retry after attempting a refresh.
///If still error and refresh applied - prompt sign in again.

///Provided Rationale - Access token is short-lived so it's safer than attempting to refresh often.
}
