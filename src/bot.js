import { first, queue, share } from 'rxjs';
import {environment} from './app/environment';
import { getFirstYoutubeResult, getYoutubeVideoByID, youtubeVideoInfo } from './app/apiFunctions/youtube';
import {AppComponent} from './app/app.component';
import { SharedService } from './app/shared.service';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { botSettings } from './botSettings';







/*
Today's goals:


COMPLETED
#	Basic OAuth
#	Twitch Connection
#	Youtube Playlist/Queue core functions
#	!xsr for a youtube video
#	it will autoplay the next track in queue
#	next button will dredge up the next track and play it.
#	OAuth no longer assumes a default username
#	!xsr <required>		///add arg1 to song queue, when in doubt it is YT song.
#	!xsong 				///Indicates currently playing song information
	!xwrongsong			///removes users latest song from queue

#	Drag & Drop interface to reorder?
	List includes the following:
		Video/Song Name
		Requested By
		Duration
		Option to delete from queue
Cookies
#	Remember my login
	NEED TO CHANGE OAUTH TOKEN GENERATION TO BE OPTIONAL/OCCASIONAL	
Database
#	Remember my playlists & settings outside of cookies
#	mongodb for the lulz?
#	Separate backend server
#	Access database from backend server
#	Delete API calls

#	= High priority
WIP = Work in Progress
L	= Low Priority



URGENT:
NEXT:#	Length Limit
THEN:#	Songs Per User
Frontend Queue interface
#	Drag & Drop interface to reorder?
	List includes the following:
		Option to add to default Queue
Frontend Settings interface
WIP	Length Limit
WIP	Songs Per User
#	Default Playlist	///Plays when there are no songs in queue
						///first song is the default when a user logs in or opens the page
	Total Time Per User	///Limits Queue capacity per user to X minutes/hours
L	Voteskip Count
L	Disabling commands	
L	Enable Spotify/YT 	
Chat Commands
	!xskip				///Mod only skip current song (same as next)
	!xlimit <optional>  ///Sets Limits to song requests per user defaults to infinite
L	!xsonglist			///link to dynamic page containing a readonly view of the current queue
L		Support Spotify as well as YT
L	!xremove<optional>	///removes current or nth song in queue
L	!xpause				///pauses active content in queue
L	!xplay				///plays active content in queue
L	!xvoteskip			///initiates vote to skip current song. resets upon hitting a new song or resetting current song.
L	!lastsong<optional>	///Get song information of nth past song, indicates total past song count
						///resets on what, login? 12h?
L	!xAddDef			///Mod only adds to default playlist
L	Convert &#<number>; to correct text
Youtube
	Rework Youtube.ts to use https://www.npmjs.com/package/ytdl-core so we never run out of API calls.
Security
	use dotenv and move environment variables there.
Backend Server
	Oauth from backend server. How is this possible if it forces front-end logins?
Ai Chatbot Integration
L	Your favorite waifu in chat
Test possibility for automated redeems via channel points
L	Add extra songs to queue for points
L	extra voteskips for points
L	+more
Twitch plays AMQ
LL	Yes..
Recurring message posting
LLL	Standard bot feature. Every x mins post "...."


//For spotify
	Could be new song request command "!xspr <search>" or "!xsr sp <search>"


3ventic
Twitch Alumni
Aug 2017
Logging into chat is done by using an oauth token with the chat_login scope. Oauth tokens are given to applications, 
when a user authorizes the application to communicate with Twitch on their behalf, limited by the scopes used in the auth process.

So you need an application to get the chat login token. If you want to do more with the API than just chat, you’ll also need a client ID to use the HTTP API.


*/





//import { webSocket } from "rxjs/webSocket";
// does this array contain results only?
var playlistArray = [];//['https://www.youtube.com/watch?v=ZXZZZZZZZ', 'https://www.youtube.com/watch?v=aYzt6WJEx10', 'https://www.youtube.com/watch?v=ocQ7sFFxOh4&pp=ygUJaW4gZmxhbWVz', 'https://www.youtube.com/watch?v=LQXgNLGDPgo&pp=ygUZZWR1Y2F0ZWQgZm9vbCBpcm9uIG1haWRlbg%3D%3D'];
var currentSong;
var sharedService;
var CLIENT_SECRETID = 'ABC1234';
var BOT_USER_ID = 'CHANGE_ME_TO_YOUR_BOTS_USER_ID'; // This is the User ID of the chat bot
var OAUTH_TOKEN = 'CHANGE_ME'; // Needs scopes user:bot, user:read:chat, user:write:chat
var CLIENT_ID = 'Will_Be_Changed';
var STREAM_ACCOUNT_NAME = '___EMPTIED_PRIOR_TO_COMMIT__'; //need to set for alternative channels
var BOT_ACCOUNT_NAME = 'etherealBot';//need to set for alternative channels
var APP_OAUTH_TOKEN = 'I_AM_SET_BY_CODE';
var CHAT_CHANNEL_USER_ID = 'CHANGE_ME_TO_THE_CHAT_CHANNELS_USER_ID'; // This is the User ID of the channel that the bot will join and listen to chat messages of
//What is the channel I am currently in?
var optionalCommandPrefix = 'x';
const EVENTSUB_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';

