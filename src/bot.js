import { first, queue, share } from 'rxjs';
import {environment} from './app/environment';
import { getFirstYoutubeResult, getYoutubeVideoByID, youtubeVideoInfo } from './app/scripts/youtube';
import {AppComponent} from './app/app.component';
import { SharedService } from './app/shared.service';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { botSettings } from './botSettings';
import {addTrackToDefaultBackend, getSettings, updateActiveSongBackend, updateSongPlaylistBackend, getNextDefaultTrackFromBackend, removeSongFromBackend, removeFromDefaultPlaylist, addTrackToBackend, getCurrentSongFromBackend, getPlaylistFromBackend} from './app/scripts/backendCalls';
import {addSongFailMessage, validateVideoSettings, isMod, getBotUserId, playNextSong, generateYTVI, sumActivePlaylistTime, decodeTextForOutput, resumePlaylist, pausePlaylist} from './app/scripts/botSupportingFunctions';





/*

COMPLETED
#	Basic OAuth
#	Twitch Connection
#	Youtube Playlist/Queue core functions
#	!xsr for a youtube video
#	it will autoplay the next track in queue
#	next button will dredge up the next track and play it.
#	OAuth no longer assumes a default username
L	!xsonglist			///link to dynamic page containing a readonly view of the current queue
#	!xsr <required>		///add arg1 to song queue, when in doubt it is YT song.
#	!xsong 				///Indicates currently playing song information
	!xwrongsong			///removes users latest song from queue
	!xskip				///Mod only skip current song (same as next)
L	!xpause				///pauses active content in queue
L	!xplay				///plays active content in queue
#	Default Playlist	///Plays when there are no songs in queue
						///first song is the default when a user logs in or opens the page
	refactor after completing basic features move to typescript where possible.
Frontend Settings interface
	Mod override
#	Length Limit
#	Duration Limit
#	Drag & Drop interface to reorder?
	List includes the following:
		Option to add to default Queue
		Video/Song Name
		Requested By
		Duration
		Option to delete from queue
	Restart Song button
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

TEST
	Twitch
		process to automatically refresh OAuth token when running for long sessions.



URGENT: time calculation for add song is wrong!
NEXT: 
THEN:
Frontend Queue interface
	Total Time Per User	///Limits Queue capacity per user to X minutes/hours
L	Voteskip Count
L	Disabling commands	
L	Enable Spotify/YT 	
Chat Commands
	!xlimit <optional>  ///Sets Limits to song requests per user defaults to infinite
L		Support Spotify as well as YT
L	!xremove<optional>	///removes current or nth song in queue
L	!xvoteskip			///initiates vote to skip current song. resets upon hitting a new song or resetting current song.
L	!lastsong<optional>	///Get song information of nth past song, indicates total past song count
						///resets on what, login? 12h?
L	!xAddDef			///Mod only adds to default playlist
L	Convert &#<number>; to correct text
DJ
	Extra bot-only DJ role
	New custom settings IE higher song limits, ability to skip tracks, etc
Youtube
	Rework Youtube.ts to use https://www.npmjs.com/package/ytdl-core so we never run out of API calls.
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
Hosting
	Host on an actual website?


//For spotify
	Could be new song request command "!xspr <search>" or "!xsr sp <search>"


3ventic
Twitch Alumni
Aug 2017
Logging into chat is done by using an oauth token with the chat_login scope. Oauth tokens are given to applications, 
when a user authorizes the application to communicate with Twitch on their behalf, limited by the scopes used in the auth process.

So you need an application to get the chat login token. If you want to do more with the API than just chat, you’ll also need a client ID to use the HTTP API.


*/





