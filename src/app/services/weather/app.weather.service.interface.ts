import {EventInterface} from '../../entities/events/event.interface';
import {Observable} from 'rxjs/Observable';
import {Weather} from './app.weather';

export interface WeatherServiceInterface {
  getWeatherForEvent(event: EventInterface): Observable<Weather>;
}