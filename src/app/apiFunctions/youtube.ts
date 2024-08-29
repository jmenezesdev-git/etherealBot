var YOUTUBE_API_KEY = 'CHANGE_ME';
const YOUTUBE_OAUTH_TOKEN = "ABC123";
import { environment } from "../environment";

//INCOMPLETE
export async function getFirstYoutubeResult(search:string){
    let YOUTUBE_API_KEY =  environment.YoutubeAPIKey;


    const response = await fetch('https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=' + search +'&key=' + YOUTUBE_API_KEY  , {
		method: 'GET',
		headers: {
			"Accept": 'application/json',
			"Authorization": "Bearer "+ YOUTUBE_OAUTH_TOKEN,
		},
	});
	//.then(response => response.json()).then(data => OAUTH_TOKEN=data.access_token);
    



	if (response.status != 200) {
		let data = await response.json();
		console.log('Youtube errored out on the search request.');
	}

	const json = await response.json();
	console.log(json);
//.data[0].items[0]

	//I think we are assigning correctly. 403 is from bot's permissions on main account 
//json.data[0].display_name 




    return "";
}