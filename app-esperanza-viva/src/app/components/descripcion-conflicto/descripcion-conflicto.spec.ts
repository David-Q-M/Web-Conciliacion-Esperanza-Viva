import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescripcionConflicto } from './descripcion-conflicto';

describe('DescripcionConflicto', () => {
  let component: DescripcionConflicto;
  let fixture: ComponentFixture<DescripcionConflicto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescripcionConflicto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescripcionConflicto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
