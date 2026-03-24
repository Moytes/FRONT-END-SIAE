import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistRenderer } from './checklist-renderer';

describe('ChecklistRenderer', () => {
  let component: ChecklistRenderer;
  let fixture: ComponentFixture<ChecklistRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistRenderer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChecklistRenderer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
