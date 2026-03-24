import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AIAnalysisRenderer } from './aianalysis-renderer';

describe('AIAnalysisRenderer', () => {
  let component: AIAnalysisRenderer;
  let fixture: ComponentFixture<AIAnalysisRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AIAnalysisRenderer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AIAnalysisRenderer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