var websocketSessionID = "";
var ethBotSettings;


// Start executing the bot from here
	// Don't at present want this to start without being invoked in this project.
(async () => {
	// Verify that the authentication is valid
	//await getOAUTH_TOKEN(); //
	//CLIENT_ID = environment.CLIENT_ID;
	//OAUTH_TOKEN = environment.TwitchOAuthAccessToken;
	//await getAuth();

	//await getUserIDs();


	

	// Start WebSocket client and register handlers
	//const websocketClient = startWebSocketClient();
})();

export async function externalAccessCall(sentsharedService){

	CLIENT_ID = environment.CLIENT_ID;
	OAUTH_TOKEN = environment.TwitchOAuthAccessToken;
	CLIENT_SECRETID = environment.CLIENT_SECRETID;
	sharedService = sentsharedService;
	//await getAuth();
	await getAppOAUTH_TOKEN();
	await getAdministrativeUserIDs();
	// Start WebSocket client and register handlers

}

async function initializeCommonSettings(sentSharedService){
	if(sentSharedService == null){
		console.log("sentSharedService is null");
	}
	if(sentSharedService == undefined){
		console.log("sentSharedService is undefined");
	} else if (sentSharedService != undefined && sentSharedService != null){
		console.log("sentSharedService is defined");

	}

	CLIENT_ID = environment.CLIENT_ID;
	CLIENT_SECRETID = environment.CLIENT_SECRETID;
	sharedService = sentSharedService;
	BOT_USER_ID = localStorage.getItem('etherealBotBotUserId');
	CHAT_CHANNEL_USER_ID = localStorage.getItem('etherealBotChatChannelUserId');
	STREAM_ACCOUNT_NAME = localStorage.getItem('etherealBotStreamAccountName');
	OAUTH_TOKEN = localStorage.getItem('etherealBotTwitchOAuthAccessToken');


	initializeSubscribers();
	
	const playlistResponse = await fetch('http://localhost:3000/getSettings?userId=' + STREAM_ACCOUNT_NAME  , {
		method: 'GET',
		headers: {
			"Client-ID": CLIENT_ID,
			"Authorization": "Bearer "+ OAUTH_TOKEN,
		},
	});
	

	if (playlistResponse.status != 200) {
		let data = await playlistResponse.json();
		console.log('My backend server errored out on the getSettings request.');
	}

	let json = await playlistResponse.json();

	ethBotSettings = new botSettings(json.data.lengthLimit, json.data.songsPerUser, json.data.streamChannel);

}

export async function initializeWebSocket(sentSharedService){
	await initializeCommonSettings(sentSharedService);
	loadPlaylistFromBackend(sentSharedService);
	const websocketClient = startWebSocketClient();
}

export async function tryTwitchUserTokenRefresh(sentSharedService){
	await initializeCommonSettings(sentSharedService);
	//console.log(localStorage.getItem('etherealBotTwitchRefreshToken'));

	const response = await fetch('https://id.twitch.tv/oauth2/token', {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
		},

		body: JSON.stringify({"client_id": CLIENT_ID, "client_secret": CLIENT_SECRETID, "grant_type": "refresh_token", "refresh_token": localStorage.getItem('etherealBotTwitchRefreshToken')})


	});

	if (response.status != 200) {
		let data = await response.json();
		console.error("Token is not valid. /oauth2/token returned status code " + response.status);
		console.error(data);
		return data;
	}

	const json = await response.json();
	environment.TwitchOAuthAccessToken = json.access_token;
	localStorage.setItem('etherealBotTwitchOAuthAccessToken', json.access_token);
	localStorage.setItem('etherealBotTwitchRefreshToken', json.refresh_token);
	loadPlaylistFromBackend(sentSharedService);
	const websocketClient = startWebSocketClient();
	return '';


}


function initializeSubscribers(){
	
	sharedService.GetUpdateActiveSongHook().subscribe((value)=>{
		updateActiveSongBackend(value);});
	sharedService.GetUpdateDragDropSongHook().subscribe((value)=>{
		updateSongPlaylistBackend(value);
	});
	sharedService.GetUpdateDragDropSongHookRenumber().subscribe((value)=>{
		updateSongPlaylistBackend(value);
	});

}

