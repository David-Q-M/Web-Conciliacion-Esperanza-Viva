package appesperanzaviva.backend.service;

import appesperanzaviva.backend.entity.Audiencia;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;

@Service
public class PdfService {

    public byte[] generarActaConciliacion(Audiencia audiencia) throws DocumentException {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);

        document.open();

        // 1. Cabecera Esperanza Viva
        Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.DARK_GRAY);
        Paragraph titulo = new Paragraph("CENTRO DE CONCILIACIÓN\n\"ESPERANZA VIVA\"", fontTitulo);
        titulo.setAlignment(Element.ALIGN_CENTER);
        document.add(titulo);

        document.add(new Paragraph("\n"));

        // 2. Subtítulo: Acta Número...
        Font fontSub = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK);
        Paragraph sub = new Paragraph("ACTA DE CONCILIACIÓN Nº " + audiencia.getId(), fontSub);
        sub.setAlignment(Element.ALIGN_CENTER);
        document.add(sub);

        Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);
        Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK);

        document.add(new Paragraph("\n"));

        // 3. Datos del Expediente
        document.add(new Paragraph("Expediente: " + audiencia.getSolicitud().getNumeroExpediente(), fontBold));
        document.add(new Paragraph("Fecha: "
                + new SimpleDateFormat("dd/MM/yyyy").format(java.sql.Date.valueOf(audiencia.getFechaAudiencia())),
                fontNormal));
        document.add(new Paragraph("Lugar: " + audiencia.getLugar(), fontNormal));

        document.add(new Paragraph("\n"));
        document.add(new Paragraph("PARTES INTERVINIENTES:", fontBold));

        // Solicitante
        String solName = audiencia.getSolicitud().getSolicitante() != null
                ? audiencia.getSolicitud().getSolicitante().getNombres() + " "
                        + audiencia.getSolicitud().getSolicitante().getApellidos()
                : "---";
        document.add(new Paragraph("Solicitante: " + solName, fontNormal));

        // Invitado
        String invName = audiencia.getSolicitud().getInvitado() != null
                ? audiencia.getSolicitud().getInvitado().getNombres() + " "
                        + audiencia.getSolicitud().getInvitado().getApellidos()
                : "---";
        document.add(new Paragraph("Invitado: " + invName, fontNormal));

        document.add(new Paragraph("\n"));
        document.add(new Paragraph("MATERIA A CONCILIAR:", fontBold));
        document.add(new Paragraph(audiencia.getSolicitud().getMateriaConciliable(), fontNormal));

        document.add(new Paragraph("\n"));
        document.add(new Paragraph("ACUERDOS / RESULTADO:", fontBold));

        String resultado = audiencia.getResultadoDetalle() != null ? audiencia.getResultadoDetalle()
                : "Sin resultado registrado aún.";
        document.add(new Paragraph(resultado, fontNormal));

        document.add(new Paragraph("\n\n\n\n"));

        // Firmas (Placeholders)
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell(new Phrase("______________________\nSolicitante"));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);

        cell = new PdfPCell(new Phrase("______________________\nConciliador"));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);

        cell = new PdfPCell(new Phrase("______________________\nInvitado"));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);

        document.add(table);

        document.close();
        return out.toByteArray();
    }
}
