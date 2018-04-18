import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {EventInterface} from '../../entities/events/event.interface';
import {ActionButtonService} from '../../services/action-buttons/app.action-button.service';
import {ActionButton} from '../../services/action-buttons/app.action-button';
import {EventService} from '../../services/app.event.service';
import {Router} from '@angular/router';
import {MatSnackBar, MatSort, MatSortable, MatTableDataSource} from '@angular/material';
import {EventUtilities} from '../../entities/events/utilities/event.utilities';
import {SelectionModel} from '@angular/cdk/collections';
import {DatePipe} from '@angular/common';
import {GeoLocationInfo} from '../../entities/geo-location-info/geo-location-info';


@Component({
  selector: 'app-event-table',
  templateUrl: './event.table.component.html',
  styleUrls: ['./event.table.component.css'],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class EventTableComponent implements OnChanges, OnInit, OnDestroy, AfterViewInit {
  @Input() events: EventInterface[];
  @ViewChild(MatSort) sort: MatSort;
  data: MatTableDataSource<Object>;
  columns: Array<Object>;
  selection = new SelectionModel(true, []);

  public eventSelectionMap: Map<EventInterface, boolean> = new Map<EventInterface, boolean>();

  constructor(private snackBar: MatSnackBar,
              private eventService: EventService,
              private actionButtonService: ActionButtonService,
              private router: Router, private  datePipe: DatePipe) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.data.sort = this.sort;
    this.data.sort.sort(<MatSortable>{
        id: 'Date',
        start: 'desc'
      }
    );
  }

  ngOnChanges(): void {
    const data = this.events.reduce((eventArray, event) => {
      eventArray.push({
        Checkbox: event,
        Date: this.datePipe.transform(event.getFirstActivity().startDate, 'medium'),
        Name: event.name.slice(0, 15),
        Activities: this.getUniqueStringWithMultiplier(event.getActivities().map((activity) => activity.type)),
        Distance: event.getDistance().getDisplayValue() + event.getDistance().getDisplayUnit(),
        Duration: event.getDuration().getDisplayValue(),
        Location: this.getLocationString(event.getFirstActivity().geoLocationInfo),
        Device:
          this.getUniqueStringWithMultiplier(event.getActivities().map((activity) => activity.creator.name)),
        Actions:
        event,
      })
      ;
      return eventArray;
    }, []);
    this.columns = Object.keys(data[0]);
    this.data = new MatTableDataSource(data);
  }

  checkBoxClick(row) {
    this.selection.toggle(row);
    this.updateActionButtonService();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.data.data.length;
    return numSelected === numRows;
  }


  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.data.data.forEach(row => this.selection.select(row));
    this.updateActionButtonService();
  }


  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.data.filter = filterValue;
  }

  getColumnIcon(columnName): string {
    switch (columnName) {
      case 'Distance':
        return 'trending_flat';
      case 'Duration':
        return 'timer';
      case 'Date':
        return 'date_range';
      case 'Location':
        return 'location_on';
      case 'Device':
        return 'watch';
      case 'Name':
        return 'font_download';
      case 'Activities':
        return 'filter_none';
      default:
        return null;
    }
  }

  private updateActionButtonService() {
    if (this.selection.selected.length > 1) {
      this.actionButtonService.addActionButton('mergeEvents', new ActionButton(
        'compare_arrows',
        () => {
          this.actionButtonService.removeActionButton('mergeEvents');
          EventUtilities.mergeEvents(this.selection.selected.map(selected => selected.Checkbox)).then((mergedEvent: EventInterface) => {
            this.actionButtonService.removeActionButton('mergeEvents');
            this.eventService.addAndSaveEvent(mergedEvent);
            this.eventSelectionMap.clear();
            this.router.navigate(['/dashboard'], {
              queryParams: {
                eventID: mergedEvent.getID(),
                tabIndex: 0
              }
            }).then(() => {
              this.snackBar.open('Events merged', null, {
                duration: 5000,
              });
            });
          })
        },
        'material'
      ));
      this.actionButtonService.addActionButton('deleteEvents', new ActionButton(
        'delete',
        () => {
          this.actionButtonService.removeActionButton('deleteEvents');
          this.actionButtonService.removeActionButton('mergeEvents');
          this.selection.selected.map(selected => selected.Checkbox).forEach((event) => this.eventService.deleteEvent(event));
          this.eventSelectionMap.clear();
          this.snackBar.open('Events deleted', null, {
            duration: 5000,
          });
        },
        'material'
      ));
    } else {
      this.actionButtonService.removeActionButton('mergeEvents');
      this.actionButtonService.removeActionButton('deleteEvents');
    }
  }

  private getUniqueStringWithMultiplier(arrayOfStrings: string[]) {
    const uniqueObject = arrayOfStrings.reduce((uniqueObj, activityType, index) => {
      if (!uniqueObj[activityType]) {
        uniqueObj[activityType] = 1;
      } else {
        uniqueObj[activityType] += 1;
      }
      return uniqueObj;
    }, {});
    return Object.keys(uniqueObject).reduce((uniqueArray, key, index, object) => {
      if (uniqueObject[key] === 1) {
        uniqueArray.push(key);
      } else {
        uniqueArray.push(uniqueObject[key] + ' x ' + key);
      }
      return uniqueArray;
    }, []).join(', ');
  }

  private getLocationString(geoLocationInfo: GeoLocationInfo) {
    let string = '';
    if (!geoLocationInfo) {
      return string;
    }
    if (geoLocationInfo.city) {
      string += geoLocationInfo.city + ', '
    }
    string += geoLocationInfo.country;
    return string;
  }

  ngOnDestroy() {
    this.actionButtonService.removeActionButton('mergeEvents');
    this.actionButtonService.removeActionButton('deleteEvents');
  }
}