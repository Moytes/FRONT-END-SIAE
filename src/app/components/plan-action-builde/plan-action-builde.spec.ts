import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanActionBuilde } from './plan-action-builde';

describe('PlanActionBuilde', () => {
  let component: PlanActionBuilde;
  let fixture: ComponentFixture<PlanActionBuilde>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanActionBuilde]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanActionBuilde);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
