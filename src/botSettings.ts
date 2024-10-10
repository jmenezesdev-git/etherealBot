export class botSettings{
	//Youtube video information
	lengthLimit = "-1";
	lengthLimitMod = false;
	songsPerUser = -1;
	songsPerUserMod = false;
    streamChannel = "";


	constructor(lengthLimit: string, songsPerUser: number, streamChannel: string, lengthLimitMod: boolean, songsPerUserMod: boolean){
		this.lengthLimit = lengthLimit;
		this.lengthLimitMod = lengthLimitMod;
		this.songsPerUser = songsPerUser;
		this.songsPerUserMod = songsPerUserMod;
		this.streamChannel = streamChannel;
	}
}