import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { API_URLS } from '../app.config';
import { GeoCity, GeoTownship } from '../models/geo.model';

@Injectable({
  providedIn: 'root'
})
export class ApiGeoServices {

  constructor(private http: HttpClient) { }

  getCities(): Observable<GeoCity[]> {
    return this.http.get<any>(API_URLS.GEO_CITY).pipe(switchMap((data: any) => of(data.result)));
  }

  getTownships( cityId: number | string ): Observable<GeoTownship[]> {
    return this.http.get<any>(API_URLS.GEO_TOWNSHIP, { params: { cityId } }).pipe(switchMap((data: any) => of(data.result)));
  }

}