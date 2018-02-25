import {Component, Input} from '@angular/core';
import {ActivityInterface} from '../../entities/activities/activity.interface';

@Component({
  selector: 'app-activity-icon',
  templateUrl: './activity-icon.component.html',
  styleUrls: ['./activity-icon.component.css'],
})

export class ActivityIconComponent {
  @Input() activity: ActivityInterface;

  getActivityIcon() {
    // @todo optimize
    if (this.activity.getType().toLocaleLowerCase().includes('running')) {
      return 'directions_run';
    }
    if (this.activity.getType().toLocaleLowerCase().includes('biking')) {
      return 'directions_bike';
    }
    if (this.activity.getType().toLocaleLowerCase().includes('cycling')) {
      return 'directions_bike';
    }
    if (this.activity.getType().toLocaleLowerCase().includes('swimming')) {
      return 'pool';
    }
  }
}