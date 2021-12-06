import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RxCollection } from 'rxdb';
import { defer, forkJoin, Observable } from 'rxjs';
import { concatMap, first, map, pluck, shareReplay } from 'rxjs/operators';
import { sha256WithBlob } from '../../utils/crypto';
import { getCurrentPositionOrUndefined } from '../../utils/geolocation';
import { Database } from '../database/database.service';
import { MemontIndex, Moment, schema } from './moment';

async function httpsImage(that: any, photo: Blob): Promise<any[]> {
  return new Promise((resolve) => {
    // let hotMoviesUrl: string = "https://easin2019.51vip.biz:44365/recognize";
    // let hotMoviesUrl: string = "http://127.0.0.1:8000/recognize";
    // let hotMoviesUrl: string = "http://192.168.43.80:8000/recognize";
    // let hotMoviesUrl: string = "https://106.53.102.253:9000/recognize";
    let hotMoviesUrl: string = "https://api.teachingforchange.edu.au/recognize";



    // let hotMoviesUrl: string = "https://yjm.teachingforchange.edu.au/recognize";

    that.httpClient.post(hotMoviesUrl, photo, {
      headers: {
        'Prediction-Key': '7fee05ce941445feab591cb78492afa0',
        'Content-Type': 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
      }
    }
    ).subscribe((data: any) => {
      console.log('xx')
      resolve(data)
    }, (error: any) => {
      console.log(error)
    });
  });
}

async function getHttpsImage(that: any, photo: Blob) {
  try {
    return await httpsImage(that, photo);
  } catch {
    return [];
  }
}

@Injectable({
  providedIn: 'root',
})
export class MomentRepository {
  private readonly collection$: Observable<
    RxCollection<MemontIndex>
  > = this.database.main$.pipe(
    concatMap(database =>
      database.addCollections({
        [COLLECTION_NAME]: { schema },
      })
    ),
    pluck(COLLECTION_NAME),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly all$ = this.collection$.pipe(
    concatMap(c => c.find().sort({ timestamp: 'desc' }).$),
    map(documents => documents.map(d => new Moment(d)))
  );

  constructor(private readonly database: Database, private readonly httpClient: HttpClient) { }




  add$(photo: Blob) {
    return defer(() =>
      forkJoin([
        this.collection$.pipe(first()),
        sha256WithBlob(photo),
        getCurrentPositionOrUndefined(),
        getHttpsImage(this, photo),
      ])
    ).pipe(
      concatMap(([collection, id, geolocationPosition, predictions]) => {
        // console.log('predictions', predictions)
        return collection.atomicUpsert({
          id,
          timestamp: Date.now(),
          geolocationPosition: geolocationPosition
            ? {
              latitude: geolocationPosition.coords.latitude,
              longitude: geolocationPosition.coords.longitude,
            }
            : undefined,
          userAgent: navigator.userAgent,
          predictions: predictions
        })
      }

      ),
      concatMap(document =>
        document.putAttachment(
          { id: Moment.PHOTO_ATTACHMENT_ID, data: photo, type: photo.type },
          true
        )
      ),
      map(attachment => attachment.doc)
    );
  }

  remove$(id: string) {
    return this.collection$.pipe(concatMap(c => c.bulkRemove([id])));
  }
}

const COLLECTION_NAME = 'moments';
