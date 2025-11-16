import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";


@Component({
    selector: 'app-admin-course',
    imports: [RouterOutlet],
    templateUrl: './course-management.component.html',
    styleUrls: ['./course-management.component.scss'],
})
export class AdminCourseManagement {}