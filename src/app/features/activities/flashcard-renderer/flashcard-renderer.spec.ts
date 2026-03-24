import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashcardRenderer } from './flashcard-renderer';

describe('FlashcardRenderer', () => {
  let component: FlashcardRenderer;
  let fixture: ComponentFixture<FlashcardRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashcardRenderer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlashcardRenderer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
