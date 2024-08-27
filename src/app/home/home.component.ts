import {Component, inject, OnInit} from '@angular/core';
import {CommonModule, NgFor} from '@angular/common';
import {HousingLocationComponent} from '../housing-location/housing-location.component';
import { HousingLocation } from '../housinglocation';
import {HousingService} from '../housing.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HousingLocationComponent],
  template: `
    <section>
      <form>
        <input type="text" placeholder="Filter by city" #filter>
        <button class="primary" type="button" (click)="filterResults(filter.value)">Search</button>
      </form>
    </section>
    <section class="results">
      <app-housing-location 
        *ngFor="let housingLocation of filteredLocationList" 
        [housingLocation]="housingLocation">
      </app-housing-location>
      
    </section>
  `,
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit{
  housingLocationList: HousingLocation[] = [];
  housingService: HousingService = inject(HousingService);
  filteredLocationList: HousingLocation[] = [];

  paramsObject : ParamMap | null | undefined;

  constructor(private route: ActivatedRoute) {
    // this.housingService.getAllHousingLocations().then((housingLocationList: HousingLocation[]) => {
    //   this.housingLocationList = housingLocationList;
    //   this.filteredLocationList = housingLocationList;
    // });
  }

  ngOnInit() {
    this.route.queryParamMap
      .subscribe((params) => {
        this.paramsObject = { ...params.keys, ...params };
        console.log(this.paramsObject);
      }
    );
  }

  filterResults(text: string) {
    if (!text) {
      this.filteredLocationList = this.housingLocationList;
      return;
    }
    this.filteredLocationList = this.housingLocationList.filter((housingLocation) =>
      housingLocation?.city.toLowerCase().includes(text.toLowerCase()) || housingLocation?.state.toLowerCase().includes(text.toLowerCase()) ,
    );
  }

}
