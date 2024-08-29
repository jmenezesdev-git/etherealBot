//import { environment } from './app/environment';
import { first } from 'rxjs';
import {environment} from './app/environment';
import { getFirstYoutubeResult } from './app/apiFunctions/youtube';
//import { Console } from 'console';
//const { Console } = require("console");











/*

COMPLETED
	Basic OAuth
	Twitch Connection
	Youtube Playlist/Queue core functions
	!xsr for a youtube video
	it will autoplay the next track in queue
	next button will dredge up the next track and play it.
	OAuth no longer assumes a default username


#	= High priority
WIP = Work in Progress
L	= Low Priority



URGENT:	youtube search incomplete
NEXT: xsr change to youtube search return first result, xsr provides feedback as to remaining time and newly added songname
THEN:	
Frontend Queue interface
#	Drag & Drop interface to reorder?
	List includes the following:
		Video/Song Name
		Requested By
		Duration
		Option to delete from queue
		Option to add to default Queue
Frontend Settings interface
#	Length Limit
#	Songs Per User
#	Default Playlist	///Plays when there are no songs in queue
						///first song is the default when a user logs in or opens the page
L	Voteskip Count
L	Disabling commands	
L	Enable Spotify/YT 	
Chat Commands
WIP	!xsr <required>		///add arg1 to song queue, when in doubt it is YT song.
	!xskip				///Mod only skip current song (same as next)
	!xwrongsong			///removes users latest song from queue
#	!xsong 				///Indicates currently playing song information
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
Cookies
#	Remember my login
	NEED TO CHANGE OAUTH TOKEN GENERATION TO BE OPTIONAL/OCCASIONAL	
Database
	Remember my playlists & settings outside of cookies
	mongodb for the lulz?
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
var playlistArray = ['https://www.youtube.com/watch?v=ZXZZZZZZZ', 'https://www.youtube.com/watch?v=aYzt6WJEx10', 'https://www.youtube.com/watch?v=ocQ7sFFxOh4&pp=ygUJaW4gZmxhbWVz', 'https://www.youtube.com/watch?v=LQXgNLGDPgo&pp=ygUZZWR1Y2F0ZWQgZm9vbCBpcm9uIG1haWRlbg%3D%3D'];

var CLIENT_SECRETID = 'ABC1234';
var BOT_USER_ID = 'CHANGE_ME_TO_YOUR_BOTS_USER_ID'; // This is the User ID of the chat bot
var OAUTH_TOKEN = 'CHANGE_ME'; // Needs scopes user:bot, user:read:chat, user:write:chat
var CLIENT_ID = 'Will_Be_Changed';
var STREAM_ACCOUNT_NAME = '___EMPTIED_PRIOR_TO_COMMIT__'; //need to set for alternative channels
var BOT_ACCOUNT_NAME = 'etherealBot';//need to set for alternative channels
var APP_OAUTH_TOKEN = 'I_AM_SET_BY_CODE';
var CHAT_CHANNEL_USER_ID = 'CHANGE_ME_TO_THE_CHAT_CHANNELS_USER_ID'; // This is the User ID of the channel that the bot will join and listen to chat messages of
//What is the channel I am currently in?

const EVENTSUB_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';

var websocketSessionID = "";

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

export async function externalAccessCall(){
	CLIENT_ID = environment.CLIENT_ID;
	OAUTH_TOKEN = environment.TwitchOAuthAccessToken;
	CLIENT_SECRETID = environment.CLIENT_SECRETID;
	//await getAuth();
	await getAppOAUTH_TOKEN();
	await getAdministrativeUserIDs();
	// Start WebSocket client and register handlers
	const websocketClient = startWebSocketClient();

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
	console.log('Assigned broadcaster_id as: ' + json2.data[0].display_name);

	//console.log(json);
	//console.log("The Chat channel user id = " + CHAT_CHANNEL_USER_ID);
	//console.log("The Bot user id = " + BOT_USER_ID);
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
					//console.log(`MSG #${data.payload.event.broadcaster_user_login} <${data.payload.event.chatter_user_login}> ${data.payload.event.message.text}`);

					// Then check to see if that message was "HeyGuys"
					if (data.payload.event.message.text.trim() == "HeyGuys") {
						// If so, send back "VoHiYo" to the chatroom
						sendChatMessage("VoHiYo")
					}
					var messageText = data.payload.event.message.text.toString();
					var sender = data.payload.event.chatter_user_name.toString();
					console.log(messageText);
					if (startsWith('!xsr', messageText)){
						addSongToQueue(getFirstArgOfCommand(messageText));

						

					} else if (startsWith('!xnextSong', messageText)){
						
						nextSongInQueue();

					}
					break;
			}
			break;
		case 'session_keepalive':
			//sendChatMessage('I am working?');
			break;


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
	console.log('returning: ' +firstTrack + ' the next one is: ' + playlistArray.at(0));
	if (firstTrack !== undefined){
		return firstTrack;
	}
	else{
		return "";
	}
}
export function pushPlaylist(message){
	if(isYoutubeURI(message)){
		addSongToQueue(message);
	}
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
	const regex = /https?/i;
	////            s?:\/\/youtu\(.be|be.com\)\/watch\\\?v=\[A-Za-Z0-9\]

	if (messageText.match(regex)){
		return true;
	}
	else{
		return false;
	}
}

function getFirstArgOfCommand(command){
	const regex = /^.*? (\S+).*?$/i;
	//console.log(command.replace(regex, $1))
 return command.replace(regex, "$1");
}

function addSongToQueue(songArg){

	if(isYoutubeURI(messageText)){
		playlistArray.push(songArg);
		sendChatMessage('Added ' + songArg + ' to queue in position ' + playlistArray.length + '!');				
	}
	else{
		var result = getFirstYoutubeResult(songArg);
		playlistArray.push(result);
		sendChatMessage('Added ' + result + ' to queue in position ' + playlistArray.length + '!');	
		//sendChatMessage('@'+ sender + ' invalid Youtube URL detected in ' + messageText);
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



/*

I think in order to post AS the bot. I need to sign in AS the bot somewhere in the chain. 
However, doing so is not scalable for multiple users. Therefore there is likely a second server running at all times to run the bot scripts

Second server - logged in as bot
	EASY
A way to send messages for the bot to interpret and manage event subscribers and who they come from
	BUILD & TEST AN API
		MEDIUM - LONG



*/