async function updateActiveSongBackend(value){ //single YTVI
	console.log('value in updateActiveSongBackend');
	console.log(value);
	let response = await fetch('http://localhost:3000/currentSong', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN, ///maybe APP_OAUTH_TOKEN?
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			newCurrentSong: value,
			userId: STREAM_ACCOUNT_NAME,
		})
	});

	if (response.status != 200) {
		let data = await response.json();
		console.error("Database communication failure: Failed Update Active Song");
		console.error(data);
	} else {
		console.log("Updated Active song.");
	}


}

async function updateSongPlaylistBackend(value){ //multiple YTVI in order
	//push a newly ordered playlist into the backend
	//this could contain 1 new item or none.
	console.log('value in updateSongPlaylistBackend');
	console.log(value);
	let response = await fetch('http://localhost:3000/rearrangeSongs', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN, ///maybe APP_OAUTH_TOKEN?
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			reorderedTracks: value,
			userId: STREAM_ACCOUNT_NAME,
		})
	});

	if (response.status != 200) {
		let data = await response.json();
		console.error("Database communication failure: Failed to Rearrange tracks in Backend");
		console.error(data);
	} else {
		console.log("Rearranged Tracks Successfully!");
	}
}

async function	addTrackToBackend(newTrack){ //YTVI's latest
	console.log('newTrack in addTrackToBackend');
	console.log(newTrack);
	let response = await fetch('http://localhost:3000/addSong', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN, ///maybe APP_OAUTH_TOKEN?
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			newTrack: newTrack,
			userId: STREAM_ACCOUNT_NAME,
		})
	});

	if (response.status != 200) {
		let data = await response.json();
		console.error("Database communication failure: Failed to Add Track to Backend");
		console.error(data);
	} else {
		console.log("Added New Song.");
	}
}


async function addToSongPlaylistBackend(){ //do we need this?
	
}

//Unordered Top 10 VNs
//Umineko
//FSN
//HA
//Limbus
//FGO
//Counterside
//Chaos Child
//FMDM
//Danganronpa 2
//Steins;Gate

//Honorable Mentions:
//Utawarerumono:MoD
//Danganronpa 1
//Katawa Shojou
//Clannad

//Haven't read: Fata Morgana, Song of Saya, MoT, Muv-Luv Alternative, Tsukihime, Mahoyo
//What is Schwarzen Marken?
//Losers: 999, Arknights, Blue Archive, HSR, Majikoi, Nekopara, Higurashi, Higanbana, Nikke, Ace Attorney, DDLC

// WebSocket will persist the application loop until you exit the program forcefully
async function getAppOAUTH_TOKEN(){
	// https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token

	const response = await fetch('https://id.twitch.tv/oauth2/token', {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
		},

		body: JSON.stringify({"client_id": CLIENT_ID, "client_secret": CLIENT_SECRETID, "grant_type": "client_credentials",})


	});
	//.then(response => response.json()).then(data => APP_OAUTH_TOKEN=data.access_token);
    

	//console.log(data)


	if (response.status != 200) {
		let data = await response.json();
		console.error("Token is not valid. /oauth2/token returned status code " + response.status);
		console.error(data);
	}

	const json = await response.json();
	let APP_OAUTH_TOKEN = json.access_token;
	//console.log("OAUTH_TOKEN = " + OAUTH_TOKEN);
	console.log(response.toString());
}


async function getAuth() {
	// https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token
	let response = await fetch('https://id.twitch.tv/oauth2/validate', {
		method: 'GET',
		headers: {
			'Authorization': 'OAuth ' + OAUTH_TOKEN
		}
	});

	if (response.status != 200) {
		let data = await response.json();
		//console.error("Token is not valid. /oauth2/validate returned status code " + response.status);
		//console.error(data);
		return process.exit(1);
	}

	//console.log("Validated token.");
}

