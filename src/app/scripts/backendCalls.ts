import { botSettings } from "src/botSettings";
import { environment } from "../environment";
import { youtubeVideoInfo } from "./youtube";

var CLIENT_ID = environment.CLIENT_ID;


export async function addTrackToDefaultBackend(newTrack:youtubeVideoInfo, OAUTH_TOKEN: string, STREAM_ACCOUNT_NAME: string){
	var tempRequestedBy = newTrack.requestedBy;
	console.log('newTrack in addTrackToDefaultBackend');
	newTrack.requestedBy = "";
	console.log(newTrack);
	let response = await fetch('http://localhost:3000/addDefaultSong', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
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
		newTrack.requestedBy = tempRequestedBy;
		console.error("Database communication failure: Failed to Add Default Track to Backend");
		console.error(data);
	} else {
		newTrack.requestedBy = tempRequestedBy;
		console.log("Added New Default Song.");
	}
}

export async function updateBotSettings(newSettings: botSettings, OAUTH_TOKEN: string, STREAM_ACCOUNT_NAME: string){
	console.log("testing variable presence: " + STREAM_ACCOUNT_NAME);
	const updateSettingsResponse = await fetch('http://localhost:3000/updateSettings', {
		method: 'PUT',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		
		body: JSON.stringify({
			userId: STREAM_ACCOUNT_NAME,
			settings: newSettings,
		}),
	});
	

	if (updateSettingsResponse.status != 200) {
		let data = await updateSettingsResponse.json();
		console.log('My backend server errored out on the getSettings request.');
		return false;
	}

	let json = await updateSettingsResponse.json();
	console.log(json);
	return true;
}

export async function getSettings(OAUTH_TOKEN: string, STREAM_ACCOUNT_NAME: string){

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
	return new botSettings(json.data.lengthLimit, json.data.songsPerUser, json.data.streamChannel, json.data.lengthLimitMod, json.data.songsPerUserMod);
}

export async function updateActiveSongBackend(value: youtubeVideoInfo, OAUTH_TOKEN: string, STREAM_ACCOUNT_NAME: string){ //single YTVI
	console.log('value in updateActiveSongBackend');
	console.log(value);
	let response = await fetch('http://localhost:3000/currentSong', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
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

export async function updateSongPlaylistBackend(value: youtubeVideoInfo[], OAUTH_TOKEN: string, STREAM_ACCOUNT_NAME: string){ //multiple YTVI in order
	//push a newly ordered playlist into the backend
	//this could contain 1 new item or none.
	//console.log('value in updateSongPlaylistBackend');
	//console.log(value);
	let response = await fetch('http://localhost:3000/rearrangeSongs', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
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
		//console.log("Rearranged Tracks Successfully!");
	}
}

export async function addTrackToBackend(newTrack: youtubeVideoInfo, OAUTH_TOKEN: string, STREAM_ACCOUNT_NAME: string){ //YTVI's latest
	console.log('newTrack in addTrackToBackend');
	console.log(newTrack);
	let response = await fetch('http://localhost:3000/addSong', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
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

export async function getNextDefaultTrackFromBackend(currentDefaultSongNumber: number, OAUTH_TOKEN: string, STREAM_ACCOUNT_NAME: string){
	const playlistResponse = await fetch('http://localhost:3000/nextDefaultTrack?userid=' + STREAM_ACCOUNT_NAME + '&trackno=' + currentDefaultSongNumber, {
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
	return json; //this contains the data for the user's playlist
}

export async function removeSongFromBackend(track: youtubeVideoInfo, OAUTH_TOKEN: string, STREAM_ACCOUNT_NAME: string){
	console.log('newTrack in addTrackToBackend');
	console.log(track);
	let response = await fetch('http://localhost:3000/deleteSong', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
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
		console.error("Database communication failure: Failed to Remove track from Backend");
		console.error(data);
	} else {
		console.log("Removed Song.");
	}

}

export async function removeFromDefaultPlaylist(currentSong: youtubeVideoInfo, OAUTH_TOKEN: string, STREAM_ACCOUNT_NAME: string){
	//Untested
	console.log('remove from DefaultPlaylist');
	// console.log(track);
	let response = await fetch('http://localhost:3000/deleteDefault', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			track: currentSong,
			userId: STREAM_ACCOUNT_NAME,
		})
	});

	if (response.status != 200) {
		let data = await response.json();
		console.error("Database communication failure: Failed to Remove track from Backend");
		return false;
		// console.error(data);
	} else {
		console.log("Removed Song.");
		return true;
	}

}

export async function getCurrentSongFromBackend(OAUTH_TOKEN: string, STREAM_ACCOUNT_NAME: string){
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

export async function getPlaylistFromBackend(OAUTH_TOKEN: string, STREAM_ACCOUNT_NAME: string){

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
	// console.log(json.data);//this contains the data for the user's playlist
	return json.data;
}