import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitoRegistro } from './exito-registro';

describe('ExitoRegistro', () => {
  let component: ExitoRegistro;
  let fixture: ComponentFixture<ExitoRegistro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExitoRegistro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExitoRegistro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
