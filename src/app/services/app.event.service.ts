import {Injectable} from '@angular/core';
import {Event} from '../entities/events/event';
import {EventImporterTCX} from '../entities/events/adapters/importers/importer.tcx';
import {EventExporterTCX} from '../entities/events/adapters/exporters/exporter.tcx';
import {EventImporterGPX} from '../entities/events/adapters/importers/importer.gpx';
import {LocalStorageService} from './app.local.storage.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {List} from 'immutable';
import {Observable} from 'rxjs/Observable';
import {Activity} from '../entities/activities/activity';
import {EventInterface} from '../entities/events/event.interface';
import {EventImporterJSON} from '../entities/events/adapters/importers/importer.json';
import {EventImporterSML} from "../entities/events/adapters/importers/importer.sml";

@Injectable()
export class EventService {

  private parser: DOMParser = new DOMParser;
  private events: BehaviorSubject<List<EventInterface>> = new BehaviorSubject(List([]));

  public static getEventAsTCXBloB(event: EventInterface): Promise<Blob> {
    return new Promise((resolve, reject) => {
      resolve(new Blob(
        [(new EventExporterTCX).getAsString(event)],
        {type: (new EventExporterTCX).getFileType()}
      ));
    });
  }

  constructor(private localStorageService: LocalStorageService) {
    // Fetch existing events
    this.getInitialData();
  }

  private getInitialData() {
    for (const localStorageKey of this.localStorageService.getAllKeys()) {
      this.localStorageService.getItem(localStorageKey).then((localStorageData) => {
        this.createEventFromJSONString(localStorageData).then((event: EventInterface) => {
          this.events.next(this.events.getValue().push(event));
        });
      });
    }
  }

  public addEvent(event: EventInterface) {
    this.events.next(this.events.getValue().push(event));
  }

  public addEvents(events: EventInterface[]) {
    for (const event of events) {
      this.addEvent(event);
    }
  }

  public deleteEvent(eventToDelete: EventInterface) {
    this.localStorageService.removeItem(eventToDelete.getID()).then(() => {
      this.events.next(this.events.getValue().delete(this.events.getValue().findIndex((event: EventInterface) => {
        return eventToDelete.getID() === event.getID();
      })));
    });
  }

  public getEvents(): Observable<List<EventInterface>> {
    return this.events.asObservable();
  }

  public createEventFromJSONString(data: string): Promise<EventInterface> {
    return new Promise((resolve, reject) => {
      return resolve(EventImporterJSON.getFromJSONString(data));
    });
  }

  public createEventFromJSONSMLString(data: string): Promise<EventInterface> {
    return new Promise((resolve, reject) => {
      return resolve(EventImporterSML.getFromJSONString(data));
    });
  }

  public createEventFromXMLString(data: string): Promise<EventInterface> {
    return new Promise((resolve, reject) => {
      // Read the xml
      try {
        const xml = this.parser.parseFromString(data, 'application/xml');
        if (xml.getElementsByTagName('gpx')[0]) {
          return resolve(EventImporterGPX.getFromXML(xml));
        } else if (xml.getElementsByTagName('TrainingCenterDatabase')[0]) {
          return resolve(EventImporterTCX.getFromXML(xml));
        }
      } catch (e) {
        return reject(e);
      }
      return reject('Could not fund an encoder for this file format');
    });
  }

  public mergeEvents(events: EventInterface[]): Promise<EventInterface> {
    return new Promise((resolve, reject) => {
      // First sort the events by first point date
      events.sort((eventA: EventInterface, eventB: EventInterface) => {
        // Let it fail with exception for now
        return eventA.getFirstActivity().getStartDate().getTime() - eventB.getFirstActivity().getStartDate().getTime();
      });
      const mergeEvent = new Event();
      mergeEvent.setName((new Date()).toISOString());
      for (const event of events) {
        for (const activity of event.getActivities()) {
          mergeEvent.addActivity(activity);
        }
      }
      return resolve(mergeEvent);
    });
  }

  public mergeAllEventActivities(event: EventInterface): Promise<EventInterface> {
    return new Promise((resolve, reject) => {
      // Copy the date
      const dateCopy = Object.create(event.getFirstActivity().getStartDate());
      // Copy the points
      const pointsCopy = Object.create(event.getPoints());


      // Remove all activities
      const activities = event.getActivities();
      for (let i = activities.length; i--; ) {
        event.removeActivity(activities[i]);
      }
      const newActivity = new Activity(event);
      for (const point of pointsCopy) {
        newActivity.addPoint(point);
      }
      return resolve(event);
    });
  }
}