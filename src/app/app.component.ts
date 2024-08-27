import {Component, OnInit, ViewChild} from '@angular/core';
import {HomeComponent} from './home/home.component';
import {ActivatedRoute, ParamMap, RouterLink, RouterOutlet} from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpClientModule, HttpParameterCodec  } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from './environment';
import { externalAccessCall, popPlaylist } from '../bot';

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

// @NgModule({
//   imports: [BrowserModule, FormsModule, YouTubePlayerModule],
//   declarations: [AppComponent],
//   bootstrap: [AppComponent],
// })

// BrowserModule,

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomeComponent, RouterLink, RouterOutlet, HttpClientModule,  FormsModule, YouTubePlayerModule],
  templateUrl: './app.component.html',

  styleUrls: ['./app.component.css'],
})

//[width]="width"
//[height]="height"
//[videoId]="videoId" 

//  <iframe width="560" height="315" src="https://www.youtube.com/embed/ESv-IwHFOI8?si=DFOA0vr6mjHvxg6D" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

export class AppComponent implements OnInit{
  title = 'homes';



  paramsObject : ParamMap | null | undefined;
  accessToken : string | null | undefined;
  refresh_token : string | null | undefined;
  accessTokenExpiry: number | undefined;
  token_type: string | null | undefined;
  scope: Array<string> | undefined;
  tempString: string|null|undefined ="";

  @ViewChild('ytPlayer') player: any;
  apiLoaded = false;
  videoUrl = 'https://www.youtube.com/watch?v=QIZ9aZD6vs0';
  videoId = 'QIZ9aZD6vs0';// 'ZXZZZZZZZ';
  height = 200;
  width = 400;

  //"{'autoplay': 1}"

  ytPlayerVars : YT.PlayerVars | undefined;
  //ytPlayerVars= {"autoplay": "1", "enablejsapi": "1"};
  //, "enablejsapi": 1

  // enablejsapi=1
  startSeconds = 60;
  endSeconds = 120;
  

  constructor(private route: ActivatedRoute, private http: HttpClient, private ytPlayerVars: YT.PlayerVars){

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
            externalAccessCall();
          })();

          //Handling ytPlaylistInitialization
          this.videoId = this.getYTVideoIDFromURL(popPlaylist());

        }
  );
          // .pipe(
          //   catchError(this.handleError('addHero', hero))
          // )

  }
  
  getYTVideoIDFromURL(source:string){
    var ytVideoIDFromSource = source;
    const regex = /^.*watch\?v=([A-Za-z0-9]*)(&.*)?$/i;

      //console.log('strCPY version: '+source.substring(source.indexOf('watch?v=')+8, source.indexOf('&')));



      //this.videoId = ytVideoIDFromSource.substring(source.indexOf('watch?v=')+8, source.indexOf('&'));
      //this.videoId = ytVideoIDFromSource.replace(regex, "$1");

    return ytVideoIDFromSource.replace(regex, "$1");
  }

  testFunction(){
    console.log('https://www.youtube.com/watch?v=ocQ7sFFxOh4&pp=ygUJaW4gZmxhbWVz');
    console.log(this.getYTVideoIDFromURL('https://www.youtube.com/watch?v=ocQ7sFFxOh4&pp=ygUJaW4gZmxhbWVz'));
    this.videoId = this.getYTVideoIDFromURL('https://www.youtube.com/watch?v=ocQ7sFFxOh4&pp=ygUJaW4gZmxhbWVz');
    
    
    
  }

  ngOnInit() {
    //this.ytPlayerVars.enablejsapi = 1;
    if (!this.apiLoaded) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      this.apiLoaded = true;
      
    }
    this.route.queryParamMap
      .subscribe((params) => {
        this.paramsObject = { ...params.keys, ...params };
        if(params.get('code')){
          console.log(params.get('code'));
          //run the authentication post?
          this.responseToTwitchCodeRedirect(params.get('code'));
          
        }
      }
    );
    //this.ytTestIfVideoExists('test1234');
    //this.testFunction(); 
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

      this.videoId = this.getYTVideoIDFromURL(this.optionalInjectBackUpPlaylist(popPlaylist()));

    }
    else if (event.data.toString() == "5"){
      event.target.playVideo();
    }
  }

  optionalInjectBackUpPlaylist(nextTrack:string){
    if (nextTrack == ""){
      //pull from backup playlist                                                                                                   //INJECT BACKUP PLAYLIST CODE HERE

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
      var tempString = this.getYTVideoIDFromURL(this.optionalInjectBackUpPlaylist(popPlaylist()));
      console.log('attempting to pop the next video in as '+ tempString);
      this.videoId = tempString;
    }

  }

  ytBackButton(){


  }

  ytNextButton(){
    console.log('Going to next video');
    this.videoId = this.getYTVideoIDFromURL(this.optionalInjectBackUpPlaylist(popPlaylist()));
  }

  ytOnApiChange(event:YT.PlayerEvent){
    console.log("OnApiChange: " + event.target.getPlayerState().toString());
  }
  


///To my understanding what we want to do for refresh tokens
///act as if things have not expired until we get a 401? error.
///OnError check if 401, if so retry after attempting a refresh.
///If still error and refresh applied - prompt sign in again.

///Provided Rationale - Access token is short-lived so it's safer than attempting to refresh often.
}
