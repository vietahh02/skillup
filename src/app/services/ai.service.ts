import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { API_URLS } from '../constants';
import { AiChatResponse, ConversationModel } from '../models/ai.models';

@Injectable({
  providedIn: 'root'
})
export class ApiAiServices {

  constructor(private http: HttpClient) { }

  getAiChat(payload: ConversationModel): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(API_URLS.GET_AI_CHAT, payload);
  }
}