// does this array contain results only?
var playlistArray = [];
var currentSong;
var sharedService;
var CLIENT_SECRETID = 'ABC1234';
var BOT_USER_ID = 'CHANGE_ME_TO_YOUR_BOTS_USER_ID'; // This is the User ID of the chat bot
var OAUTH_TOKEN = 'CHANGE_ME'; // Needs scopes user:bot, user:read:chat, user:write:chat
var CLIENT_ID = 'Will_Be_Changed';
var STREAM_ACCOUNT_NAME = '___EMPTIED_PRIOR_TO_COMMIT__'; //need to set for alternative channels
var BOT_ACCOUNT_NAME = 'etherealBot';//need to set for alternative channels
var CHAT_CHANNEL_USER_ID = 'CHANGE_ME_TO_THE_CHAT_CHANNELS_USER_ID'; // This is the User ID of the channel that the bot will join and listen to chat messages of
//What is the channel I am currently in?
var optionalCommandPrefix = '';
const EVENTSUB_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';
var currentDefaultSongNumber = 0;
var websocketSessionID = "";
var ethBotSettings;
var Error401Calls = 0;

// Start executing the bot from here
	// Don't at present want this to start without being invoked in this project.
(async () => {
	// Verify that the authentication is valid
	//await getOAUTH_TOKEN(); //
	//CLIENT_ID = environment.CLIENT_ID;

	//await getUserIDs();

	// Start WebSocket client and register handlers
	//const websocketClient = startWebSocketClient();
})();

export async function externalAccessCall(sentsharedService){

	CLIENT_ID = environment.CLIENT_ID;
	OAUTH_TOKEN = localStorage.getItem('etherealBotTwitchOAuthAccessToken');
	CLIENT_SECRETID = environment.CLIENT_SECRETID;
	sharedService = sentsharedService;
	//await getAppOAUTH_TOKEN();
	await getAdministrativeUserIDs();
	// Start WebSocket client and register handlers

}

async function initializeCommonSettings(sentSharedService){
	// if(sentSharedService == null){
	// 	console.log("sentSharedService is null");
	// }
	// if(sentSharedService == undefined){
	// 	console.log("sentSharedService is undefined");
	// } else if (sentSharedService != undefined && sentSharedService != null){
	// 	console.log("sentSharedService is defined");

	// }

	CLIENT_ID = environment.CLIENT_ID;
	CLIENT_SECRETID = environment.CLIENT_SECRETID;
	sharedService = sentSharedService;
	BOT_USER_ID = localStorage.getItem('etherealBotBotUserId');
	CHAT_CHANNEL_USER_ID = localStorage.getItem('etherealBotChatChannelUserId');
	STREAM_ACCOUNT_NAME = localStorage.getItem('etherealBotStreamAccountName');
	OAUTH_TOKEN = localStorage.getItem('etherealBotTwitchOAuthAccessToken');


	initializeSubscribers();

	//console.log("before getSettings call");
	ethBotSettings = await getSettings(OAUTH_TOKEN, STREAM_ACCOUNT_NAME);
	console.log("ethBotSettings");
	console.log(ethBotSettings);
}

export function getStreamAccountName(){
	return STREAM_ACCOUNT_NAME;
}

export function getOAuthToken(){
	return OAUTH_TOKEN;
}

export function getBotSettings(){
	return ethBotSettings;
}

export function getCurrentSong(){
	return currentSong;
}

export async function initializeWebSocket(sentSharedService){
	await initializeCommonSettings(sentSharedService);
	loadPlaylistFromBackend(sentSharedService);
	const websocketClient = startWebSocketClient();
}

export async function tryTwitchUserTokenRefresh(sentSharedService){
	await initializeCommonSettings(sentSharedService);

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
	console.log("Refreshed Twitch Token!");
	//console.log(json);
	localStorage.setItem('etherealBotTwitchOAuthAccessToken', json.access_token);
	localStorage.setItem('etherealBotTwitchRefreshToken', json.refresh_token);
	OAUTH_TOKEN = json.access_token;
	loadPlaylistFromBackend(sentSharedService);
	const websocketClient = startWebSocketClient();
	return '';


}


