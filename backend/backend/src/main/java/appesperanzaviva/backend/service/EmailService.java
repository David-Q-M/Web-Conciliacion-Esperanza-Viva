package appesperanzaviva.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false) // Optional: Won't crash if mail is not configured in application.properties
    private JavaMailSender mailSender;

    public void enviarNotificacionProgramacion(String to, String expediente, String fecha, String hora, String lugar) {
        if (mailSender == null) {
            System.out.println("⚠️ MAIL SENDER NO CONFIGURADO: Se omitió el envío de correo a " + to);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("notificaciones@esperanzaviva.com");
            message.setTo(to);
            message.setSubject("Citación a Audiencia de Conciliación - Exp: " + expediente);
            message.setText("Estimado(a),\n\n" +
                    "Se ha programado una audiencia de conciliación para su caso.\n\n" +
                    "📅 Fecha: " + fecha + "\n" +
                    "⏰ Hora: " + hora + "\n" +
                    "📍 Lugar: " + lugar + "\n\n" +
                    "Por favor, asista puntualmente o comuníquese con nosotros si tiene inconvenientes.\n\n" +
                    "Atentamente,\n" +
                    "Centro de Conciliación Esperanza Viva");

            mailSender.send(message);
            System.out.println("✅ Correo enviado exitosamente a: " + to);
        } catch (Exception e) {
            System.err.println("❌ Error enviando correo: " + e.getMessage());
        }
    }
}
