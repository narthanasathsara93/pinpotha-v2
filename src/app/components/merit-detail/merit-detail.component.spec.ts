import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeritDetailComponent } from './merit-detail.component';

describe('MeritDetailComponent', () => {
  let component: MeritDetailComponent;
  let fixture: ComponentFixture<MeritDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeritDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeritDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
