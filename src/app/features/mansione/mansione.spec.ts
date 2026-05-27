import { TestBed } from '@angular/core/testing';
import { Mansione } from './mansione';

describe('Mansione', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mansione],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(Mansione);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