export async function getAdministrativeUserIDs(){
	// https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token

	console.log('Calling getUserIDs\n');
	const botIDresponse = await fetch('https://api.twitch.tv/helix/users?login=' + BOT_ACCOUNT_NAME  , {
		method: 'GET',
		headers: {
			"Client-ID": CLIENT_ID,
			"Authorization": "Bearer "+ OAUTH_TOKEN,
		},
	});
	//.then(response => response.json()).then(data => OAUTH_TOKEN=data.access_token);
    



	if (botIDresponse.status != 200) {
		let data = await botIDresponse.json();
		console.log('Twitch errored out on Bot-ID request.');
		return process.exit(1);
	}

	const json = await botIDresponse.json();
	console.log(json.data[0].display_name);
	//I think we are assigning correctly. 403 is from bot's permissions on main account 
	if (json.data[0].display_name == BOT_ACCOUNT_NAME){
		BOT_USER_ID = json.data[0].id;
		localStorage.setItem('etherealBotBotUserId', BOT_USER_ID);

		console.log('Assigned sender_id as: ' + json.data[1].display_name);
	}
	const ownIDresponse = await fetch('https://api.twitch.tv/helix/users'  , {
		method: 'GET',
		headers: {
			"Client-ID": CLIENT_ID,
			"Authorization": "Bearer "+ OAUTH_TOKEN,
		},
	});
	

	if (ownIDresponse.status != 200) {
		let data = await ownIDresponse.json();
		console.log('Twitch errored out on self-ID request.');
	}

	let json2 = await ownIDresponse.json();
	console.log(json2.data[0].display_name);
	CHAT_CHANNEL_USER_ID = json2.data[0].id;
	STREAM_ACCOUNT_NAME = json2.data[0].display_name;	
	localStorage.setItem('etherealBotChatChannelUserId', CHAT_CHANNEL_USER_ID);
	localStorage.setItem('etherealBotStreamAccountName', STREAM_ACCOUNT_NAME);
	localStorage.setItem('etherealBotProfileImageUrl', json2.data[0].profile_image_url)
	//json2.data[0].
	console.log('Assigned broadcaster_id as: ' + json2.data[0].display_name);

	//console.log(json);
	//console.log("The Chat channel user id = " + CHAT_CHANNEL_USER_ID);
	//console.log("The Bot user id = " + BOT_USER_ID);
	
	console.log('etherealBotProfileImageUrl from getAdministrativeUserIDs is: ' + localStorage.getItem('etherealBotProfileImageUrl'));
	//console.log(botIDresponse.toString());
}


function startWebSocketClient() {
	let websocketClient = new WebSocket(EVENTSUB_WEBSOCKET_URL);


	//websocketClient.onerror = ((socket, ev) => console.log(ev.toString));
	//websocketClient.onerror?((sender, e) => {console.error;}): 
	//console.log("I don't know what is happening with onerror Trigger");

	//websocketClient.onopen = ((sender, ev) => 
		//console.log('WebSocket connection opened to ' + EVENTSUB_WEBSOCKET_URL)
	//	thisConsoleFuckery = 'potato'
	///);


	//  websocketClient.on('message', (data) => {
		// handleWebSocketMessage(JSON.parse(data.toString()));
	 //});

	websocketClient.onmessage = ((data) =>
		handleWebSocketMessage(JSON.parse(data.data.toString()))
		//console.log(data.data)
	);

	return websocketClient;
}


function handleWebSocketMessage(data) {
	//console.log(data)
	switch (data.metadata.message_type) {
		case 'session_welcome': // First message you get from the WebSocket server when connecting
			websocketSessionID = data.payload.session.id; // Register the Session ID it gives us

			// Listen to EventSub, which joins the chatroom from your bot's account
			registerEventSubListeners();
			//sendChatMessage('test1234')
			break;
		case 'notification': // An EventSub notification has occurred, such as channel.chat.message
			switch (data.metadata.subscription_type) {
				case 'channel.chat.message':
					// First, print the message to the program's console.

					// Then check to see if that message was "HeyGuys"
					if (data.payload.event.message.text.trim() == "HeyGuys") {
						// If so, send back "VoHiYo" to the chatroom
						sendChatMessage("VoHiYo")
					}
					var messageText = data.payload.event.message.text.toString();
					var sender = data.payload.event.chatter_user_name.toString();
					console.log(messageText);
					if (startsWith('!'+ optionalCommandPrefix +'sr', messageText)){
						addSongToQueue(getFirstArgOfCommand(messageText), sender);

					} else if (startsWith('!'+ optionalCommandPrefix +'nextSong', messageText)){
						
						nextSongInQueue();

					} else if (startsWith('!'+ optionalCommandPrefix +'song', messageText)){
						if (currentSong != undefined && currentSong != null){
							sendChatMessage('The current song is ' + currentSong.songTitle + ' by ' + currentSong.channelTitle + '. It was requested by' + currentSong.requestedBy + '.' + ' https://youtu.be/' + currentSong.videoId);
						} else{
							sendChatMessage('There is no current song!');
						}
					} else if (startsWith('!'+ optionalCommandPrefix +'wrongsong', messageText)){
						wrongSong(sender);
					}
					break;
			}
			break;
		case 'session_keepalive':
			//sendChatMessage('I am working?');
			break;


	}

}

