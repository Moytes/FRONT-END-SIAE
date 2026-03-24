import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Renderers } from './renderers';

describe('Renderers', () => {
  let component: Renderers;
  let fixture: ComponentFixture<Renderers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Renderers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Renderers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
