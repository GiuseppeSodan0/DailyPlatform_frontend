import { TestBed } from '@angular/core/testing';
import { Formazione } from './formazione';

describe('Formazione', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Formazione],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(Formazione);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
