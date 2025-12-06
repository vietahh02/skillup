import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {

    private loading = new BehaviorSubject<boolean>(false);

    get isLoading$() {
        return this.loading.asObservable();
    }

    offLoading() {
        this.loading.next(false);
    }

    onLoading() {
        this.loading.next(true);
    }

}