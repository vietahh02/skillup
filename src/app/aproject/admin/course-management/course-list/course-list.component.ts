import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
    selector: 'app-admin-course-list',
    imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
],
    templateUrl: './course-list.component.html',
    styleUrls: ['./course-list.component.scss'],
})
export class AdminCourseList implements AfterViewInit {
    displayedColumns: string[] = [
        'id',
        'name',
        'type',
        'createdBy',
        'createdDate',
        'status',
        'action',
    ];

    data = new MatTableDataSource<any>(fakeCourses);
    searchTerm = '';

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    ngAfterViewInit() {
        this.data.paginator = this.paginator;

        this.data.filterPredicate = (data, filter) =>
            data.name.toLowerCase().includes(filter) || data.email.toLowerCase().includes(filter);
    }

    search() {
        this.data.filter = this.searchTerm.trim().toLowerCase();
        if (this.data.paginator) {
            this.data.paginator.firstPage();
        }
    }
}

const fakeCourses = [
    {
        id: 1,
        name: 'Introduction to React',
        type: 'Programming',
        createdBy: 'John Smith',
        createdDate: '2025-01-15',
        status: 'Approved',
    },
    {
        id: 2,
        name: 'Advanced JavaScript',
        type: 'Programming',
        createdBy: 'Emma Wilson',
        createdDate: '2025-02-20',
        status: 'Pending',
    },
    {
        id: 3,
        name: 'Digital Marketing Basics',
        type: 'Marketing',
        createdBy: 'Sarah Johnson',
        createdDate: '2025-03-10',
        status: 'Approved',
    },
    {
        id: 4,
        name: 'Web Design Fundamentals',
        type: 'Design',
        createdBy: 'Mike Brown',
        createdDate: '2025-03-15',
        status: 'Rejected',
    },
    {
        id: 5,
        name: 'Data Science with Python',
        type: 'Data Science',
        createdBy: 'Lisa Anderson',
        createdDate: '2025-04-01',
        status: 'Approved',
    },
    {
        id: 6,
        name: 'UI/UX Design Principles',
        type: 'Design',
        createdBy: 'Alex Thompson',
        createdDate: '2025-04-15',
        status: 'Pending',
    },
    {
        id: 7,
        name: 'Social Media Marketing',
        type: 'Marketing',
        createdBy: 'Emily Davis',
        createdDate: '2025-05-01',
        status: 'Rejected',
    },
    {
        id: 8,
        name: 'Machine Learning Fundamentals',
        type: 'Data Science',
        createdBy: 'David Wilson',
        createdDate: '2025-05-15',
        status: 'Approved',
    },
    {
        id: 9,
        name: 'Node.js Backend Development',
        type: 'Programming',
        createdBy: 'Michael Chen',
        createdDate: '2025-06-01',
        status: 'Pending',
    },
    {
        id: 10,
        name: 'Mobile App Design',
        type: 'Design',
        createdBy: 'Sophie Martin',
        createdDate: '2025-06-15',
        status: 'Approved',
    },
    {
        id: 11,
        name: 'Email Marketing Strategies',
        type: 'Marketing',
        createdBy: 'Oliver Taylor',
        createdDate: '2025-07-01',
        status: 'Rejected',
    },
    {
        id: 12,
        name: 'Python for Data Analysis',
        type: 'Data Science',
        createdBy: 'Anna White',
        createdDate: '2025-07-15',
        status: 'Approved',
    },
    {
        id: 13,
        name: 'Vue.js Frontend Development',
        type: 'Programming',
        createdBy: 'James Lee',
        createdDate: '2025-08-01',
        status: 'Pending',
    },
];
