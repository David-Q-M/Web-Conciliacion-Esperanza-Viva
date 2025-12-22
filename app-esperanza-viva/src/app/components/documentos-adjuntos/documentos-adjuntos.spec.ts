import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentosAdjuntos } from './documentos-adjuntos';

describe('DocumentosAdjuntos', () => {
  let component: DocumentosAdjuntos;
  let fixture: ComponentFixture<DocumentosAdjuntos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentosAdjuntos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentosAdjuntos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
