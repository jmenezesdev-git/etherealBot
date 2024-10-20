import { Component, EventEmitter, input, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { SharedService } from '../shared.service';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatTable, MatTableModule} from '@angular/material/table';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { youtubeVideoInfo } from '../scripts/youtube';
import { addTrackToDefaultList, deletePlaylistAtLocation, getPlaylist, relocateItemInPlaylistArray } from 'src/bot';
import { MatIconModule } from '@angular/material/icon';
import { CdkMenuModule } from '@angular/cdk/menu';
import { decodeTextForOutput } from '../scripts/botSupportingFunctions';
import { getPlaylistFromBackend } from '../scripts/backendCalls';

export const DATAARR: youtubeVideoInfo[] = [];

@Component({
    selector: 'app-publicTrackList',
    standalone: true,
    imports: [CommonModule, FormsModule, CdkDropList, CdkDrag, MatTableModule, MatIconModule, CdkMenuModule],
    templateUrl: './publicTrackList.component.html',
    styles: ``
  })


export class publicTrackListComponent implements OnInit {
    @Input({ required: true }) userName!: string;
    dataSource = DATAARR;
    displayedColumns: string[] = ['position', 'songname', 'duration', 'requestedby', 'channeltitle'];
    @ViewChild('publicTrackListTable', { static: true })
    publicTrackListTable!: MatTable<youtubeVideoInfo>;
    
        
    ngOnChanges(changes: SimpleChanges) {
        
        if (changes['userName'].currentValue != changes['userName'].previousValue){
            this.updateList();
        }

        // You can also use categoryId.previousValue and 
        // categoryId.firstChange for comparing old and new values
        
    }


    constructor(private sharedService: SharedService){

        // this.sharedService.GetUpdateActiveSongHook().subscribe((value)=>{
        //     this.updateDragDropRenumber(getPlaylist());});

    }

    async ngOnInit() {

        setInterval(() => {
            this.updateList(); 
            }, 30000);

    }

    //should be called once every....30s?
    //updates the list with the newest data
    //ideally updates when tab is newly selected in context as well
    //called when opened. 
    async updateList(){
        if(this.userName != undefined && this.userName != null && this.userName != ""){
            this.dataSource = await getPlaylistFromBackend("0000", this.userName);
            this.dataSource.forEach((element, index) => {
                element.channelTitle = decodeTextForOutput(element.channelTitle);
                element.songTitle = decodeTextForOutput(element.songTitle);
                element.realTime = this.getShortTime(element);
            });
            
        }
    }

    getShortTime(ytVI:youtubeVideoInfo){
		var days = 0;
		var hours = 0;
		var minutes = 0;
		var seconds = 0;

		if (ytVI.duration != null && ytVI.duration != undefined && ytVI.duration.length > 0){
			let matches = ytVI.duration.matchAll(youtubeVideoInfo.regexp);
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