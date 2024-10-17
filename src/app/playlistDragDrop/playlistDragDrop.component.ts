import { Component, EventEmitter, input, Input, OnInit, Output, ViewChild } from '@angular/core';
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
import { playlistDragDropService } from './playlistDragDropService';

export const DATAARR: youtubeVideoInfo[] = [];

@Component({
    selector: 'app-playlistDragDrop',
    standalone: true,
    imports: [CommonModule, FormsModule, CdkDropList, CdkDrag, MatTableModule, MatIconModule, CdkMenuModule],
    templateUrl: './playlistDragDrop.component.html',
    styles: ``
  })


export class playlistDragDropComponent implements OnInit {
    dataSource2 = DATAARR;
    displayedColumns2: string[] = ['position', 'songname', 'duration', 'requestedby', 'channeltitle'];
    @ViewChild('table2', { static: true })
    table2!: MatTable<youtubeVideoInfo>;
    
    constructor(private sharedService: SharedService, private playlistDragDropService:playlistDragDropService){

        this.sharedService.GetUpdateActiveSongHook().subscribe((value)=>{
            this.updateDragDropRenumber(getPlaylist());});
        this.sharedService.GetUpdateActiveSongHookNoDB().subscribe((value)=>{
            this.updateDragDropRenumber(getPlaylist());});
        this.sharedService.GetUpdateDragDropSongHook().subscribe((value)=>{
            this.updateDragDrop(value);
        });
        this.sharedService.GetUpdateDragDropSongHookRenumber().subscribe((value)=>{
            this.updateDragDropRenumber(value);
        });
        this.playlistDragDropService.GetSetPlayListDragDropDataSource().subscribe((value)=>{
            this.updateDragDropRenumber(value);
        });
    }

    async ngOnInit() {
    }

    setDataSource(ytVI: youtubeVideoInfo[]){
        this.dataSource2 = ytVI;
    }

    rowDelete(ytVI: youtubeVideoInfo){
        // event: CdkContextMenuTrigger
        console.log(ytVI);
        deletePlaylistAtLocation(ytVI);
    }
    
    addToDefault(ytVI: youtubeVideoInfo){
        console.log("addToDefaultCalled");
        addTrackToDefaultList(ytVI);
    }

    drop2(event: CdkDragDrop<string>) {
        if (this.dataSource2 != undefined){
          const previousIndex = this.dataSource2.findIndex(d => d === event.item.data);
    
          relocateItemInPlaylistArray(previousIndex, event.currentIndex);
          //this.table2.renderRows(); This function redraws the table rows
        }
      }

    updateDragDrop(ytVI:youtubeVideoInfo[]){
        //setting mandatory values for display purposes only. SHOULD NEVER IMPACT underlying data 
        ytVI.forEach((element, index)=> {
            element.channelTitle = decodeTextForOutput(element.channelTitle);
            element.songTitle = decodeTextForOutput(element.songTitle);
        });

        this.dataSource2 = ytVI;
        this.table2.renderRows();
    }

    updateDragDropRenumber(ytVI:youtubeVideoInfo[]){

        //setting mandatory values for display purposes only. SHOULD NEVER IMPACT underlying data 
        ytVI.forEach((element, index)=> {
            element.position = index + 1;
            element.channelTitle = decodeTextForOutput(element.channelTitle);
            element.songTitle = decodeTextForOutput(element.songTitle);
        });

        this.dataSource2 = ytVI;
        this.table2.renderRows();
    }
}