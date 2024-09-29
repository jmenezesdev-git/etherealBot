import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedService } from '../shared.service';
import { botSettings } from 'src/botSettings';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.component.html',
  styles: ``
})

export class SettingsComponent {
  //Look up @Input and @Output for passing instance variables 
 
 // @Output() closeSettingsEvent = new EventEmitter<string>();
@Output() closeSettingsEvent = new EventEmitter<botSettings>();

@Input({ required: true }) settings!: botSettings | undefined;



  constructor(sharedService: SharedService){


  }


  //call function in parent component
  //use DB stuff
  saveSettings(){
    
    //await botjs.saveSettings();
    //sendCloseSettingsEventHook(){}
  }

  // getCloseSettingsEventHook(){
  //   ethBotSettingsSave();
  //   updateSettings()
  // }
}