function wrongSong(sender){
	if(playlistArray.length > 0){
		for (let i = playlistArray.length; i > 0; i--) {
			if (playlistArray[i-1].requestedBy == sender){
				//remove from array
				removeSongFromBackend(playlistArray[i-1]);
				sendChatMessage('Removed ' + playlistArray[i-1].songTitle + ' by ' + playlistArray[i-1].channelTitle + ' from playlist.');
				playlistArray.splice(i-1,1);
				sharedService.sendUpdateDragDropSongHookRenumber(playlistArray);
				i = 0; //halt iteration.
			}
		}
	}
}

async function removeSongFromBackend(track){
	console.log('newTrack in addTrackToBackend');
	console.log(track);
	let response = await fetch('http://localhost:3000/deleteSong', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN, ///maybe APP_OAUTH_TOKEN?
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			track: track,
			userId: STREAM_ACCOUNT_NAME,
		})
	});

	if (response.status != 200) {
		let data = await response.json();
		console.error("Database communication failure: Failed to Add Track to Backend");
		console.error(data);
	} else {
		console.log("Added New Song.");
	}

}



function startsWith(regex, text){
	if(text.match('^\s*'+regex)){
		return true 

	} else {
		return false;
	}

}


/////Songs functionality
export function getPlaylist(){

	return playlistArray;
}

export function clearCurrentSong(){
	currentSong = undefined;

}

export function getPlaylistLength(){
	return playlistArray.length;
}
export function popPlaylist(){
	//playlistArray

	//const index = playlistArray.indexOf(1);
	// const index = 0;
	// if (index > -1) {
	// 	playlistArray = playlistArray.splice(index, 1);
	// }

	
	var firstTrack = playlistArray.shift();
	currentSong = firstTrack;
	if (playlistArray.length == 0 && firstTrack != undefined && firstTrack != null){
		console.log('returning: ' + firstTrack.songTitle + ' the play list is out of songs!');
	}
	else{
		console.log('returning: ' + firstTrack.songTitle + ' the next one is: ' + playlistArray.at(0).songTitle);
	}
	if (firstTrack !== undefined){
		return firstTrack;
	}
	else{
		return "";
	}
}


export function pushPlaylist(message, sharedServiceArg){
		sharedService = sharedServiceArg;
		addSongToQueue(message, STREAM_ACCOUNT_NAME);
}

export function deletePlaylistAtLocation(ytVideoInfo){

	console.log('Removed:' + playlistArray.splice(ytVideoInfo.position -1, 1));
	console.log(sharedService);
	sharedService.sendUpdateDragDropSongHook(playlistArray);
}

export function peekPlaylist(){
	return peekPlaylistN(0);
}
//Peek at xth space in playlist
export function peekPlaylistN(location){
	return playlistArray.at(location);
}

function nextSongInQueue(){
	console.log('Not ready yet!')
	sendChatMessage('The next song in queue feature is not available yet!')
}

//INCOMPLETE
function isYoutubeURI(messageText){
	//This function returns true if we should be using youtube and it is a valid Youtube URI rather than spotify/soundcloud
	const regex = /youtu/i;
	////            https?:\/\/youtu\(.be|be.com\)\/watch\\\?v=\[A-Za-Z0-9\]

	if (messageText.match(regex)){
		return true;
	}
	else{
		return false;
	}
}

function getFirstArgOfCommand(command){
	const regex = /^.*? (\S+.*?$)/i;
	//console.log(command.replace(regex, $1))
 return command.replace(regex, "$1");
}

