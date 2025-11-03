import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeritListComponent } from './merit-list.component';

describe('MeritListComponent', () => {
  let component: MeritListComponent;
  let fixture: ComponentFixture<MeritListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeritListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeritListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
