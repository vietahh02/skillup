import { Routes } from '@angular/router';
import { User } from './aproject/user/user.component';
import { Home } from './aproject/user/home/home.component';
import { MyCoursesComponent } from './aproject/user/my-courses/my-courses.component';
import { CourseDetail } from './aproject/user/course-detail/course-detail.component';
import { Admin } from './aproject/admin/admin.component';
import { AdminDashboard } from './aproject/admin/admin-dashboard/admin-dashboard.component';
import { AdminUserManagement } from './aproject/admin/user-management/user-management.component';
import { AdminUserList } from './aproject/admin/user-management/user-list/user-list.component';
import { AdminUserDetail } from './aproject/admin/user-management/user-detail/user-detail.component';
import { AdminCourseManagement } from './aproject/admin/course-management/course-management.component';
import { AdminCourseList } from './aproject/admin/course-management/course-list/course-list.component';
import { Manager } from './aproject/manager/manager.component';
import { ManagerDashboard } from './aproject/manager/manager-dashboard/manager-dashboard.component';
import { ManagerUserManagement } from './aproject/manager/manager-user/manager-user.component';
import { ManagerUserList } from './aproject/manager/manager-user/user-list/user-list.component';
import { ManagerUserDetail } from './aproject/manager/manager-user/user-detail/user-detail.component';
import { ManagerCourseManagement } from './aproject/manager/manager-course/manager-course.component';
import { ManagerCourseList } from './aproject/manager/manager-course/course-list/course-list.component';
import { ManagerCourseDetail } from './aproject/manager/manager-course/course-detail/course-detail.component';
import { Lecturer } from './aproject/lecturer/lecturer.component';
import { LecturerCourseList } from './aproject/lecturer/course-management/course-list/course-list.component';
import { LecturerCourseManagement } from './aproject/lecturer/course-management/course-management.component';
import { LecturerCourseDetail } from './aproject/lecturer/course-management/course-detail-lesson-list/course-detail.component';
import { NotFoundComponent } from './common/not-found/not-found.component';
import { ProfileComponent } from './common/profile/profile.component';
import { SecurityComponent } from './common/security/security.component';
import { CourseLearnComponent } from './aproject/user/course-learn/course-learn.component';
import { LoginComponent } from './common/authentication/login/login.component';
import { QuizCreatorComponent } from './aproject/lecturer/course-management/quiz-creator/quiz-creator.component';
import { QuizComponent } from './aproject/user/quiz/quiz.component';
import { ChatComponent } from './aproject/user/chat/chat.component';
import { ManagerChatComponent } from './aproject/manager/manager-chat/manager-chat.component';
import { RoadmapFormComponent } from './aproject/manager/manager-roadmap/roadmap-form/roadmap-form.component';
import { RoadmapDetailComponent } from './aproject/manager/manager-roadmap/roadmap-detail/roadmap-detail.component';
import { ManagerRoadmapComponent } from './aproject/manager/manager-roadmap/manager-roadmap/manager-roadmap.component';
import { RoadMap } from './aproject/user/roadmap/roadmap-detail/roadmap.component';
import { RoadmapListComponent } from './aproject/user/roadmap/roadmap-list/roadmap-list.component';


export const routes: Routes = [
    //project
    {path: 'login', component: LoginComponent},
    {
        path: '', component: User,
        children: [
            {path: '', component: Home},
            {path: 'my-courses', component: MyCoursesComponent},
            {path: 'profile', component: ProfileComponent},
            {path: 'security', component: SecurityComponent},
            {path: 'course-detail/:id', component: CourseDetail},
            {path: 'course/learn/:id', component: CourseLearnComponent},
            {path: 'quiz/:id', component: QuizComponent},
            {path: 'roadmap', component: RoadmapListComponent},
            {path: 'roadmap/:id', component: RoadMap},
            {path: 'chat', component: ChatComponent},
        ]
    },
    {
        path:'admin', 
        component: Admin,
        children: [
            {path: '', component: AdminDashboard},
            {path: 'users', component: AdminUserManagement, 
                children:[
                    {path: '', component: AdminUserList},
                    {path: ':id', component: AdminUserDetail}
                ]
            },
            {path: 'courses', component: AdminCourseManagement,
                children: [
                    {path: '', component: AdminCourseList}
                ]
            }
        ]
    },
    {
        path: 'manager',
        component: Manager,
        children: [
            {path: '', component: ManagerDashboard},
            {path: 'chat', component: ManagerChatComponent},
            {path: 'users', component: ManagerUserManagement,
                children: [
                    {path: '', component: ManagerUserList},
                    {path: ':id', component: ManagerUserDetail},
                ]
            },
            {path: 'courses', component: ManagerCourseManagement,
                children: [
                    {path: '', component: ManagerCourseList},
                    {path: ':id', component: ManagerCourseDetail}
                ]
            },
            {path: 'roadmaps', component: ManagerRoadmapComponent},
            {path: 'roadmaps/create', component: RoadmapFormComponent},
            {path: 'roadmaps/edit/:id', component: RoadmapFormComponent},
            {path: 'roadmaps/detail/:id', component: RoadmapDetailComponent}
        ]
    },
    {
        path: 'lecturer',
        component: Lecturer,
        children: [
            {path: '', component: LecturerCourseList},
            {path: 'courses', component: LecturerCourseManagement,
                children: [
                    {path: '', component:LecturerCourseList},
                    {path: ':id', component:LecturerCourseDetail},
                    {path: ':id/quiz', component:QuizCreatorComponent},
                ]
            },
            {path: 'quiz', component: QuizCreatorComponent},
        ]
    },
    //endProject

    {path: '**', component: NotFoundComponent} // This line will remain down from the whole pages component list
];