export function tester(SS){


	// console.log("Test123456");
	// var ytVI = new youtubeVideoInfo("gXCI8vJTjqA", "", "");
	// ytVI.channelTitle = "幽閉サテライト・少女フラクタル・幽閉カタルシス 公式チャンネル";
	// ytVI.duration = "PT5M56S";
	// ytVI.embeddable = true;
	// ytVI.license = "youtube";
	// ytVI.privacyStatus = "public";
	// ytVI.publicStatsViewable = true;
	// ytVI.requestedBy = "etherealAffairs";
	// ytVI.songTitle = "【公式】【東方Vocal】幽閉サテライト / 華鳥風月/歌唱senya【FullMV】（原曲：六十年目の東方裁判 ～ Fate of Sixty Years）";
	// ytVI.uploadStatus = "processed";
	// ytVI.videoId = "gXCI8vJTjqA";
	// playlistArray.push(ytVI);
	// console.log(playlistArray.length);
	// console.log(sumActivePlaylistTime());
	// SS.sendUpdateActiveSongHook(popPlaylist());
	if(SS == null){
		console.log("SS is null");
	}
	if(SS == undefined){
		console.log("SS is undefined");
	} else if (SS != undefined && SS != null){
		console.log("SS is defined");

	}
	// var ytVI = new youtubeVideoInfo("W3q8Od5qJio", "", "");
	// ytVI.channelTitle = "Rammstein Official";
	// ytVI.duration = "PT3M56S";
	// ytVI.embeddable = true;
	// ytVI.license = "youtube";
	// ytVI.privacyStatus = "public";
	// ytVI.publicStatsViewable = true;
	// ytVI.requestedBy = "etherealAffairs";
	// ytVI.songTitle = "Rammstein - Du Hast (Official 4K Video)";
	// ytVI.uploadStatus = "processed";
	// ytVI.videoId = "W3q8Od5qJio";
	// playlistArray.push(ytVI);

	// var ytVI = new youtubeVideoInfo("WxnN05vOuSM", "", "");
	// ytVI.channelTitle = "Iron Maiden";
	// ytVI.duration = "PT4M52S";
	// ytVI.embeddable = true;
	// ytVI.license = "youtube";
	// ytVI.privacyStatus = "public";
	// ytVI.publicStatsViewable = true;
	// ytVI.requestedBy = "etherealAffairs";
	// ytVI.songTitle = "Iron Maiden - The Number Of The Beast (Official Video)";
	// ytVI.uploadStatus = "processed";
	// ytVI.videoId = "WxnN05vOuSM";
	// playlistArray.push(ytVI);


	
	//SS.sendUpdateDragDropSongHook(playlistArray);
	//console.log('getting Playlist from Backend');
	//getPlaylistFromBackend(STREAM_ACCOUNT_NAME);
	console.log('loadingPlaylist from backend');
	

}


//update/delete every single relevant item whenver position changes (ie next song)
//insert new item on song

async function loadPlaylistFromBackend(sharedServiceArg){
	sharedService = sharedServiceArg;

	var tempPlaylistArray = await getPlaylistFromBackend();
	if (tempPlaylistArray != null && tempPlaylistArray != undefined){
		for (const track of tempPlaylistArray) {
			var ytVI = new youtubeVideoInfo(track.videoId, track.songTitle, track.channelTitle);
			ytVI.duration = track.duration;
			ytVI.embeddable = track.embeddable;
			ytVI.license = track.license;
			ytVI.privacyStatus = track.privacyStatus;
			ytVI.publicStatsViewable = track.publicStatsViewable;
			ytVI.requestedBy = track.requestedBy;
			ytVI.uploadStatus = track.uploadStatus;
			ytVI.position = track.position;
			ytVI.addedTimestamp = track.addedTimestamp;
			ytVI.setShortRealTime();
			playlistArray.push(ytVI);

		}
	}
	var tempCurrentSong = await getCurrentSongFromBackend();
	console.log(tempCurrentSong);
	if (tempCurrentSong != null && tempCurrentSong != undefined && tempCurrentSong.length > 0 && tempCurrentSong[0].videoId != null && tempCurrentSong[0].videoId != undefined){
		var ytVI = new youtubeVideoInfo(tempCurrentSong[0].videoId, tempCurrentSong[0].songTitle, tempCurrentSong[0].channelTitle);
			ytVI.duration = tempCurrentSong[0].duration;
			ytVI.embeddable = tempCurrentSong[0].embeddable;
			ytVI.license = tempCurrentSong[0].license;
			ytVI.privacyStatus = tempCurrentSong[0].privacyStatus;
			ytVI.publicStatsViewable = tempCurrentSong[0].publicStatsViewable;
			ytVI.requestedBy = tempCurrentSong[0].requestedBy;
			ytVI.uploadStatus = tempCurrentSong[0].uploadStatus;
			ytVI.position = tempCurrentSong[0].position;
			ytVI.addedTimestamp = tempCurrentSong[0].addedTimestamp;
			ytVI.setShortRealTime();
			currentSong = ytVI;
			//sharedService.sendUpdateActiveSongHook(currentSong);
			sharedService.sendUpdateActiveSongHookNoDB(currentSong);
			console.log('rantempCurrentSongStuff');
	}
	if (currentSong == null || currentSong == undefined && playlistArray.length > 0){
		console.log('getting a new currentSong I hope');
		sharedService.sendUpdateActiveSongHook(popPlaylist());
	}
	sharedService.sendUpdateDragDropSongHook(playlistArray);
}

async function getCurrentSongFromBackend(){
	const playlistResponse = await fetch('http://localhost:3000/currentSong?userid=' + STREAM_ACCOUNT_NAME  , {
		method: 'GET',
		headers: {
			"Client-ID": CLIENT_ID,
			"Authorization": "Bearer "+ OAUTH_TOKEN,
		},
	});
	

	if (playlistResponse.status != 200) {
		let data = await playlistResponse.json();
		console.log('My backend server errored out on playlist request.');
	}

	let json = await playlistResponse.json();
	console.log(json.data);//this contains the data for the user's playlist
	return json.data;
}