function initializeSubscribers(){
	
	sharedService.GetUpdateActiveSongHook().subscribe((value)=>{
		updateActiveSongBackend(value, OAUTH_TOKEN, STREAM_ACCOUNT_NAME);});
	sharedService.GetUpdateDragDropSongHook().subscribe((value)=>{
		updateSongPlaylistBackend(value, OAUTH_TOKEN, STREAM_ACCOUNT_NAME);
	});
	sharedService.GetUpdateDragDropSongHookRenumber().subscribe((value)=>{
		updateSongPlaylistBackend(value, OAUTH_TOKEN, STREAM_ACCOUNT_NAME);
	});

}

export async function addTrackToDefaultList(newTrack){
	await addTrackToDefaultBackend(newTrack, OAUTH_TOKEN, STREAM_ACCOUNT_NAME);
}

export async function getNextDefaultTrack(){

	let json = await getNextDefaultTrackFromBackend(currentDefaultSongNumber, OAUTH_TOKEN, STREAM_ACCOUNT_NAME);

	//updateCurrentSong here
	if(json.hasOwnProperty("data")){
		if(json.data.hasOwnProperty("trackInfo")){
			currentSong = json.data.trackInfo;
		}
		if(json.data.hasOwnProperty("trackNo")){
			currentDefaultSongNumber = json.data.trackNo;
		}

		if(json.data.hasOwnProperty("trackInfo")){
			return json.data.trackInfo;
		}
	
	}

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

export async function getAdministrativeUserIDs(){

	console.log('Calling getUserIDs\n');

	var results = await getBotUserId(BOT_ACCOUNT_NAME, OAUTH_TOKEN, sharedService);
	if (results != ''){
		console.log(results);
		BOT_USER_ID = results;
		localStorage.setItem('etherealBotBotUserId', BOT_USER_ID);
		console.log('Assigned sender_id as: ' + results);
	} else {
		return process.exit(1);
	}

	
	const ownIDresponse = await fetch('https://api.twitch.tv/helix/users'  , {
		method: 'GET',
		headers: {
			"Client-ID": CLIENT_ID,
			"Authorization": "Bearer "+ OAUTH_TOKEN,
		},
	});
	

	if (ownIDresponse.status != 200 && ownIDresponse.status != 401) {
		let data = await ownIDresponse.json();
		console.log('Twitch errored out on self-ID request.');
	} else if (ownIDresponse.status == 401 && Error401Calls == 0){
		console.log("401 Errored. I hope nothing breaks!");
		Error401Calls = 1;
		if(await tryTwitchUserTokenRefresh(sharedService) == ''){
			getAdministrativeUserIDs();
		}
		
		return;
	} else if (ownIDresponse.status == 401 && Error401Calls != 0){
		Error401Calls = 0;
		return;
	}

	let json2 = await ownIDresponse.json();
	console.log(json2.data[0].display_name);
	CHAT_CHANNEL_USER_ID = json2.data[0].id;
	STREAM_ACCOUNT_NAME = json2.data[0].display_name;	
	localStorage.setItem('etherealBotChatChannelUserId', CHAT_CHANNEL_USER_ID);
	localStorage.setItem('etherealBotStreamAccountName', STREAM_ACCOUNT_NAME);
	localStorage.setItem('etherealBotProfileImageUrl', json2.data[0].profile_image_url)
	console.log('Assigned broadcaster_id as: ' + json2.data[0].display_name);
	console.log('etherealBotProfileImageUrl from getAdministrativeUserIDs is: ' + localStorage.getItem('etherealBotProfileImageUrl'));
}


function startWebSocketClient() {
	let websocketClient = new WebSocket(EVENTSUB_WEBSOCKET_URL);
	//websocketClient.onerror = ((socket, ev) => console.log(ev.toString));
	//websocketClient.onerror?((sender, e) => {console.error;}): 
	//console.log("I don't know what is happening with onerror Trigger");

	//websocketClient.onopen = ((sender, ev) => 
		//console.log('WebSocket connection opened to ' + EVENTSUB_WEBSOCKET_URL)
	///);
	websocketClient.onmessage = ((data) =>
		handleWebSocketMessage(JSON.parse(data.data.toString()))
	);

	return websocketClient;
}


function handleWebSocketMessage(data) {
	// console.log(data);
	switch (data.metadata.message_type) {
		case 'session_welcome': // First message you get from the WebSocket server when connecting
			websocketSessionID = data.payload.session.id; // Register the Session ID it gives us

			// Listen to EventSub, which joins the chatroom from your bot's account
			registerEventSubListeners();
			break;
		case 'notification': // An EventSub notification has occurred, such as channel.chat.message
			switch (data.metadata.subscription_type) {   ///////////channel.channel_points_automatic_reward_redemption.add
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
					if (startsWith('!'+ optionalCommandPrefix + 'sr', messageText)){
						addSongToQueue(getFirstArgOfCommand(messageText), sender);

					} else if (startsWith('!'+ optionalCommandPrefix + 'nextsong', messageText)){
						
						nextSongInQueue(sender);

					} else if (startsWith('!'+ optionalCommandPrefix +'song', messageText)){
						if (currentSong != undefined && currentSong != null){
							sendChatMessage('The current song is ' + decodeTextForOutput(currentSong.songTitle) + ' by ' + decodeTextForOutput(currentSong.channelTitle) + '. It was requested by ' + currentSong.requestedBy + '.' + ' https://youtu.be/' + currentSong.videoId);
						} else{
							sendChatMessage('There is no current song!');
						}
					} else if (startsWith('!'+ optionalCommandPrefix +'wrongsong', messageText)){
						wrongSong(sender);
					}
					else if(startsWith('!'+ optionalCommandPrefix +'cutdefault', messageText)){
						preprocessRemoveFromDefaultPlaylist(sender);
					}
					else if(startsWith('!'+ optionalCommandPrefix +'play', messageText)){
						console.log("calling play");
						tryResumePlaylist(sender);
					}
					else if(startsWith('!'+ optionalCommandPrefix +'pause', messageText)){
						tryPausePlaylist(sender);
					}
					else if(startsWith('!'+ optionalCommandPrefix +'songlist', messageText)){
						tryGetSongList(sender);
					}
					break;
				case 'channel.channel_points_custom_reward_redemption.add':
					console.log('HIT channel.channel_points_custom_reward_redemption.add');
					//data.payload.event.user_input
					//data.payload.event.reward.title
					if (data.payload.event.reward.title == "Add Song"){
					addSongToQueue(getFirstArgOfCommand(data.payload.event.user_input), 'The bourgeoisie');
					}
					break;
			}
			break;
		case 'session_keepalive':
			//sendChatMessage('I am working?');
			break;


	}

}

async function tryGetSongList(sender){
	sendChatMessage("Sorry @" + sender + ", this web server is not currently being publically hosted, but if it were it would be something like localhost:4200/?uid=" + STREAM_ACCOUNT_NAME);
}

async function tryResumePlaylist(sender){
	if(await resumePlaylist(sharedService, sender, OAUTH_TOKEN, CHAT_CHANNEL_USER_ID)){

	}
	else{
		sendChatMessage("Sorry @" + sender + ", you are not the owner of the channel or a Moderator");
	}
}
async function tryPausePlaylist(sender){
	if(await pausePlaylist(sharedService, sender, OAUTH_TOKEN, CHAT_CHANNEL_USER_ID)){

	}else{
		sendChatMessage("Sorry @" + sender + ", you are not the owner of the channel or a Moderator");	
	}
}

async function preprocessRemoveFromDefaultPlaylist(sender){
	if (await isMod(sender, OAUTH_TOKEN, CHAT_CHANNEL_USER_ID) || isOwner(sender)){
		let results = await removeFromDefaultPlaylist(currentSong, OAUTH_TOKEN, STREAM_ACCOUNT_NAME);
		if (results == true){
			sendChatMessage("Successfully removed " + decodeTextForOutput(currentSong.songTitle) + " from default playlist.");
		}
		else{
			sendChatMessage("Something went wrong when I tried removing " + decodeTextForOutput(currentSong.songTitle) + " from default playlist!");
		}
	}	
}

function wrongSong(sender){
	if(playlistArray.length > 0){
		for (let i = playlistArray.length; i > 0; i--) {
			if (playlistArray[i-1].requestedBy == sender){
				//remove from array
				removeSongFromBackend(playlistArray[i-1], OAUTH_TOKEN, STREAM_ACCOUNT_NAME);
				sendChatMessage('Removed ' + decodeTextForOutput(playlistArray[i-1].songTitle) + ' by ' + decodeTextForOutput(playlistArray[i-1].channelTitle) + ' from playlist.');
				playlistArray.splice(i-1,1);
				sharedService.sendUpdateDragDropSongHookRenumber(playlistArray);
				i = 0; //halt iteration.
			}
		}
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

export async function deletePlaylistAtLocation(ytVideoInfo){

	console.log('Removed:' + playlistArray.splice(ytVideoInfo.position -1, 1));
	console.log(sharedService);
	await removeSongFromBackend(ytVideoInfo, OAUTH_TOKEN, STREAM_ACCOUNT_NAME);
	await sharedService.sendUpdateDragDropSongHook(playlistArray);
}

export function peekPlaylist(){
	return peekPlaylistN(0);
}
//Peek at xth space in playlist
export function peekPlaylistN(location){
	return playlistArray.at(location);
}

function nextSongInQueue(sender){
	if(isMod(sender, OAUTH_TOKEN, CHAT_CHANNEL_USER_ID) || isOwner(sender)){
		return playNextSong(sharedService);
	}
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

	var tempPlaylistArray = await getPlaylistFromBackend(OAUTH_TOKEN, STREAM_ACCOUNT_NAME);
	if (tempPlaylistArray != null && tempPlaylistArray != undefined){
		for (const track of tempPlaylistArray) {
			playlistArray.push(generateYTVI(track));

		}
	}
	var tempCurrentSong = await getCurrentSongFromBackend(OAUTH_TOKEN, STREAM_ACCOUNT_NAME);
	//console.log(tempCurrentSong);
	if (tempCurrentSong != null && tempCurrentSong != undefined && tempCurrentSong.length > 0 && tempCurrentSong[0].videoId != null && tempCurrentSong[0].videoId != undefined){
			currentSong = generateYTVI(tempCurrentSong[0]);
			sharedService.sendUpdateActiveSongHookNoDB(currentSong);// solely updates front-end video content
	//		console.log('rantempCurrentSongStuff');
	}
	if ((currentSong == null || currentSong == undefined) && playlistArray.length > 0){
	//	console.log('getting a new currentSong I hope');
		sharedService.sendUpdateActiveSongHook(popPlaylist());
	}
	if ((currentSong == null || currentSong == undefined) && playlistArray.length <= 0){
		var tempYTVI = await getNextDefaultTrack();
	//	console.log("currentDefaultSongNumber = " + currentDefaultSongNumber);
		if (tempYTVI != undefined && tempYTVI != null){
			sharedService.sendUpdateActiveSongHook(tempYTVI);
		}
	}
	sharedService.sendUpdateDragDropSongHook(playlistArray);
}




function addSongConfirmMessage(ytVI){

	// 'Added ' + result.songTitle + ' to queue in position ' + playlistArray.length + '!'
	var durationText = sumActivePlaylistTime(playlistArray, currentSong);
	if (durationText == "0 seconds"){
		return 'Added '+ decodeTextForOutput(ytVI.songTitle) + ' to queue in position ' + playlistArray.length + ' (playing immediately)';
	}
	else{
		return 'Added '+ decodeTextForOutput(ytVI.songTitle) + ' to queue in position ' + playlistArray.length + ' (playing in ' + sumActivePlaylistTime(playlistArray, currentSong) + ')';
	}
}


export function isOwner(userName){
	if (userName == STREAM_ACCOUNT_NAME){
		return true;
	}
	return false;
}

async function addSongToQueue(songArg, sender){

	console.log("in addSongToQueue");
	if(isYoutubeURI(songArg)){
		console.log("TopHalf");
		const regex = /^.*watch\?v=([A-Za-z0-9-_]*)(\W.*)?$/i;
		songArg = songArg.replace(regex, "$1");
		console.log("songArg = " + songArg);
		var ytVI = new youtubeVideoInfo(songArg, "", "");
		await getYoutubeVideoByID(ytVI);
		console.log(sender);
		ytVI.requestedBy = sender;
		console.log('ytVI.RequestedBy = ' + ytVI.requestedBy);
		ytVI.position = playlistArray.length + 1;

		///////////////////validate video settings
		console.log("pre-validation");
		var valResults = await validateVideoSettings(ytVI, ethBotSettings, playlistArray, OAUTH_TOKEN, CHAT_CHANNEL_USER_ID);
		console.log("validation results = " + valResults);
		console.log(ytVI);
		if(valResults == "Success"){
			playlistArray.push(ytVI);
			sendChatMessage(addSongConfirmMessage(ytVI));
		} else{
			sendChatMessage(addSongFailMessage(valResults, ytVI));
			return;
		}	
	}
	else{
		var result = await getFirstYoutubeResult(songArg);
		if(result.songTitle != null && result.songTitle != undefined && result.songTitle != ""){
			result.requestedBy = sender;
			result.position = playlistArray.length + 1;

			/////////////////validate video settings
			var valResults = await validateVideoSettings(result, ethBotSettings, playlistArray, OAUTH_TOKEN, CHAT_CHANNEL_USER_ID);
			if(valResults == "Success"){
				playlistArray.push(result);
				sendChatMessage(addSongConfirmMessage(result));
			} else{
				sendChatMessage(addSongFailMessage(valResults, result));
				return;
			}
		}
		else{
			sendChatMessage('Something went wrong when adding ' + decodeTextForOutput(songArg)+ ' to the list, sorry!');	
		}
	}

	if (currentSong == undefined && playlistArray.length > 0){
		
		sharedService.sendUpdateActiveSongHook(popPlaylist());

	}

	if (currentSong != undefined && playlistArray.length > 0 && playlistArray != null && playlistArray != undefined && playlistArray.length > 0){

		addTrackToBackend(playlistArray[playlistArray.length-1], OAUTH_TOKEN, STREAM_ACCOUNT_NAME); 
		sharedService.sendUpdateDragDropSongHook(playlistArray);
	}	



}


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
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			broadcaster_id: CHAT_CHANNEL_USER_ID,
			sender_id: CHAT_CHANNEL_USER_ID,//BOT_USER_ID,
			message: chatMessage
		})
	});

	if (response.status != 200 && response.status != 401) {
		let data = await response.json();
		//console.error("Failed to send chat message");
		//console.error(data);
	} else if (response.status == 401 && Error401Calls == 0){
		console.log("401 Errored. I hope nothing breaks!");
		Error401Calls = 1;
		if(await tryTwitchUserTokenRefresh(sharedService) == ''){
			sendChatMessage(chatMessage);
		}
		
		return;
	} else if (response.status == 401 && Error401Calls != 0){
		Error401Calls = 0;
		return;
	}
}



async function registerEventSubListeners() {
	if (await registerEventSubListener('channel.chat.message')){
		registerEventSubListener('channel.channel_points_custom_reward_redemption.add');
	}
	return;
}


async function registerEventSubListener(eventType){
	// Register channel.chat.message
	let response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			type: eventType,
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



	if (response.status != 202 && response.status != 401) {
		let data = await response.json();
	} else if (response.status == 401 && Error401Calls == 0){
		console.log("401 Errored. I hope nothing breaks!");
		Error401Calls = 1;
		if(await tryTwitchUserTokenRefresh(sharedService) == ''){
			return await registerEventSubListener();
		}
		else{
			return false;
		}
	} else if (response.status == 401 && Error401Calls != 0){
		Error401Calls = 0;
		return false;
	} else if (response.status == 403){
		console.log('403 error on '+ eventType + ' subscription');
		return false;
	}else {
		const data = await response.json();
		return true;
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