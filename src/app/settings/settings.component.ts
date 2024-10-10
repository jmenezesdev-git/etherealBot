import { Component, EventEmitter, input, Input, OnInit, Output } from '@angular/core';
import { SharedService } from '../shared.service';
import { botSettings } from 'src/botSettings';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { updateBotSettings } from 'src/bot';
import { SettingsService } from './settingsService';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styles: ``
})

export class SettingsComponent implements OnInit {
  //Look up @Input and @Output for passing instance variables 
 
 // @Output() closeSettingsEvent = new EventEmitter<string>();
@Output() closeSettingsEvent = new EventEmitter<botSettings>();

@Input({ required: true }) settings!: botSettings;

settingsDays: number | undefined;
settingsHours: number | undefined;
settingsMins: number | undefined;
settingsSecs: number | undefined;
tempSettings!: botSettings;

  constructor(private sharedService: SharedService, private settingsService: SettingsService){

  }

  async ngOnInit() {
    console.log("I AM BEING CALLED");
    // if (this.settings != undefined){
      console.log("this.settings");
      console.log(this.settings);
      
      this.tempSettings = this.settings;
      this.getDHMSFromString(this.tempSettings.lengthLimit)
    // }
    // else{
    //   console.log("I have been called before settings was defined!");
    // }
  }

  

  getDHMSFromString(input:string){


      var days = 0;
      var hours = 0;
      var minutes = 0;
      var seconds = 0;
      const regexp = /PT((\d+)DT)?((\d+)H)?((\d+)M)?(\d+)S/g;
  
      if (input != null && input != undefined && input.length > 0){

        if (input == "-1"){
          return;
        }
        let matches = input.matchAll(regexp);
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
        
        if (days > 0){
          this.settingsDays = days;
        }
        if (hours > 0){
          this.settingsHours = hours;
        }
        if ( minutes > 0){
          this.settingsMins = minutes;
        }
        if (seconds > 0){
          this.settingsSecs = seconds;
        }
  
      }

  }

  getStringFromDHMS(){
    if (this.settingsDays == undefined && this.settingsHours == undefined && this.settingsMins == undefined &&  this.settingsSecs == undefined){
      return "-1";
    }
    var returnVal = "PT"
    if (this.settingsDays != undefined && this.settingsDays > 0){
      returnVal += this.settingsDays +"D";
    }
    if (this.settingsHours != undefined && this.settingsHours > 0){
      returnVal += this.settingsHours +"H";
    }
    if (this.settingsMins != undefined && this.settingsMins > 0){
      returnVal += this.settingsMins +"M";
    }
    if (this.settingsSecs != undefined && this.settingsSecs > 0){
      returnVal += this.settingsSecs +"S";
    } else{
      returnVal += "0S";
    }

    return returnVal;

  }
  //call function in parent component
  //use DB stuff
  async saveSettings(){
    if (this.tempSettings != undefined){
      this.tempSettings.lengthLimit = this.getStringFromDHMS();
    }




    //post to db

    if (this.tempSettings != undefined){
      if(await updateBotSettings(this.tempSettings)){
        console.log("updated Bot settings!");
        //this.settingsService.sendCloseSettingsEventHook(this.tempSettings);
      }
    }

    this.closeSettingsEvent.emit(this.tempSettings);
    //await botjs.saveSettings();
    //sendCloseSettingsEventHook(){}
  }

  // getCloseSettingsEventHook(){
  //   ethBotSettingsSave();
  //   updateSettings()
  // }
}


