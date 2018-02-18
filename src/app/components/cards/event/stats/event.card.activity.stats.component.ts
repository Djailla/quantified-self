import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit} from '@angular/core';
import {EventInterface} from '../../../../entities/events/event.interface';
import {DataHeartRate} from '../../../../entities/data/data.heart-rate';
import {DataCadence} from '../../../../entities/data/data.cadence';
import {DataPower} from '../../../../entities/data/data.power';
import {DataTemperature} from '../../../../entities/data/data.temperature';
import {DataAltitude} from '../../../../entities/data/data.altitude';
import {EventService} from '../../../../services/app.event.service';
import {ActivityInterface} from '../../../../entities/activities/activity.interface';


@Component({
  selector: 'app-event-card-activity-stats',
  templateUrl: './event.card.activity.stats.component.html',
  styleUrls: ['./event.card.activity.stats.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class EventCardActivityStatsComponent implements OnChanges, OnInit {
  @Input() activity: ActivityInterface;
  @Input() event: EventInterface;
  public stats = [];

  public dataTypeAverages = [
    {
      name: DataHeartRate.type,
      value: null,
      iconName: 'heartbeat',
      units: 'BPM',
      iconType: 'fontAwesome'
    },
    {
      name: DataCadence.type,
      value: null,
      iconName: 'circle-o-notch',
      units: 'SPM',
      iconType: 'fontAwesome'
    },
    {
      name: DataTemperature.type,
      value: null,
      iconName: 'thermometer',
      units: 'Celsius',
      iconType: 'fontAwesome'
    },
    {
      name: DataPower.type,
      value: null,
      iconName: 'flash',
      units: 'WATTS',
      iconType: 'fontAwesome'
    }
  ];

  public dataTypeGains = [
    {
      name: DataAltitude.type,
      value: null,
      iconName: 'trending_up',
      units: 'm',
      iconType: 'material'
    }
  ];

  public dataTypeLosses = [
    {
      name: DataAltitude.type,
      value: null,
      iconName: 'trending_down',
      units: 'm',
      iconType: 'material'
    }
  ];

  constructor(public eventService: EventService) {

  }

  ngOnInit(){
  }

  ngOnChanges() {
    this.dataTypeAverages.forEach((dataTypeAverage) => {
      dataTypeAverage.value = Number(this.eventService.getEventDataTypeAverage(
        this.event,
        dataTypeAverage.name,
        void 0,
        void 0,
        void 0,
        [this.activity]
      ).toFixed(0));
    });
    this.dataTypeGains.forEach((dataTypeGain) => {
      dataTypeGain.value = Number(this.eventService.getEventDataTypeGain(
        this.event,
        dataTypeGain.name,
        void 0,
        void 0,
        void 0,
        [this.activity]).toFixed(0));
    });
    this.dataTypeLosses.forEach((dataTypeLoss) => {
      dataTypeLoss.value = Number(this.eventService.getEventDataTypeLoss(this.event, dataTypeLoss.name,
        void 0,
        void 0,
        void 0,
        [this.activity]
      ).toFixed(0));
    });

    this.stats = this.dataTypeGains.concat(
      this.dataTypeLosses,
      [
        {
          name: 'Distance',
          value: (this.activity.getSummary().getTotalDistanceInMeters() / 1000).toFixed(2),
          iconName: 'arrows-h',
          units: 'km',
          iconType: 'fontAwesome'
        },
        {
          name: 'Time',
          value: (new Date(this.activity.getSummary().getTotalDurationInSeconds() * 1000)).toISOString().substr(11, 8),
          iconName: 'clock-o',
          units: '',
          iconType: 'fontAwesome'
        },
      ],
      this.dataTypeAverages
    );
    if (this.event.getSummary().getTotalDistanceInMeters()) {
      this.stats.push({
          name: 'Pace',
          value: (new Date((this.activity.getSummary().getTotalDurationInSeconds() * 1000) / (this.activity.getSummary().getTotalDistanceInMeters() / 1000)))
            .toISOString().substr(14, 5),
          iconName: 'directions_run',
          units: 'm/km',
          iconType: 'material'
        },
        {
          name: 'Speed',
          value: ((this.event.getSummary().getTotalDistanceInMeters() / 1000) / (this.activity.getSummary().getTotalDurationInSeconds() / 60 / 60)).toFixed(1),
          iconName: 'directions_bike',
          units: 'km/h',
          iconType: 'material'
        });
    }
  }
}