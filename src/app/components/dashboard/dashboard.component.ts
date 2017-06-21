import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, OnDestroy,
  OnInit
} from '@angular/core';
import {EventService} from '../../services/app.event.service';
import {ActivatedRoute, Params} from '@angular/router';
import {List} from 'immutable';
import {Subscription} from 'rxjs/Subscription';
import {EventInterface} from '../../entities/events/event.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DashboardComponent implements OnInit, OnDestroy, OnChanges {

  public title = 'Dashboard';
  public events: List<EventInterface> = List([]);
  public selectedEvent: EventInterface;

  private parametersEventID: string;
  private parametersSubscription: Subscription;
  private eventsSubscription: Subscription;

  constructor(private eventService: EventService, private changeDetectorRef: ChangeDetectorRef, private route: ActivatedRoute) {
    // this.changeDetectorRef.detach();
  }

  ngOnInit() {
    // Subscribe to route changes
    this.parametersSubscription = this.route.queryParams.subscribe((params: Params) => {
      this.parametersEventID = params.eventID;
      this.findSelectedEvent();
    });

    // Fetch the events from the service
    this.eventsSubscription = this.eventService.getEvents().subscribe((events: List<EventInterface>) => {
      this.events = events;
      this.findSelectedEvent();
    });
  }

  private findSelectedEvent() {
    this.selectedEvent = this.events.find((event: EventInterface) => {
      return event.getID() === this.parametersEventID;
    });
    this.changeDetectorRef.markForCheck();
  }

  ngOnChanges() {
  }

  ngOnDestroy(): void {
    this.parametersSubscription.unsubscribe();
    this.eventsSubscription.unsubscribe();
  }
}