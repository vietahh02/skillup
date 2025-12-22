import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URLS } from '../constants';
import {
  LearningPath,
  LearningPathsResponse,
  LearningPathItem,
  CreateLearningPathRequest,
  CreateLearningPathItemRequest,
  UpdateLearningPathItemRequest,
  LearningPathEnrollment,
  EnrollLearningPathRequest,
  LearningPathProgressSummary,
  LearningPathStatistics,
  DetailedEnrollmentsResponse
} from '../models/learning-path.models';

@Injectable({
  providedIn: 'root'
})
export class LearningPathService {

  constructor(private http: HttpClient) { }

  // ========== LEARNING PATHS CRUD ==========

  /**
   * Get paginated learning paths
   * GET /api/learning-paths?q=search&page=1&pageSize=20
   */
  getLearningPaths(page: number = 1, pageSize: number = 10, searchTerm?: string): Observable<LearningPathsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm && searchTerm.trim()) {
      params = params.set('q', searchTerm.trim());
    }

    return this.http.get<LearningPathsResponse>(API_URLS.GET_LEARNING_PATHS, { params });
  }

  /**
   * Get learning path detail by ID
   * GET /api/learning-paths/{id}
   */
  getLearningPathById(id: number): Observable<LearningPath> {
    return this.http.get<LearningPath>(`${API_URLS.GET_LEARNING_PATH_BY_ID}/${id}`);
  }

  /**
   * Create new learning path
   * POST /api/learning-paths
   */
  createLearningPath(data: CreateLearningPathRequest): Observable<LearningPath> {
    return this.http.post<LearningPath>(API_URLS.CREATE_LEARNING_PATH, data);
  }

  /**
   * Update learning path
   * PUT /api/learning-paths/{id}
   */
  updateLearningPath(id: number, data: CreateLearningPathRequest): Observable<LearningPath> {
    return this.http.put<LearningPath>(`${API_URLS.UPDATE_LEARNING_PATH}/${id}`, data);
  }

  /**
   * Delete learning path (soft delete)
   * DELETE /api/learning-paths/{id}
   */
  deleteLearningPath(id: number): Observable<any> {
    return this.http.delete(`${API_URLS.DELETE_LEARNING_PATH}/${id}`);
  }

  /**
   * Update learning path status (Active/Inactive)
   * PATCH /api/learning-paths/{id}/status
   */
  updateLearningPathStatus(id: number, status: 'Active' | 'Inactive'): Observable<any> {
    return this.http.patch(`${API_URLS.UPDATE_LEARNING_PATH_STATUS}/${id}/status`, { status });
  }

  /**
   * Restore deleted learning path
   * PATCH /api/learning-paths/{id}/restore
   */
  restoreLearningPath(id: number): Observable<any> {
    return this.http.patch(`${API_URLS.RESTORE_LEARNING_PATH}/${id}/restore`, {});
  }

  // ========== LEARNING PATH ITEMS (COURSES) ==========

  /**
   * Get learning path items (courses in path)
   * GET /api/learning-paths/{learningPathId}/items?order=asc
   */
  getLearningPathItems(learningPathId: number, order: 'asc' | 'desc' = 'asc'): Observable<LearningPathItem[]> {
    const params = new HttpParams().set('order', order);
    return this.http.get<LearningPathItem[]>(
      `${API_URLS.GET_LEARNING_PATH_ITEMS}/${learningPathId}/items`,
      { params }
    );
  }

  /**
   * Create new learning path item (add course to path)
   * POST /api/learning-paths/{learningPathId}/items
   */
  createLearningPathItem(learningPathId: number, data: CreateLearningPathItemRequest): Observable<LearningPathItem> {
    return this.http.post<LearningPathItem>(
      `${API_URLS.CREATE_LEARNING_PATH_ITEM}/${learningPathId}/items`,
      data
    );
  }

  /**
   * Update learning path item
   * PUT /api/learning-path-items/{id}
   */
  updateLearningPathItem(id: number, data: UpdateLearningPathItemRequest): Observable<LearningPathItem> {
    return this.http.put<LearningPathItem>(`${API_URLS.UPDATE_LEARNING_PATH_ITEM}/${id}`, data);
  }

  /**
   * Delete learning path item (remove course from path)
   * DELETE /api/learning-path-items/{id}
   */
  deleteLearningPathItem(id: number): Observable<any> {
    return this.http.delete(`${API_URLS.DELETE_LEARNING_PATH_ITEM}/${id}`);
  }

  /**
   * Reorder learning path item
   * PATCH /api/learning-path-items/{id}/order
   */
  reorderLearningPathItem(id: number, newOrderIndex: number): Observable<any> {
    return this.http.patch(`${API_URLS.REORDER_LEARNING_PATH_ITEM}/${id}/order`, {
      newOrderIndex
    });
  }

  // ========== LEARNING PATH ENROLLMENTS (NEW) ==========

  /**
   * Enroll in a learning path
   * POST /api/learning-path-enrollments
   */
  enrollInLearningPath(learningPathId: number): Observable<LearningPathEnrollment> {
    const data: EnrollLearningPathRequest = { learningPathId };
    return this.http.post<LearningPathEnrollment>(API_URLS.CREATE_LEARNING_PATH_ENROLLMENT, data);
  }

  /**
   * Get current user's enrolled learning paths
   * GET /api/learning-path-enrollments/my-enrollments
   */
  getMyEnrollments(): Observable<LearningPathEnrollment[]> {
    return this.http.get<LearningPathEnrollment[]>(API_URLS.GET_MY_LEARNING_PATH_ENROLLMENTS);
  }

  /**
   * Unenroll from a learning path (DEPRECATED - use toggleEnrollmentActive instead)
   * DELETE /api/learning-path-enrollments/{enrollmentId}
   */
  unenrollFromLearningPath(enrollmentId: number): Observable<any> {
    return this.http.delete(`${API_URLS.DELETE_LEARNING_PATH_ENROLLMENT}/${enrollmentId}`);
  }

  /**
   * Toggle enrollment active/inactive (new API)
   * PATCH /api/learning-path-enrollments/{enrollmentId}/toggle-active
   * @param enrollmentId - The enrollment ID
   * @param isActive - true to activate, false to deactivate (unenroll)
   */
  toggleEnrollmentActive(enrollmentId: number, isActive: boolean): Observable<any> {
    return this.http.patch(`${API_URLS.TOGGLE_ENROLLMENT_ACTIVE}/${enrollmentId}/toggle-active`, { isActive });
  }

  /**
   * Get progress summary for a learning path
   * GET /api/learning-paths/{learningPathId}/progress/summary
   */
  getProgressSummary(learningPathId: number): Observable<LearningPathProgressSummary> {
    return this.http.get<LearningPathProgressSummary>(
      `${API_URLS.GET_LEARNING_PATH_PROGRESS_SUMMARY}/${learningPathId}/progress/summary`
    );
  }

  /**
   * Get learning path statistics (for Manager dashboard)
   * GET /api/learning-paths/statistics
   */
  getStatistics(): Observable<LearningPathStatistics> {
    return this.http.get<LearningPathStatistics>(API_URLS.GET_LEARNING_PATH_STATISTICS);
  }

  /**
   * Get all enrollments with details (for Manager user progress table)
   * GET /api/learning-path-enrollments/all?page=1&pageSize=10&search=query
   */
  getAllEnrollments(page: number = 1, pageSize: number = 10, search: string = ''): Observable<DetailedEnrollmentsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<DetailedEnrollmentsResponse>(API_URLS.GET_ALL_ENROLLMENTS, { params });
  }

  // ========== LEARNING PATH ASSIGNMENTS (Manager) ==========

  /**
   * Manager assign Learning Path to Employee
   * POST /api/learning-path-enrollments
   * BE sẽ tự động set enrollmentType = "assigned" khi Manager enroll user khác
   */
  assignLearningPath(userId: number, learningPathId: number): Observable<LearningPathEnrollment> {
    const body: EnrollLearningPathRequest = {
      userId,
      learningPathId,
      enrollmentType: 'assigned' // Explicitly set for clarity
    };
    return this.http.post<LearningPathEnrollment>(API_URLS.CREATE_LEARNING_PATH_ENROLLMENT, body);
  }

  /**
   * Get assignments for a specific user
   * Filter từ GET_ALL_ENROLLMENTS với userId và enrollmentType = 'assigned'
   */
  getUserAssignments(userId: number, status?: string): Observable<LearningPathEnrollment[]> {
    // Use GET_ALL_ENROLLMENTS and filter by userId and enrollmentType
    let params = new HttpParams()
      .set('page', '1')
      .set('pageSize', '100'); // Get all to filter on frontend
    
    // Try to add userId filter if BE supports it
    params = params.set('userId', userId.toString());
    
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<DetailedEnrollmentsResponse>(API_URLS.GET_ALL_ENROLLMENTS, { params }).pipe(
      map(response => {
        // Filter by userId first
        let userEnrollments = response.items.filter(item => item.userId === userId);
        
        // Check if any item has enrollmentType field
        const hasEnrollmentType = userEnrollments.some(item => item.enrollmentType !== undefined);
        
        let filtered: typeof userEnrollments;
        
        if (hasEnrollmentType) {
          // If enrollmentType exists, filter by 'assigned'
          filtered = userEnrollments.filter(item => item.enrollmentType === 'assigned');
        } else {
          // If enrollmentType is missing from response, return all user enrollments
          // This is a workaround - BE should add enrollmentType to GET_ALL_ENROLLMENTS response
          filtered = userEnrollments;
        }
        
        // Map DetailedEnrollment to LearningPathEnrollment format
        return filtered.map(item => ({
          learningPathEnrollmentId: item.learningPathEnrollmentId,
          userId: item.userId,
          learningPathId: item.learningPathId,
          learningPathName: item.learningPathName,
          userName: item.userName,
          status: item.status,
          progressPct: item.progressPct,
          startedAt: item.startedAt,
          completedAt: item.completedAt,
          createdAt: item.startedAt,
          updatedAt: item.completedAt || item.startedAt,
          enrollmentType: (item.enrollmentType || 'assigned') as 'assigned' | 'self-enrolled'
        }));
      })
    );
  }

  /**
   * Export User Progress Tracking to Excel
   * GET /api/learning-path-enrollments/export-excel
   */
  exportUserProgressExcel(
    searchTerm?: string, 
    enrollmentType?: 'all' | 'assigned' | 'self-enrolled',
    dateFrom?: string,
    dateTo?: string
  ): Observable<Blob> {
    let params = new HttpParams();
    
    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }
    
    if (enrollmentType && enrollmentType !== 'all') {
      params = params.set('enrollmentType', enrollmentType);
    }

    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }

    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }

    return this.http.get(API_URLS.EXPORT_USER_PROGRESS_EXCEL, {
      params,
      responseType: 'blob'
    });
  }
}
