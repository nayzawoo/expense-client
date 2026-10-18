import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiV1 } from '../../../core';
import { Profile, UpdateProfileRequest } from './profile.models';

@Injectable()
export class ProfileApi {
  private readonly http = inject(HttpClient);

  get(): Observable<Profile> {
    return this.http.get<Profile>(apiV1('/profile'));
  }

  update(body: UpdateProfileRequest): Observable<Profile> {
    return this.http.put<Profile>(apiV1('/profile'), body);
  }
}
