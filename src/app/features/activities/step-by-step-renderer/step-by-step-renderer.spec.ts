import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepByStepRenderer } from './step-by-step-renderer';

describe('StepByStepRenderer', () => {
  let component: StepByStepRenderer;
  let fixture: ComponentFixture<StepByStepRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepByStepRenderer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepByStepRenderer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
