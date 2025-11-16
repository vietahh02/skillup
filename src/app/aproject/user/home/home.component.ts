import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from "@angular/material/card";
import { Router } from '@angular/router';
import { ApiAuthServices } from '../../../services/auth.service';

@Component({
    selector: 'app-home',
    imports: [MatCard, MatCardContent, MatButtonModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class Home {
    constructor(private router: Router) {}

    ngOnInit() {
    }

    detailCourse(course: any) {
        this.router.navigate([`/course-detail/${course.id}`])
    }

}

