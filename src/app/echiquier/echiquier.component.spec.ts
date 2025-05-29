import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EchiquierComponent } from './echiquier.component';

describe('EchiquierComponent', () => {
  let component: EchiquierComponent;
  let fixture: ComponentFixture<EchiquierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EchiquierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EchiquierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
