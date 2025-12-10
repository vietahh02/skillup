import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationManagementComponent } from './application-management.component';

describe('ApplicationManagementComponent', () => {
  let component: ApplicationManagementComponent;
  let fixture: ComponentFixture<ApplicationManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
