import {CreatorInterface} from '../creators/creatorInterface';
import {PointInterface} from '../points/point.interface';
import {LapInterface} from '../laps/lap.interface';
import {EventInterface} from '../events/event.interface';
import {IDClass} from '../id/id.abstract.class';
import {IDClassInterface} from '../id/id.class.interface';
import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {DataInterface} from '../data/data.interface';

export interface ActivityInterface extends IDClassInterface, SerializableClassInterface {

  getEvent(): EventInterface;

  setType(type: string);
  getType(): string;

  getStartDate(): Date;
  getEndDate(): Date;

  getDurationInSeconds(): number;

  addCreator(creator: CreatorInterface);
  getCreators(): CreatorInterface[];

  addPoint(point: PointInterface);
  getPoints(): PointInterface[];
  getData(): Map<string, DataInterface[]>;

  getStartPoint(): PointInterface;
  getEndPoint(): PointInterface;

  addLap(lap: LapInterface);
  getLaps(): LapInterface[];

  getDistanceInMeters(): number;
  getLapsDistanceInMeters(): number;

  sortPointsByDate(): void;
}