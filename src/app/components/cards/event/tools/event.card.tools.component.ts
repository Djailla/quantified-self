import {
  ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit,
} from '@angular/core';
import {EventInterface} from '../../../../entities/events/event.interface';
import {ActivityInterface} from '../../../../entities/activities/activity.interface';
import {DataHeartRate} from '../../../../entities/data/data.heart-rate';
import {Point} from '../../../../entities/points/point';
import {PointInterface} from '../../../../entities/points/point.interface';
import {MatSnackBar} from '@angular/material';
import {EventService} from '../../../../services/app.event.service';
import {IBIData} from '../../../../entities/data/ibi/data.ibi';

@Component({
  selector: 'app-event-card-tools',
  templateUrl: './event.card.tools.component.html',
  styleUrls: ['./event.card.tools.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCardToolsComponent implements OnChanges, OnInit, OnDestroy {

  @Input() event: EventInterface;

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
    this.event.getActivities().forEach((activity: ActivityInterface) => {
        // Remove all HR!
        activity.getPoints().forEach((point: PointInterface) => {
          if (point.getDataByType(DataHeartRate.type)) {
            point.removeDataByType(DataHeartRate.type);
          }
        });

        // Create new not to alter existing
        const ibiData = new IBIData(Array.from(activity.getIBIData().getIBIDataMap().values()));

        // If we want the defaults
        if (defaultFilters) {
          ibiData
            .lowLimitBPMFilter()
            .highLimitBPMFilter()
            .movingMedianFilter()
            .lowPassFilter();
        } else if (!resetToRawIBIData) {
          if (this.lowLimitFilterChecked) {
            ibiData.lowLimitBPMFilter(this.lowLimitFilterValue);
          }
          if (this.highLimitChecked) {
            ibiData.highLimitBPMFilter(this.highLimitValue);
          }
          if (this.movingMedianChecked) {
            ibiData.movingMedianFilter(this.movingMedianValue);
          }
          if (this.movingWeightAverageChecked) {
            ibiData.lowPassFilter(this.movingWeightAverageValue);
          }
        }

        // Else just get them as BPM and no filter
        ibiData.getAsBPM().forEach((value, key, map) => {
          const point = new Point(new Date(activity.getStartDate().getTime() + key));
          point.addData(new DataHeartRate(value));
          activity.addPoint(point);
        });
      }
    );
    this.eventService.saveEvent(this.event).then((result) => {
      this.snackBar.open('Filters applied! Go to the chart to see the result', null, {
        duration: 5000,
      });
    });
  }
}