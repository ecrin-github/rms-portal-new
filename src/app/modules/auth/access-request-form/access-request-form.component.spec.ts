import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessRequestFormComponent } from './access-request-form.component';

describe('AccessRequestFormComponent', () => {
  let component: AccessRequestFormComponent;
  let fixture: ComponentFixture<AccessRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessRequestFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
