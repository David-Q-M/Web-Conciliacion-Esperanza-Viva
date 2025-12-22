import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaExpediente } from './consulta-expediente';

describe('ConsultaExpediente', () => {
  let component: ConsultaExpediente;
  let fixture: ComponentFixture<ConsultaExpediente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaExpediente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaExpediente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