async function getPlaylistFromBackend(){

	const playlistResponse = await fetch('http://localhost:3000/playlist?userid=' + STREAM_ACCOUNT_NAME  , {
		method: 'GET',
		headers: {
			"Client-ID": CLIENT_ID,
			"Authorization": "Bearer "+ OAUTH_TOKEN,
		},
	});
	

	if (playlistResponse.status != 200) {
		let data = await playlistResponse.json();
		console.log('My backend server errored out on playlist request.');
	}

	let json = await playlistResponse.json();
	console.log(json.data);//this contains the data for the user's playlist
	return json.data;
}


function sumActivePlaylistTime(){
//time from youtube videos is of the format:  P#DT#H#M#S where # is a series of numbers and #DT, #H, #M are optional depending on video length
	var days = 0;
	var hours = 0;
	var minutes = 0;
	var seconds = 0;

	const regexp = /PT((\d+)DT)?((\d+)H)?((\d+)M)?(\d+)S/g;

	if (playlistArray.length > 0 && currentSong != undefined){
		for (let i = 0; i < playlistArray.length; i++) {
			let matches = playlistArray.at(i).duration.matchAll(regexp);
			for (const match of matches) {
				if (match.length > 7){
					if(match[2] != undefined){
						days += Number(match[2]);
					}
					if (match[4] != undefined){
						hours += Number(match[4]);
					}
					if (match[6] != undefined){
						minutes += Number(match[6]);
					}
					if (match[7] != undefined){
						seconds += Number(match[7]);
					}
				}
			}
		}
		if (currentSong != null && currentSong != undefined && currentSong.duration.length > 0){
			let matches = currentSong.duration.matchAll(regexp);
			for (const match of matches) {
				if (match.length > 7){
					if(match[2] != undefined){
						days += Number(match[2]);
					}
					if (match[4] != undefined){
						hours += Number(match[4]);
					}
					if (match[6] != undefined){
						minutes += Number(match[6]);
					}
					if (match[7] != undefined){
						seconds += Number(match[7]);
					}
				}
			}

		}
		var returnString = "";
		if (days > 0){
			returnString += days + " days";
		}
		if (hours > 0){
			if (returnString.length > 0){
				returnString += " ";
			}
			returnString += hours + "hrs";
		}
		if (minutes > 0){
			if (returnString.length > 0){
				returnString += " ";
			}
			returnString += minutes + "mins";
		}
		if (seconds > 0){
			if (returnString.length > 0){
				returnString += " and  ";
			}
			returnString += seconds + "secs";
		}
		return returnString;
	} else{
		return "0 seconds";
	}

}

function addSongConfirmMessage(ytVI){

	
	
	// 'Added ' + result.songTitle + ' to queue in position ' + playlistArray.length + '!'
	var durationText = sumActivePlaylistTime();
	if (durationText == "0 seconds"){
		return 'Added '+ ytVI.songTitle + ' to queue in position ' + playlistArray.length + ' (playing immediately)';
	}
	else{
		return 'Added '+ ytVI.songTitle + ' to queue in position ' + playlistArray.length + ' (playing in ' + sumActivePlaylistTime() + ')';
	}
}

async function validateVideoSettings(ytVI){

	//console.log(youtubeVideoInfo.getRelativeDate(ethBotSettings.lengthLimit))
	//console.log(youtubeVideoInfo.getRelativeDate(ytVI.duration))
	if (ethBotSettings.lengthLimit != "-1"){
		if ( youtubeVideoInfo.getRelativeDate(ytVI.duration) > youtubeVideoInfo.getRelativeDate(ethBotSettings.lengthLimit)){ ///good odds this needs changing.
			console.log ("less than duration")
			return false;
		}
	}
	if(ethBotSettings.songsPerUser > -1 && playlistArray != null && playlistArray != undefined && playlistArray.length > 0){
		
		var userSongsCount = playlistArray.filter(p => p.requestedBy == ytVI.requestedBy).length;
		if(userSongsCount > ethBotSettings.songsPerUser){
			return false;
		}
	}
	return true;
}


