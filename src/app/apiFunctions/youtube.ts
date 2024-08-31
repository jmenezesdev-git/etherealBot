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

		//https://www.googleapis.com/youtube/v3/videos
		//
		const response = await fetch('https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status&id='+ videoId +'&key=' + YOUTUBE_API_KEY  , {
			method: 'GET',
			headers: {
				"Accept": 'application/json'
				//"Authorization": "Bearer "+ YOUTUBE_OAUTH_TOKEN,
			},
		});
		if (response.status != 200) {
			let data = await response.json();
			console.log('Youtube errored out on the search request.');
		}

		ytVI = new youtubeVideoInfo(videoId, songTitle, channelTitle);

		const json2 = await response.json();
		console.log (json2);
		if (json2.hasOwnProperty("items")){
			if (json2.items[0].hasOwnProperty("contentDetails")){
				if (json2.items[0].contentDetails.hasOwnProperty("duration")){
					let duration = json2.items[0].contentDetails.duration;
				}
			}
			if (json2.items[0].hasOwnProperty("status")){
				if (json2.items[0].status.hasOwnProperty("uploadStatus")){
					ytVI.uploadStatus = json2.items[0].status.uploadStatus;
				}
				if (json2.items[0].status.hasOwnProperty("failureReason")){
					ytVI.failureReason = json2.items[0].status.failureReason;
				}
				if (json2.items[0].status.hasOwnProperty("rejectionReason")){
					ytVI.rejectionReason = json2.items[0].status.rejectionReason;
				}
				if (json2.items[0].status.hasOwnProperty("privacyStatus")){
					ytVI.privacyStatus = json2.items[0].status.privacyStatus;
				}
				if (json2.items[0].status.hasOwnProperty("license")){
					ytVI.license = json2.items[0].status.license;
				}
				if (json2.items[0].status.hasOwnProperty("embeddable")){
					ytVI.embeddable = json2.items[0].status.embeddable;
				}
				if (json2.items[0].status.hasOwnProperty("publicStatsViewable")){
					ytVI.publicStatsViewable = json2.items[0].status.publicStatsViewable;
				}
				
				
				 
			}
		}
		console.log("outputting ytVI");
		console.log(ytVI);
		return ytVI;

	}


//.data[0].items[0]

	//I think we are assigning correctly. 403 is from bot's permissions on main account 
//json.data[0].display_name 




    return new youtubeVideoInfo("", "", "");
}

class youtubeVideoInfo{
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

	constructor(videoId: string, songTitle: string, channelTitle: string){
		this.videoId = videoId;
		this.songTitle = songTitle;
		this.channelTitle = channelTitle;
	}
}