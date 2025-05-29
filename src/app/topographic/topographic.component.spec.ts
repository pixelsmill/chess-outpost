import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopographicComponent } from './topographic.component';

describe('TopographicComponent', () => {
  let component: TopographicComponent;
  let fixture: ComponentFixture<TopographicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopographicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopographicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