async function addSongToQueue(songArg, sender){

	if(isYoutubeURI(songArg)){
		const regex = /^.*watch\?v=([A-Za-z0-9]*)(&.*)?$/i;
		songArg = songArg.replace(regex, "$1");
		ytVI = new youtubeVideoInfo(songArg, "", "");
		await getYoutubeVideoByID(new youtubeVideoInfo(songArg, "", ""));
		ytVI.requestedBy = sender;
		ytVI.position = playlistArray.length + 1;

		///////////////////validate video settings
		if(validateVideoSettings(ytVI)){
			playlistArray.push(ytVI);
			sendChatMessage(addSongConfirmMessage(result));
		} else{

		}	
	}
	else{
		var result = await getFirstYoutubeResult(songArg);
		if(result.songTitle != null && result.songTitle != undefined && result.songTitle != ""){
			result.requestedBy = sender;
			result.position = playlistArray.length + 1;

			/////////////////validate video settings
			if(validateVideoSettings(result)){
				playlistArray.push(result);
				sendChatMessage(addSongConfirmMessage(result));
			} else{

			}
		}
		else{
			sendChatMessage('Something went wrong when adding ' + songArg + ' to the list, sorry!');	

		}
		//sendChatMessage('@'+ sender + ' invalid Youtube URL detected in ' + messageText);
	}

	if (currentSong == undefined && playlistArray.length > 0){
		
		sharedService.sendUpdateActiveSongHook(popPlaylist());

	}

	if (currentSong != undefined && playlistArray.length > 0 && playlistArray != null && playlistArray != undefined && playlistArray.length > 0){

		//console.log('playlistArray before sending DragDropSongHook update');
		//console.log(playlistArray);
		addTrackToBackend(playlistArray[playlistArray.length-1]); 
		sharedService.sendUpdateDragDropSongHook(playlistArray);
	}	



}

/////having a backup playilist is optional (we will likely have one soonish)
////what do when songs run out and someone adds a track?
////what I want it to do is resume play immediately.



async function runKeepAliveCheck() {
	//GET https://api.twitch.tv/helix/eventsub/subscriptions

	let response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		}
	});

	if (response.status != 200) {
		let data = await response.json();
		//console.error("Failed to send chat message");
		//console.error(data);
	} else {
		let data = await response.json();
		//console.log(data);
		//console.log("Sent chat message: " + chatMessage);
	}

}


//This has never been called yet.
async function sendChatMessage(chatMessage) {
	console.log('broadcaster_id will be: ' + CHAT_CHANNEL_USER_ID );
	console.log('sender_id will be: ' + BOT_USER_ID );
	let response = await fetch('https://api.twitch.tv/helix/chat/messages', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN, ///maybe APP_OAUTH_TOKEN?
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			broadcaster_id: CHAT_CHANNEL_USER_ID,
			sender_id: CHAT_CHANNEL_USER_ID,//BOT_USER_ID,
			message: chatMessage
		})
	});

	if (response.status != 200) {
		let data = await response.json();
		//console.error("Failed to send chat message");
		//console.error(data);
	} else {
		//console.log("Sent chat message: " + chatMessage);
	}
}

async function registerEventSubListeners() {
	//console.log('BOT ID = ' + BOT_USER_ID + ' USER ID = ' + CHAT_CHANNEL_USER_ID + ' OAUTHTOKEN = ' + OAUTH_TOKEN);
	// Register channel.chat.message
	let response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			type: 'channel.chat.message',
			version: '1',
			condition: {
				broadcaster_user_id: CHAT_CHANNEL_USER_ID,
				user_id: CHAT_CHANNEL_USER_ID//BOT_USER_ID
			},
			transport: {
				method: 'websocket',
				session_id: websocketSessionID
			}
		})
	});



	if (response.status != 202) {
		let data = await response.json();
		//console.error("Failed to subscribe to channel.chat.message. API call returned status code " + response.status);
		//console.error(data);
		//return process.exit(1);
	} else {
		const data = await response.json();
		//console.log(`Subscribed to channel.chat.message [${data.data[0].id}]`);
	}
}

export function relocateItemInPlaylistArray(currentIndex, newIndex){
	playlistArray = playlistArrayMove(playlistArray, currentIndex, newIndex);
	sharedService.sendUpdateDragDropSongHookRenumber(playlistArray);
}

function playlistArrayMove(array, currentIndex, newIndex){
	if (newIndex >= array.length){
		newIndex = array.length - 1;
	}
	else if (newIndex < 0){
		newIndex = 0;
	}
	return arrayMove(array, currentIndex, newIndex);
}

function arrayMove(array, old_index, new_index) {
    if (new_index >= array.length) {
        var i = new_index - array.length + 1;
        while (i--) {
            array.push(undefined);
        }
    }
    return array.toSpliced(new_index, 0, array.splice(old_index, 1)[0]);
};

/*

I think in order to post AS the bot. I need to sign in AS the bot somewhere in the chain. 
However, doing so is not scalable for multiple users. Therefore there is likely a second server running at all times to run the bot scripts

Second server - logged in as bot
	EASY
A way to send messages for the bot to interpret and manage event subscribers and who they come from
	BUILD & TEST AN API
		MEDIUM - LONG



*/