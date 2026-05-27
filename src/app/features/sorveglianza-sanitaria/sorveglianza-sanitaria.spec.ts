import { TestBed } from '@angular/core/testing';
import { SorveglianzaSanitaria } from './sorveglianza-sanitaria';

describe('SorveglianzaSanitaria', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SorveglianzaSanitaria],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(SorveglianzaSanitaria);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
