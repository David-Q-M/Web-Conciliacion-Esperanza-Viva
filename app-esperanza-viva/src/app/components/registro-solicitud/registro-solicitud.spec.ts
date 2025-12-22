import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroSolicitud } from './registro-solicitud';

describe('RegistroSolicitud', () => {
  let component: RegistroSolicitud;
  let fixture: ComponentFixture<RegistroSolicitud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroSolicitud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroSolicitud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
