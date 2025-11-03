import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeritFormComponent } from './merit-form.component';

describe('MeritFormComponent', () => {
  let component: MeritFormComponent;
  let fixture: ComponentFixture<MeritFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeritFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeritFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
