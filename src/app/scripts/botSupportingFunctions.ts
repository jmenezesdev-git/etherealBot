import { botSettings } from "src/botSettings";
import { environment } from "../environment";
import { youtubeVideoInfo } from "./youtube";
import { getNextDefaultTrack, isOwner, peekPlaylist, popPlaylist, tryTwitchUserTokenRefresh } from "src/bot";
import { SharedService } from "../shared.service";


var CLIENT_ID = environment.CLIENT_ID;
var Error401Calls = 0;

export async function isMod(userName: string, OAUTH_TOKEN: string, CHAT_CHANNEL_USER_ID: string){

	//GET https://api.twitch.tv/helix/users
	const userResponse = await fetch('https://api.twitch.tv/helix/users?&login=' + userName  , {
		method: 'GET',
		headers: {
			"Client-ID": CLIENT_ID,
			"Authorization": "Bearer "+ OAUTH_TOKEN,
		},
	});

	if (userResponse.status != 200) {
		let data = await userResponse.json();
		console.log('Twitch errored out on isMod\'s userID request.');
		return false;
	}

	const json2 = await userResponse.json();
	//console.log(json2.data);
	let tempUserId = json2.data[0].id;

	//GET https://api.twitch.tv/helix/moderation/moderators
	//console.log('Calling isMod\n');
	const moderatorResponse = await fetch('https://api.twitch.tv/helix/moderation/moderators?broadcaster_id='+ CHAT_CHANNEL_USER_ID +'&user_id=' + tempUserId  , {
		method: 'GET',
		headers: {
			"Client-ID": CLIENT_ID,
			"Authorization": "Bearer "+ OAUTH_TOKEN,
		},
	});

	if (moderatorResponse.status != 200) {
		let data = await moderatorResponse.json();
		console.log('Twitch errored out on isMod request.');
		return false
	}

	const json = await moderatorResponse.json();
	if (json.data.length > 0){
		return true;
	}
	return false;

}

export async function validateVideoSettings(ytVI: youtubeVideoInfo, ethBotSettings: botSettings, playlistArray: youtubeVideoInfo[], OAUTH_TOKEN: string, CHAT_CHANNEL_USER_ID: string){

	console.log("validateVideoSettings");
	console.log(ethBotSettings.lengthLimit);

	//need to get twitchInfo for requesting user
	//display name = ytVI.requestedBy
				//if mods can't override and not the Owner or mods can override and not mod or owner
	if( (!(ethBotSettings.lengthLimitMod) && !(isOwner(ytVI.requestedBy))) || (ethBotSettings.lengthLimitMod && !(await isMod(ytVI.requestedBy, OAUTH_TOKEN, CHAT_CHANNEL_USER_ID)) && !(isOwner(ytVI.requestedBy))) ){
	
		if (ethBotSettings.lengthLimit != "-1"){
			console.log(youtubeVideoInfo.getRelativeDate(ytVI.duration).getTime());
			console.log(youtubeVideoInfo.getRelativeDate(ethBotSettings.lengthLimit).getTime());

			if ( youtubeVideoInfo.getRelativeDate(ytVI.duration).getTime() > youtubeVideoInfo.getRelativeDate(ethBotSettings.lengthLimit).getTime()){ ///good odds this needs changing.
				console.log ("less than duration")
				return "This track exceeds your maximum duration limit";
			}
		}
	}

	if( (!(ethBotSettings.songsPerUserMod) && !(isOwner(ytVI.requestedBy))) || (ethBotSettings.songsPerUserMod && !(await isMod(ytVI.requestedBy, OAUTH_TOKEN, CHAT_CHANNEL_USER_ID)) && !(isOwner(ytVI.requestedBy))) ){
		if(ethBotSettings.songsPerUser > -1 && playlistArray != null && playlistArray != undefined && playlistArray.length > 0){
			
			var userSongsCount = playlistArray.filter(p => p.requestedBy == ytVI.requestedBy).length;
			if(userSongsCount > ethBotSettings.songsPerUser){
				return "Each person may only have " + ethBotSettings.songsPerUser + " tracks in the queue at once.";
			}
		}
	}

	return "Success";
}


export function addSongFailMessage(errorMessage: any, ytVI: youtubeVideoInfo){
	return "@" + ytVI.requestedBy + " I was unable to add your track to the queue. " + errorMessage;

}

