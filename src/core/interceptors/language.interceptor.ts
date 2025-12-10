import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
    constructor() {}

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const lang = localStorage.getItem('language') || 'en';

        const langRequest = request.clone({
            setHeaders: {
                'Accept-Language': lang,
            },
        });

        return next.handle(langRequest);
    }
}
