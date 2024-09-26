export class botSettings{
	//Youtube video information
	lengthLimit = "-1";
	songsPerUser = -1;
    streamChannel = "";

	constructor(lengthLimit: string, songsPerUser: number, streamChannel: string){
		this.lengthLimit = lengthLimit;
		this.songsPerUser = songsPerUser;
		this.streamChannel = streamChannel;
	}
}