export async function getBotUserId(BOT_ACCOUNT_NAME: string, OAUTH_TOKEN: string, sharedService:SharedService){

    const botIDresponse = await fetch('https://api.twitch.tv/helix/users?login=' + BOT_ACCOUNT_NAME  , {
		method: 'GET',
		headers: {
			"Client-ID": CLIENT_ID,
			"Authorization": "Bearer "+ OAUTH_TOKEN,
		},
	});

	if (botIDresponse.status != 200 && botIDresponse.status != 401) {
		let data = await botIDresponse.json();
		console.log('Twitch errored out on Bot-ID request.');
		return '';
	} else if (botIDresponse.status == 401 && Error401Calls == 0){
		console.log("401 Errored. I hope nothing breaks!");
		Error401Calls = 1;
		if(await tryTwitchUserTokenRefresh(sharedService) == ''){
			return await getBotUserId(BOT_ACCOUNT_NAME, OAUTH_TOKEN, sharedService);
		}
		else{
			return '';
		}
	} else if (botIDresponse.status == 401 && Error401Calls != 0){
		Error401Calls = 0;
		return '';
	}

	const json = await botIDresponse.json();
	console.log(json.data[0].display_name);
	//I think we are assigning correctly. 403 is from bot's permissions on main account 
	if (json.data[0].display_name != ""){
		return json.data[0].id;
	}
    return '';

}

export async function playNextSong(sharedService: SharedService){
	if (peekPlaylist() != undefined){
		sharedService.sendUpdateActiveSongHook(popPlaylist());
		return peekPlaylist().videoId;
	  }
	  else{
		var tempYTVI = await getNextDefaultTrack();
		if (tempYTVI != undefined && tempYTVI != null){
		  console.log("tempVI is defined");
		  console.log(tempYTVI);
		  sharedService.sendUpdateActiveSongHook(tempYTVI);
		  return tempYTVI.videoId;
		}
  
		console.log('Playlist is empty you fool!');
		return "";
	  }
}

export function generateYTVI(track: youtubeVideoInfo){
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
    return ytVI;
}

export function sumActivePlaylistTime(playlistArray: youtubeVideoInfo[], currentSong: youtubeVideoInfo){
    //time from youtube videos is of the format:  P#DT#H#M#S where # is a series of numbers and #DT, #H, #M are optional depending on video length
    var days = 0;
    var hours = 0;
    var minutes = 0;
    var seconds = 0;

    const regexp = /PT((\d+)DT)?((\d+)H)?((\d+)M)?((\d+)S)?/g;
    if (playlistArray != undefined && playlistArray.length > 0 && currentSong != undefined){
        
        console.log("inside first IF for sumActivePlaylistTime. Len= " + playlistArray.length);
        for (let i = 0; i < playlistArray.length; i++) {
            let tempM = playlistArray.at(i);
            if (tempM != undefined && tempM != null){
                console.log("TempM.duration= " + tempM.duration);
                let matches = tempM.duration.matchAll(regexp);
                for (const match of matches) {
                    console.log("match=" + match);
                    if (match.length > 8){
                        if(match[2] != undefined){
                            days += Number(match[2]);
                        }
                        if (match[4] != undefined){
                            hours += Number(match[4]);
                        }
                        if (match[6] != undefined){
                            minutes += Number(match[6]);
                        }
                        if (match[8] != undefined){
                            seconds += Number(match[8]);
                        }
                    }
                }
            }
        }
        if (currentSong != null && currentSong != undefined && currentSong.duration.length > 0){
            let matches = currentSong.duration.matchAll(regexp);
            for (const match of matches) {
                if (match.length > 8){
                    if(match[2] != undefined){
                        days += Number(match[2]);
                    }
                    if (match[4] != undefined){
                        hours += Number(match[4]);
                    }
                    if (match[6] != undefined){
                        minutes += Number(match[6]);
                    }
                    if (match[8] != undefined){
                        seconds += Number(match[8]);
                    }
                }
            }
        }
        while (seconds>59){
            seconds = seconds - 60;
            minutes+=1;
        }
        while (minutes>59){
            minutes = minutes - 60;
            hours+=1;
        }
        while (hours>23){
            hours = hours - 24;
            days+=1;
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

export function decodeTextForOutput(text: string){
    text = text.replaceAll("&amp;", "&").replaceAll("&nbsp;", " ").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"").replaceAll("&apos;", "'").replaceAll("&cent;", "¢").replaceAll("&pound;", "£").replaceAll("&yen;", "¥").replaceAll("&euro;", "€").replaceAll("&copy;", "©").replaceAll("&reg;", "®");

    return text;
}

export async function resumePlaylist(sharedService: SharedService, sender: string, OAUTH_TOKEN: string, CHAT_CHANNEL_USER_ID: string){
    if(await isMod(sender, OAUTH_TOKEN, CHAT_CHANNEL_USER_ID) || isOwner(sender)){
        sharedService.SendPlaylistResumeRequest();
        return true;
    }
    else{
        return false;
    }
}

export async function pausePlaylist(sharedService: SharedService, sender: string, OAUTH_TOKEN: string, CHAT_CHANNEL_USER_ID: string){
    if(await isMod(sender, OAUTH_TOKEN, CHAT_CHANNEL_USER_ID) || isOwner(sender)){
        sharedService.SendPlaylistPauseRequest();
        return true;
    }
    else{
        return false;
    }
}