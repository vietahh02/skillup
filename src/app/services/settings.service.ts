import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../constants';
import {
  AiKeySettings,
  UpdateAiKeyRequest
} from '../models/settings.models';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private http: HttpClient) { }

  /**
   * Get AI API Key (masked)
   * GET /api/settings/ai-key
   */
  getAiKey(): Observable<AiKeySettings> {
    return this.http.get<AiKeySettings>(API_URLS.GET_AI_KEY);
  }

  /**
   * Update AI API Key
   * PUT /api/settings/ai-key
   */
  updateAiKey(apiKey: string): Observable<AiKeySettings> {
    const request: UpdateAiKeyRequest = { apiKey };
    return this.http.put<AiKeySettings>(API_URLS.UPDATE_AI_KEY, request);
  }
}
