var YOUTUBE_API_KEY = 'CHANGE_ME';
const YOUTUBE_OAUTH_TOKEN = "ABC123";
import { environment } from "../environment";

//INCOMPLETE
export async function getFirstYoutubeResult(search:string){
    let YOUTUBE_API_KEY =  environment.YoutubeAPIKey;

    const response = await fetch('https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=' + search + '&key=' + YOUTUBE_API_KEY  , {
		method: 'GET',
		headers: {
			"Accept": 'application/json'
			
		},
	});

	if (response.status != 200) {
		let data = await response.json();
		console.log('Youtube errored out on the search request.');
	}

	const json = await response.json();
	console.log(json);

	var songTitle = "";
	var channelTitle = "";
	var videoId = "";
	var ytVI: youtubeVideoInfo;
	
	if (json.hasOwnProperty("items")){
		console.log("json has items");
		if (json.items[0].hasOwnProperty("snippet")){
			console.log("jsonitems has snippet");
			if (json.items[0].snippet.hasOwnProperty("title")){
				songTitle = json.items[0].snippet.title;
			}
			if (json.items[0].snippet.hasOwnProperty("channelTitle")){
				channelTitle = json.items[0].snippet.channelTitle;
			}
				
		}
		if (json.items[0].hasOwnProperty("id")){
			if (json.items[0].id.hasOwnProperty("videoId")){
				console.log("json.items[0].id.videoId = " + json.items[0].id.videoId)
				videoId = json.items[0].id.videoId;
			}
		}
		ytVI = new youtubeVideoInfo(videoId, songTitle, channelTitle);
		getYoutubeVideoByID(ytVI);
		
		console.log("outputting ytVI");
		console.log(ytVI);
		return ytVI;

	}
    return new youtubeVideoInfo("", "", "");
}


export async function getYoutubeVideoByID(ytVI:youtubeVideoInfo){
    let YOUTUBE_API_KEY =  environment.YoutubeAPIKey;
	const response = await fetch('https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status,snippet&id='+ ytVI.videoId +'&key=' + YOUTUBE_API_KEY  , {
		method: 'GET',
		headers: {
			"Accept": 'application/json'
		},
	});
	if (response.status != 200) {
		let data = await response.json();
		console.log('Youtube errored out on the search request.');
	}


	const json = await response.json();
	// console.log (json);
	if (json.hasOwnProperty("items")){
		if (json.items[0].hasOwnProperty("snippet") && ytVI.songTitle == "" ){
			if (json.items[0].snippet.hasOwnProperty("title")){
				ytVI.songTitle = json.items[0].snippet.title;
			}
		}
		if (json.items[0].hasOwnProperty("contentDetails")){
			if (json.items[0].contentDetails.hasOwnProperty("duration")){
				ytVI.duration = json.items[0].contentDetails.duration;
			}
		}
		if (json.items[0].hasOwnProperty("status")){
			if (json.items[0].status.hasOwnProperty("uploadStatus")){
				ytVI.uploadStatus = json.items[0].status.uploadStatus;
			}
			if (json.items[0].status.hasOwnProperty("failureReason")){
				ytVI.failureReason = json.items[0].status.failureReason;
			}
			if (json.items[0].status.hasOwnProperty("rejectionReason")){
				ytVI.rejectionReason = json.items[0].status.rejectionReason;
			}
			if (json.items[0].status.hasOwnProperty("privacyStatus")){
				ytVI.privacyStatus = json.items[0].status.privacyStatus;
			}
			if (json.items[0].status.hasOwnProperty("license")){
				ytVI.license = json.items[0].status.license;
			}
			if (json.items[0].status.hasOwnProperty("embeddable")){
				ytVI.embeddable = json.items[0].status.embeddable;
			}
			if (json.items[0].status.hasOwnProperty("publicStatsViewable")){
				ytVI.publicStatsViewable = json.items[0].status.publicStatsViewable;
			}
			
			
				
		}
	}

}



export class youtubeVideoInfo{
	//Youtube video information
	uploadStatus = "";
	failureReason = "";
	rejectionReason = "";
	privacyStatus = "";
	license = "";
	embeddable = false;
	publicStatsViewable = false;
	duration = "";
	songTitle = "";
	channelTitle = "";
	videoId = "";
	//Youtube video request information
	requestedBy = "";
	position = -1;
	realTime = "";

	constructor(videoId: string, songTitle: string, channelTitle: string){
		this.videoId = videoId;
		this.songTitle = songTitle;
		this.channelTitle = channelTitle;
	}

	setShortRealTime(){
		this.realTime = this.getShortTime();
	}

	///transferred to Node server
	getShortTime(){
		var days = 0;
		var hours = 0;
		var minutes = 0;
		var seconds = 0;
		const regexp = /PT((\d+)DT)?((\d+)H)?((\d+)M)?(\d+)S/g;

		if (this.duration != null && this.duration != undefined && this.duration.length > 0){
			let matches = this.duration.matchAll(regexp);
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
			
			var returnString = "";
			if (days > 0){
				returnString += days + " d";
			}
			if (hours > 0){
				if (returnString.length > 0){
					returnString += " ";
				}
				returnString += hours + "h";
			}
			if (minutes > 0){
				if (returnString.length > 0){
					returnString += " ";
				}
				returnString += minutes + "m";
			}
			if (seconds > 0){
				if (returnString.length > 0){
					returnString += " ";
				}
				returnString += seconds + "s";
			}
			return returnString;

		}

		return "0 seconds";
	}
	
}

