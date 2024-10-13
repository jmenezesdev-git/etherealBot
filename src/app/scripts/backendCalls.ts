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