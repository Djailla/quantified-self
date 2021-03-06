import {
  ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit,
} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {EventService} from '../../../../services/app.event.service';
import {EventInterface} from 'quantified-self-lib/lib/events/event.interface';
import {ActivityInterface} from 'quantified-self-lib/lib/activities/activity.interface';
import {PointInterface} from 'quantified-self-lib/lib/points/point.interface';
import {DataHeartRate} from 'quantified-self-lib/lib/data/data.heart-rate';
import {IBIData} from 'quantified-self-lib/lib/data/ibi/data.ibi';
import {Point} from 'quantified-self-lib/lib/points/point';

@Component({
  selector: 'app-event-card-tools',
  templateUrl: './event.card.tools.component.html',
  styleUrls: ['./event.card.tools.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCardToolsComponent implements OnChanges, OnInit, OnDestroy {

  @Input() event: EventInterface;
  @Input() selectedActivities: ActivityInterface[];

  lowLimitFilterChecked: boolean;
  lowLimitFilterValue = 40;
  highLimitChecked: boolean;
  highLimitValue = 220;
  movingMedianChecked: boolean;
  movingMedianValue = 5;
  movingWeightAverageChecked: boolean;
  movingWeightAverageValue = 5;


  constructor(private snackBar: MatSnackBar, private eventService: EventService) {
  }

  ngOnInit() {
  }

  ngOnChanges(): void {
  }

  ngOnDestroy() {
  }

  applyFilters(defaultFilters?: boolean, resetToRawIBIData?: boolean) {
    // Remove all HR!
  //   this.selectedActivities.forEach((activity: ActivityInterface) => {
  //       // Create new not to alter existing
  //       const ibiData = new IBIData(Array.from(activity.ibiData.getIBIDataMap().values()));
  //       if (!ibiData.getIBIDataMap().size) {
  //         // Exit if this activity does not have ibiData
  //         return;
  //       }
  //       // Clear all current HR points
  //       activity.getPoints().forEach((point: PointInterface) => {
  //         if (point.getDataByType(DataHeartRate.type)) {
  //           point.removeDataByType(DataHeartRate.type);
  //         }
  //       });
  //       // If we want the defaults
  //       if (defaultFilters) {
  //         ibiData
  //           .lowLimitBPMFilter()
  //           .highLimitBPMFilter()
  //           .movingMedianFilter()
  //           .lowPassFilter();
  //       } else if (!resetToRawIBIData) {
  //         if (this.lowLimitFilterChecked) {
  //           ibiData.lowLimitBPMFilter(this.lowLimitFilterValue);
  //         }
  //         if (this.highLimitChecked) {
  //           ibiData.highLimitBPMFilter(this.highLimitValue);
  //         }
  //         if (this.movingMedianChecked) {
  //           ibiData.movingMedianFilter(this.movingMedianValue);
  //         }
  //         if (this.movingWeightAverageChecked) {
  //           ibiData.lowPassFilter(this.movingWeightAverageValue);
  //         }
  //       }
  //       // Else just get them as BPM and no filter
  //       ibiData.getAsBPM().forEach((value, key, map) => {
  //         const point = new Point(new Date(activity.startDate.getTime() + key));
  //         point.addData(new DataHeartRate(value));
  //         activity.addPoint(point);
  //       });
  //     },
  //   );
  //   // Add and update via service
  //   this.eventService.setEvent(this.event);
  //   this.snackBar.open('Filters applied! Go to the chart to see the result', null, {
  //     duration: 2000,
  //   });
  }
}
