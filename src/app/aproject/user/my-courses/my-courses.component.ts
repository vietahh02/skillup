import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCard, MatCardContent } from "@angular/material/card";
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-my-courses',
    imports: [MatTableModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatCard, MatCardContent, FormsModule],
    templateUrl: './my-courses.component.html',
    styleUrls: ['./my-courses.component.scss']
})
export class MyCoursesComponent {
    constructor(private router: Router) {}

    displayedColumns: string[] = ['course', 'instructor', 'status', 'startTime', 'endTime'];
    dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
    searchTerm = ''

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    detailCourse(course: any) {
        this.router.navigate([`/course-detail/${course.id}`])
    }

    search() {}

    passed = true; 
    failed = true;
    percentage = true;

}
export interface PeriodicElement {
    id: number | string;
    startTime: any;
    instructor: string;
    endTime: any;
    course: any;
    status: any;
}
const ELEMENT_DATA: PeriodicElement[] = [
    {
        id: 1,
        course: {
            title: 'Node.js for Beginners: Go From Zero to Hero with Node.js',
            image: 'img/lms/lms1.jpg',
        },
        instructor: "Eddie Bryan",
        startTime: {
            date: '19/02/2023',
            time: '10:00 AM',
        },
        endTime: {
            date: '19/02/2023',
            time: '11:00 AM',
        },
        status: {
            percentage: '87%'
        }
    },
    {
        id: 2,
        course: {
            title: 'Learn the Fundamentals of working with Angular and How to Create ',
            image: 'img/lms/lms2.jpg',
        },
        instructor: "Merri Diamond",
        startTime: {
            date: '18/02/2023',
            time: '04:00 AM',
        },
        endTime: {
            date: '18/02/2023',
            time: '05:00 AM',
        },
        status: {
            failed: 'Failed',
        }
    },
    {
        id: 3,
        course: {
            title: 'Build an iOS Application in Swift Learn the Fundamentals',
            image: 'img/lms/lms3.jpg',
        },
        instructor: "Albarto Bryan",
        startTime: {
            date: '17/02/2023',
            time: '05:00 PM',
        },
        endTime: {
            date: '17/02/2023',
            time: '06:00 PM',
        },
        status: {
            passed: 'Passed',
        }
    },
    {
        id: 4,
        course: {
            title: 'Programming Language Become a React Native Developer',
            image: 'img/lms/lms4.jpg',
        },
        instructor: "Harry McCall",
        startTime: {
            date: '16/02/2023',
            time: '12:00 PM',
        },
        endTime: {
            date: '16/02/2023',
            time: '01:00 PM',
        },
        status: {
            percentage: '50%'
        }
    },
    {
        id: 5,
        course: {
            title: 'The Data Science Course 2023: Complete Data Science Bootcamp',
            image: 'img/lms/lms5.jpg',
        },
        instructor: "Eddie",
        startTime: {
            date: '15/02/2023',
            time: '03:00 AM',
        },
        endTime: {
            date: '15/02/2023',
            time: '04:00 AM',
        },
        status: {
            passed: 'Passed',
        }
    },
    {
        id: 6,
        course: {
            title: 'Java Programming Masterclass for Software Developers',
            image: 'img/lms/lms6.jpg',
        },
        instructor: "Paul Schmidt",
        startTime: {
            date: '14/02/2023',
            time: '01:00 AM',
        },
        endTime: {
            date: '14/02/2023',
            time: '02:00 AM',
        },
        status: {
            percentage: '32%'
        }
    },
    {
        id: 7,
        course: {
            title: 'Deep Learning A-Z™: Hands-On Artificial Neural Networks',
            image: 'img/lms/lms7.jpg',
        },
        instructor: "Wendy Keen",
        startTime: {
            date: '13/02/2023',
            time: '08:00 PM',
        },
        endTime: {
            date: '13/02/2023',
            time: '09:00 PM',
        },
        status: {
            failed: 'Failed',
        }
    },
    {
        id: 8,
        course: {
            title: 'Python for Finance: Investment Fundamentals & Data Analytics',
            image: 'img/lms/lms8.jpg',
        },
        instructor: "Elijah Murray",
        startTime: {
            date: '12/02/2023',
            time: '09:00 AM',
        },
        endTime: {
            date: '12/02/2023',
            time: '10:00 AM',
        },
        status: {
            passed: 'Passed',
        }
    },
    {
        id: 9,
        course: {
            title: 'Node.js for Beginners: Go From Zero to Hero with Node.js',
            image: 'img/lms/lms1.jpg',
        },
        instructor: "Alvarado Turner",
        startTime: {
            date: '19/02/2023',
            time: '10:00 AM',
        },
        endTime: {
            date: '19/02/2023',
            time: '11:00 AM',
        },
        status: {
            percentage: '87%'
        }
    },
    {
        id: 10,
        course: {
            title: 'Java Programming Masterclass for Software Developers',
            image: 'img/lms/lms6.jpg',
        },
        instructor: "Evangelina Mcclain",
        startTime: {
            date: '14/02/2023',
            time: '01:00 AM',
        },
        endTime: {
            date: '14/02/2023',
            time: '02:00 AM',
        },
        status: {
            percentage: '32%'
        }
    },
    {
        id: 11,
        course: {
            title: 'Deep Learning A-Z™: Hands-On Artificial Neural Networks',
            image: 'img/lms/lms7.jpg',
        },
        instructor: "Candice Munoz",
        startTime: {
            date: '13/02/2023',
            time: '08:00 PM',
        },
        endTime: {
            date: '13/02/2023',
            time: '09:00 PM',
        },
        status: {
            failed: 'Failed',
        }
    },
    {
        id: 12,
        course: {
            title: 'Python for Finance: Investment Fundamentals & Data Analytics',
            image: 'img/lms/lms8.jpg',
        },
        instructor: "Bernard Langley",
        startTime: {
            date: '12/02/2023',
            time: '09:00 AM',
        },
        endTime: {
            date: '12/02/2023',
            time: '10:00 AM',
        },
        status: {
            passed: 'Passed',
        }
    },
    {
        id: 13,
        course: {
            title: 'Node.js for Beginners: Go From Zero to Hero with Node.js',
            image: 'img/lms/lms1.jpg',
        },
        instructor: "Kristie Hall",
        startTime: {
            date: '19/02/2023',
            time: '10:00 AM',
        },
        endTime: {
            date: '19/02/2023',
            time: '11:00 AM',
        },
        status: {
            percentage: '87%'
        }
    },
    {
        id: 14,
        course: {
            title: 'Learn the Fundamentals of working with Angular and How to Create ',
            image: 'img/lms/lms2.jpg',
        },
        instructor: "Bolton Obrien",
        startTime: {
            date: '18/02/2023',
            time: '04:00 AM',
        },
        endTime: {
            date: '18/02/2023',
            time: '05:00 AM',
        },
        status: {
            failed: 'Failed',
        }
    },
    {
        id: 15,
        course: {
            title: 'Learn the Fundamentals of working with Angular and How to Create ',
            image: 'img/lms/lms2.jpg',
        },
        instructor: "Dee Alvarado",
        startTime: {
            date: '18/02/2023',
            time: '04:00 AM',
        },
        endTime: {
            date: '18/02/2023',
            time: '05:00 AM',
        },
        status: {
            failed: 'Failed',
        }
    },
    {
        id: 16,
        course: {
            title: 'Node.js for Beginners: Go From Zero to Hero with Node.js',
            image: 'img/lms/lms1.jpg',
        },
        instructor: "Cervantes Kramer",
        startTime: {
            date: '19/02/2023',
            time: '10:00 AM',
        },
        endTime: {
            date: '19/02/2023',
            time: '11:00 AM',
        },
        status: {
            percentage: '87%'
        }
    },
    {
        id: 17,
        course: {
            title: 'Learn the Fundamentals of working with Angular and How to Create ',
            image: 'img/lms/lms2.jpg',
        },
        instructor: "Dejesus Michael",
        startTime: {
            date: '18/02/2023',
            time: '04:00 AM',
        },
        endTime: {
            date: '18/02/2023',
            time: '05:00 AM',
        },
        status: {
            failed: 'Failed',
        }
    }
];
