package com.reservex.backend.services;

import com.reservex.backend.dto.ContactRequest;
import com.reservex.backend.entity.Reservation;
import com.reservex.backend.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

  private final JavaMailSender mailSender;
  private final QrCodeService qrCodeService;

  @Value("${spring.mail.username:}")
  private String fromEmail;

  @Value("${app.contact-recipient:}")
  private String contactRecipient;

  public void sendReservationConfirmation(User user, Reservation reservation) {
    if (fromEmail == null || fromEmail.isBlank()) {
      System.out.println(">>> Email not configured. Skipping email send.");
      return; // skip if mail not configured
    }

    try {
      System.out.println(">>> Generating QR code for reservation ID: " + reservation.getId());
      
      // Ensure reservation ID is not null
      if (reservation.getId() == null) {
        System.err.println(">>> ERROR: Reservation ID is null! Cannot generate QR code.");
        return;
      }
      
      // Generate QR code with reservation details
      byte[] qrBytes = qrCodeService.generateQrCodeForReservationWithDetails(
          reservation.getId(),
          reservation.getQrCodeToken(),
          user.getBusinessName() != null ? user.getBusinessName() : user.getUsername()
      );
      
      System.out.println(">>> QR code generated successfully. Size: " + qrBytes.length + " bytes");
      
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(fromEmail);
      helper.setTo(user.getEmail());
      helper.setSubject("Colombo International Book Fair - Stall Reservation Confirmed");
      
      String body = buildConfirmationBody(user, reservation);
      helper.setText(body, true);
      
      // Attach QR code as a downloadable PNG file with proper filename
      String qrFileName = "reservation-qr-" + reservation.getId() + ".png";
      org.springframework.core.io.ByteArrayResource qrResource = 
          new org.springframework.core.io.ByteArrayResource(qrBytes) {
            @Override
            public String getFilename() {
              return qrFileName;
            }
          };
      
      helper.addAttachment(qrFileName, qrResource, "image/png");
      
      System.out.println(">>> Sending email to: " + user.getEmail() + " with QR attachment: " + qrFileName);
      mailSender.send(message);
      System.out.println(">>> Email sent successfully!");
      
    } catch (MessagingException e) {
      System.err.println(">>> Failed to send confirmation email (MessagingException): " + e.getMessage());
      e.printStackTrace();
    } catch (Exception e) {
      System.err.println(">>> Unexpected error sending confirmation email: " + e.getMessage());
      e.printStackTrace();
    }
  }

  public void sendStallDeletionNotification(User user, String stallName, int currentBookings,
      boolean reservationCancelled) {
    if (fromEmail == null || fromEmail.isBlank())
      return;

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(fromEmail);
      helper.setTo(user.getEmail());
      helper.setSubject("Colombo International Book Fair - Stall Deleted from Your Reservation");
      String body = buildStallDeletionBody(user, stallName, currentBookings, reservationCancelled);
      helper.setText(body, true);
      mailSender.send(message);
    } catch (MessagingException | MailException e) {
      // Log the error but don't throw to avoid transaction rollback
      System.err.println("Failed to send stall deletion email to " + user.getEmail() + ": " + e.getMessage());
    }
  }

  public void sendStallUnreserveNotification(User user, String stallName, int currentBookings,
      boolean reservationCancelled) {
    if (fromEmail == null || fromEmail.isBlank())
      return;

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(fromEmail);
      helper.setTo(user.getEmail());
      helper.setSubject("Colombo International Book Fair - Stall Unreserved from Your Booking");
      String body = buildStallUnreserveBody(user, stallName, currentBookings, reservationCancelled);
      helper.setText(body, true);
      mailSender.send(message);
    } catch (MessagingException | MailException e) {
      // Log the error but don't throw to avoid transaction rollback
      System.err.println("Failed to send stall unreserve email to " + user.getEmail() + ": " + e.getMessage());
    }
  }

  private String buildStallDeletionBody(User user, String stallName, int currentBookings,
      boolean reservationCancelled) {
    String reason = "The stall \"" + stallName + "\" has been removed from the exhibition by the administrator.";
    String statusMsg;
    String additionalInfo;
    
    if (reservationCancelled) {
      statusMsg = "Your reservation has been <strong>cancelled</strong> because this was the only stall in your reservation.";
      additionalInfo = "<p style=\"color: #2563eb; font-weight: 600; margin-top: 16px;\">📌 You can book again at any time through the Publisher Portal.</p>";
    } else {
      statusMsg = "Your reservation is still active. Your current number of reserved stalls is now <strong>" + currentBookings + "</strong>.";
      additionalInfo = "<p style=\"color: #059669; font-weight: 600; margin-top: 16px;\">✓ Your remaining stalls are still confirmed.</p>";
    }
    
    return """
        <!DOCTYPE html>
        <html>
        <head>
        </head>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0;">
          <div style="width: 100%%; background-color: #f8fafc; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #dc2626; color: #ffffff; padding: 40px; text-align: center;">
                <h2 style="margin: 0; font-size: 28px; font-weight: 700;">⚠️ Stall Deletion Notice</h2>
              </div>
              <div style="padding: 40px;">
                <div style="font-size: 20px; color: #0f172a; margin-bottom: 24px; font-weight: 600;">Dear %s,</div>
                <div style="color: #475569; line-height: 1.6; margin-bottom: 24px; font-size: 16px;">
                  We regret to inform you that a stall from your reservation has been deleted.
                </div>
                
                <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                  <div style="font-weight: 600; color: #991b1b; margin-bottom: 8px; font-size: 16px;">Deleted Stall:</div>
                  <div style="font-size: 18px; color: #0f172a; font-weight: 700;">%s</div>
                </div>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                  <div style="font-weight: 600; color: #64748b; margin-bottom: 12px;">Reason:</div>
                  <div style="color: #0f172a; line-height: 1.6;">%s</div>
                </div>
                
                <div style="background-color: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <div style="font-weight: 600; color: #92400e; margin-bottom: 12px; font-size: 16px;">Status Update:</div>
                  <div style="color: #0f172a; line-height: 1.6;">%s</div>
                  %s
                </div>
                
                <div style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
                  Please log in to the <strong>Publisher Portal</strong> to view your updated reservations or make new bookings.
                </div>
                
                <div style="text-align: center; margin-top: 32px;">
                  <a href="#" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Visit Publisher Portal</a>
                </div>
              </div>
              <div style="text-align: center; padding: 32px 40px; background-color: #f8fafc; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0;">
                <strong>Sri Lanka Book Publishers' Association</strong><br>
                <span style="font-size: 12px; margin-top: 8px; display: block;">This is an automated message, please do not reply.</span>
              </div>
            </div>
          </div>
        </body>
        </html>
        """.formatted(
        user.getBusinessName() != null ? user.getBusinessName() : "Vendor",
        stallName,
        reason,
        statusMsg,
        additionalInfo);
  }

  private String buildStallUnreserveBody(User user, String stallName, int currentBookings,
      boolean reservationCancelled) {
    String reason = "The stall \"" + stallName + "\" has been unreserved by the administrator and is now available for other vendors.";
    String statusMsg;
    String additionalInfo;
    
    if (reservationCancelled) {
      statusMsg = "Your reservation has been <strong>cancelled</strong> because this was the only stall in your reservation.";
      additionalInfo = "<p style=\"color: #2563eb; font-weight: 600; margin-top: 16px;\">📌 You can book again at any time through the Publisher Portal.</p>";
    } else {
      statusMsg = "Your reservation is still active. Your current number of reserved stalls is now <strong>" + currentBookings + "</strong>.";
      additionalInfo = "<p style=\"color: #059669; font-weight: 600; margin-top: 16px;\">✓ Your remaining stalls are still confirmed.</p>";
    }
    
    return """
        <!DOCTYPE html>
        <html>
        <head>
        </head>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0;">
          <div style="width: 100%%; background-color: #f8fafc; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #f59e0b; color: #ffffff; padding: 40px; text-align: center;">
                <h2 style="margin: 0; font-size: 28px; font-weight: 700;">⚠️ Stall Unreserved Notice</h2>
              </div>
              <div style="padding: 40px;">
                <div style="font-size: 20px; color: #0f172a; margin-bottom: 24px; font-weight: 600;">Dear %s,</div>
                <div style="color: #475569; line-height: 1.6; margin-bottom: 24px; font-size: 16px;">
                  We would like to inform you that a stall from your reservation has been unreserved.
                </div>
                
                <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                  <div style="font-weight: 600; color: #92400e; margin-bottom: 8px; font-size: 16px;">Unreserved Stall:</div>
                  <div style="font-size: 18px; color: #0f172a; font-weight: 700;">%s</div>
                </div>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                  <div style="font-weight: 600; color: #64748b; margin-bottom: 12px;">Reason:</div>
                  <div style="color: #0f172a; line-height: 1.6;">%s</div>
                </div>
                
                <div style="background-color: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px; font-size: 16px;">Status Update:</div>
                  <div style="color: #0f172a; line-height: 1.6;">%s</div>
                  %s
                </div>
                
                <div style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
                  Please log in to the <strong>Publisher Portal</strong> to view your updated reservations or make new bookings.
                </div>
                
                <div style="text-align: center; margin-top: 32px;">
                  <a href="#" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Visit Publisher Portal</a>
                </div>
              </div>
              <div style="text-align: center; padding: 32px 40px; background-color: #f8fafc; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0;">
                <strong>Sri Lanka Book Publishers' Association</strong><br>
                <span style="font-size: 12px; margin-top: 8px; display: block;">This is an automated message, please do not reply.</span>
              </div>
            </div>
          </div>
        </body>
        </html>
        """.formatted(
        user.getBusinessName() != null ? user.getBusinessName() : "Vendor",
        stallName,
        reason,
        statusMsg,
        additionalInfo);
  }

  private String buildConfirmationBody(User user, Reservation reservation) {
    // Build stall list
    StringBuilder stallList = new StringBuilder();
    reservation.getStalls().forEach(s -> stallList.append(
        "<li style=\"padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 15px;\">")
        .append("<span style=\"font-weight: 600; color: #0f172a;\">").append(s.getName()).append("</span>")
        .append(" <span style=\"color: #64748b; font-size: 13px;\">(").append(s.getSize()).append(")</span>")
        .append("</li>"));

    return """
        <!DOCTYPE html>
        <html>
        <head>
        </head>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
          <div style="width: 100%%; background-color: #f8fafc; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <div style="background-color: #2563eb; color: #ffffff; padding: 40px 40px; text-align: center;">
                <h2 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Reservation Confirmed</h2>
              </div>
              <div style="padding: 40px;">
                <div style="font-size: 20px; color: #0f172a; margin-bottom: 24px; font-weight: 600;">Dear %s,</div>
                <div style="color: #475569; line-height: 1.6; margin-bottom: 32px; font-size: 16px;">
                  Great news! Your stall reservation for the <strong>Colombo International Book Fair</strong> has been successfully confirmed. We are thrilled to have you showcase with us.
                </div>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                  <div style="margin-bottom: 16px; font-size: 16px;">
                    <span style="font-weight: 600; color: #64748b; width: 140px; display: inline-block;">Business:</span>
                    <span style="color: #0f172a; font-weight: 500;">%s</span>
                  </div>
                  <div style="margin-top: 24px; padding-top: 24px; border-top: 1px dashed #cbd5e1;">
                    <span style="display: block; margin-bottom: 16px; font-weight: 600; color: #64748b;">Stalls Reserved:</span>
                    <ul style="list-style-type: none; padding: 0; margin: 0;">
                      %s
                    </ul>
                  </div>
                  <div style="margin-top: 24px; padding-top: 24px; border-top: 1px dashed #cbd5e1;">
                    <span style="font-weight: 600; color: #64748b; width: 140px; display: inline-block;">Reservation ID:</span>
                    <span style="font-family: monospace; color: #2563eb; font-weight: 700; font-size: 18px;">%s</span>
                  </div>
                </div>

                <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; color: #166534; font-size: 15px; line-height: 1.6; margin-bottom: 32px; border-radius: 0 8px 8px 0;">
                  <strong style="display: block; margin-bottom: 8px; font-size: 16px; color: #15803d;">🎟️ Your Entry Pass is Attached</strong>
                  Please find your unique QR code attached to this email. This QR code acts as your official pass to enter the exhibition premises. Keep it safe and present it at the venue gates.
                </div>

                <div style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 0;">
                  Thank you for participating in the Colombo International Book Fair. We're looking forward to a fantastic event!
                </div>
              </div>
              <div style="text-align: center; padding: 32px 40px; background-color: #f8fafc; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0;">
                <strong>Sri Lanka Book Publishers' Association</strong><br>
                <span style="font-size: 12px; margin-top: 8px; display: block;">This is an automated message, please do not reply.</span>
              </div>
            </div>
          </div>
        </body>
        </html>
        """
        .formatted(
            user.getBusinessName() != null ? user.getBusinessName() : "Vendor",
            user.getBusinessName() != null ? user.getBusinessName() : "N/A",
            stallList.toString(),
            reservation.getQrCodeToken());
  }

  public void sendExhibitionCancellationNotification(User user, String exhibitionName, 
      String startDate, String endDate, int cancelledStalls) {
    if (fromEmail == null || fromEmail.isBlank())
      return;

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(fromEmail);
      helper.setTo(user.getEmail());
      helper.setSubject("URGENT: Exhibition Cancelled - " + exhibitionName);
      String body = buildExhibitionCancellationBody(user, exhibitionName, startDate, endDate, cancelledStalls);
      helper.setText(body, true);
      mailSender.send(message);
      System.out.println(">>> Exhibition cancellation email sent to: " + user.getEmail());
    } catch (MessagingException | MailException e) {
      System.err.println("Failed to send exhibition cancellation email to " + user.getEmail() + ": " + e.getMessage());
    }
  }

  private String buildExhibitionCancellationBody(User user, String exhibitionName, 
      String startDate, String endDate, int cancelledStalls) {
    String stallText = cancelledStalls == 1 ? "stall" : "stalls";
    
    return """
        <!DOCTYPE html>
        <html>
        <head>
        </head>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0;">
          <div style="width: 100%%; background-color: #f8fafc; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #b91c1c; color: #ffffff; padding: 40px; text-align: center;">
                <h2 style="margin: 0; font-size: 28px; font-weight: 700;">🚫 Exhibition Cancelled</h2>
              </div>
              <div style="padding: 40px;">
                <div style="font-size: 20px; color: #0f172a; margin-bottom: 24px; font-weight: 600;">Dear %s,</div>
                
                <div style="color: #475569; line-height: 1.6; margin-bottom: 24px; font-size: 16px;">
                  We regret to inform you that the following exhibition has been <strong style="color: #dc2626;">cancelled by the organizers</strong>:
                </div>
                
                <div style="background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                  <div style="font-size: 22px; color: #0f172a; font-weight: 700; margin-bottom: 16px;">%s</div>
                  <div style="color: #64748b; margin-bottom: 8px;">
                    <span style="font-weight: 600;">Scheduled:</span> %s to %s
                  </div>
                </div>
                
                <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                  <div style="font-weight: 600; color: #92400e; margin-bottom: 12px; font-size: 16px;">⚠️ Impact on Your Reservations:</div>
                  <ul style="margin: 0; padding-left: 20px; color: #0f172a; line-height: 1.8;">
                    <li><strong>All your reservations</strong> for this exhibition have been <span style="color: #dc2626; font-weight: 600;">automatically cancelled</span></li>
                    <li>Your <strong>%d %s</strong> from this exhibition have been released</li>
                    <li>Your booking count has been updated accordingly</li>
                    <li>No further action is required from your side</li>
                  </ul>
                </div>
                
                <div style="background-color: #f0f9ff; border: 1px solid #0284c7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <div style="font-weight: 600; color: #075985; margin-bottom: 12px; font-size: 16px;">💡 What's Next?</div>
                  <div style="color: #0f172a; line-height: 1.6;">
                    We sincerely apologize for any inconvenience this may cause. You are welcome to explore and book stalls from other available exhibitions through the <strong>Publisher Portal</strong>.
                  </div>
                </div>
                
                <div style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
                  If you have any questions or concerns regarding this cancellation, please don't hesitate to contact us.
                </div>
                
                <div style="text-align: center; margin-top: 32px;">
                  <a href="#" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Browse Available Exhibitions</a>
                </div>
              </div>
              <div style="text-align: center; padding: 32px 40px; background-color: #f8fafc; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0;">
                <strong>Sri Lanka Book Publishers' Association</strong><br>
                <span style="font-size: 12px; margin-top: 8px; display: block;">This is an automated message, please do not reply.</span>
              </div>
            </div>
          </div>
        </body>
        </html>
        """.formatted(
        user.getBusinessName() != null ? user.getBusinessName() : "Vendor",
        exhibitionName,
        startDate,
        endDate,
        cancelledStalls,
        stallText);
  }

  public void sendContactUsEmail(ContactRequest request) {
    if (fromEmail == null || fromEmail.isBlank()
        || contactRecipient == null || contactRecipient.isBlank()) {
      throw new IllegalStateException("Email sender and contact recipient must be configured");
    }

    try {
      SimpleMailMessage mailMessage = new SimpleMailMessage();
      mailMessage.setFrom(fromEmail);
      mailMessage.setTo(contactRecipient);
      mailMessage.setReplyTo(request.getEmail());
      mailMessage.setSubject("New Contact Form Submission from: " + request.getName());
      mailMessage.setText(
          "You have a new message from the ReserveX Contact Page.\n\n" +
              "Name: " + request.getName() + "\n" +
              "Email: " + request.getEmail() + "\n\n" +
              "Message:\n" + request.getMessage());
      mailSender.send(mailMessage);
    } catch (MailException e) {
      throw new IllegalStateException("Unable to send contact email", e);
    }
  }

  public void sendReservationStatusChangeNotification(User user, Reservation reservation, 
      String oldStatus, String newStatus) {
    if (fromEmail == null || fromEmail.isBlank())
      return;

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(fromEmail);
      helper.setTo(user.getEmail());
      
      String subject = getStatusChangeSubject(oldStatus, newStatus);
      helper.setSubject(subject);
      
      String body = buildStatusChangeBody(user, reservation, oldStatus, newStatus);
      helper.setText(body, true);
      
      mailSender.send(message);
      System.out.println(">>> Status change email sent to: " + user.getEmail() + " (" + oldStatus + " → " + newStatus + ")");
    } catch (MessagingException | MailException e) {
      System.err.println("Failed to send status change email to " + user.getEmail() + ": " + e.getMessage());
    }
  }

  public void sendReservationDeletionNotification(User user, String exhibitionName, 
      List<String> stallNames, int remainingBookings) {
    if (fromEmail == null || fromEmail.isBlank())
      return;

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(fromEmail);
      helper.setTo(user.getEmail());
      
      helper.setSubject("Reservation Cancelled - " + exhibitionName);
      
      String body = buildReservationDeletionBody(user, exhibitionName, stallNames, remainingBookings);
      helper.setText(body, true);
      
      mailSender.send(message);
      System.out.println(">>> Reservation deletion email sent to: " + user.getEmail());
    } catch (MessagingException | MailException e) {
      System.err.println("Failed to send reservation deletion email to " + user.getEmail() + ": " + e.getMessage());
    }
  }

  private String getStatusChangeSubject(String oldStatus, String newStatus) {
    if ("APPROVED".equals(newStatus)) {
      return "Great News! Your Reservation is Approved - Colombo International Book Fair";
    } else if ("REJECTED".equals(newStatus)) {
      return "Reservation Status Update - Colombo International Book Fair";
    } else if ("PENDING".equals(newStatus)) {
      return "Reservation Status Changed to Pending - Colombo International Book Fair";
    }
    return "Reservation Status Update - Colombo International Book Fair";
  }

  private String buildStatusChangeBody(User user, Reservation reservation, 
      String oldStatus, String newStatus) {
    String businessName = user.getBusinessName() != null ? user.getBusinessName() : "Vendor";
    String exhibitionName = reservation.getExhibition() != null 
        ? reservation.getExhibition().getName() 
        : "Exhibition";
    
    // Build stall list
    StringBuilder stallList = new StringBuilder();
    reservation.getStalls().forEach(s -> stallList.append(
        "<li style=\"padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px;\">")
        .append("<span style=\"font-weight: 600; color: #0f172a;\">").append(s.getName()).append("</span>")
        .append("</li>"));

    String headerColor;
    String icon;
    String statusMessage;
    String detailMessage;

    if ("APPROVED".equals(newStatus)) {
      headerColor = "#059669";
      icon = "✓";
      statusMessage = "Your reservation has been <strong style=\"color: #059669;\">APPROVED</strong>!";
      detailMessage = "Congratulations! Your stall reservation is now confirmed. You can proceed with your exhibition preparations.";
    } else if ("REJECTED".equals(newStatus)) {
      headerColor = "#dc2626";
      icon = "✕";
      statusMessage = "Your reservation status has been changed to <strong style=\"color: #dc2626;\">REJECTED</strong>.";
      detailMessage = "Unfortunately, your reservation could not be approved at this time. Please contact the administration for more details or to discuss alternative options.";
    } else {
      headerColor = "#f59e0b";
      icon = "⚠";
      statusMessage = "Your reservation status has been changed to <strong style=\"color: #f59e0b;\">PENDING</strong>.";
      detailMessage = "Your reservation is currently under review. You will be notified once a decision is made.";
    }

    return """
        <!DOCTYPE html>
        <html>
        <head>
        </head>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0;">
          <div style="width: 100%%; background-color: #f8fafc; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background-color: %s; color: #ffffff; padding: 40px; text-align: center;">
                <h2 style="margin: 0; font-size: 28px; font-weight: 700;">%s Reservation Status Update</h2>
              </div>
              <div style="padding: 40px;">
                <div style="font-size: 20px; color: #0f172a; margin-bottom: 24px; font-weight: 600;">Dear %s,</div>
                
                <div style="background-color: #f8fafc; border-left: 4px solid %s; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                  <div style="font-size: 16px; color: #0f172a; line-height: 1.6;">%s</div>
                </div>

                <div style="color: #475569; line-height: 1.6; margin-bottom: 24px; font-size: 16px;">
                  %s
                </div>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                  <div style="margin-bottom: 16px; font-size: 16px;">
                    <span style="font-weight: 600; color: #64748b; width: 140px; display: inline-block;">Exhibition:</span>
                    <span style="color: #0f172a; font-weight: 600;">%s</span>
                  </div>
                  <div style="margin-bottom: 16px; font-size: 16px;">
                    <span style="font-weight: 600; color: #64748b; width: 140px; display: inline-block;">Reservation ID:</span>
                    <span style="font-family: monospace; color: #2563eb; font-weight: 700;">%s</span>
                  </div>
                  <div style="margin-bottom: 16px; font-size: 16px;">
                    <span style="font-weight: 600; color: #64748b; width: 140px; display: inline-block;">Previous Status:</span>
                    <span style="color: #64748b; font-weight: 500;">%s</span>
                  </div>
                  <div style="font-size: 16px;">
                    <span style="font-weight: 600; color: #64748b; width: 140px; display: inline-block;">New Status:</span>
                    <span style="color: %s; font-weight: 700; font-size: 18px;">%s</span>
                  </div>
                  
                  <div style="margin-top: 24px; padding-top: 24px; border-top: 1px dashed #cbd5e1;">
                    <span style="display: block; margin-bottom: 16px; font-weight: 600; color: #64748b;">Reserved Stalls:</span>
                    <ul style="list-style-type: none; padding: 0; margin: 0;">
                      %s
                    </ul>
                  </div>
                </div>

                <div style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
                  Please log in to the <strong>Publisher Portal</strong> to view your reservation details or contact us if you have any questions.
                </div>

                <div style="text-align: center; margin-top: 32px;">
                  <a href="#" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Visit Publisher Portal</a>
                </div>
              </div>
              <div style="text-align: center; padding: 32px 40px; background-color: #f8fafc; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0;">
                <strong>Sri Lanka Book Publishers' Association</strong><br>
                <span style="font-size: 12px; margin-top: 8px; display: block;">This is an automated message, please do not reply.</span>
              </div>
            </div>
          </div>
        </body>
        </html>
        """.formatted(
        headerColor,
        icon,
        businessName,
        headerColor,
        statusMessage,
        detailMessage,
        exhibitionName,
        reservation.getQrCodeToken(),
        oldStatus,
        headerColor,
        newStatus,
        stallList.toString());
  }

  private String buildReservationDeletionBody(User user, String exhibitionName, 
      List<String> stallNames, int remainingBookings) {
    String businessName = user.getBusinessName() != null ? user.getBusinessName() : "Vendor";
    
    // Build deleted stalls list
    StringBuilder stallList = new StringBuilder();
    stallNames.forEach(stallName -> stallList.append(
        "<li style=\"padding: 6px 0; border-bottom: 1px solid #fecaca; color: #7f1d1d; font-size: 14px;\">")
        .append("<span style=\"font-weight: 600;\">").append(stallName).append("</span>")
        .append("</li>"));

    String statusMessage;
    String additionalInfo;
    
    if (remainingBookings > 0) {
      statusMessage = "You still have <strong>" + remainingBookings + " active booking(s)</strong> with us.";
      additionalInfo = "<p style=\"color: #059669; font-weight: 600; margin-top: 16px;\">✓ Your other reservations remain active.</p>";
    } else {
      statusMessage = "You currently have <strong>no active bookings</strong>.";
      additionalInfo = "<p style=\"color: #2563eb; font-weight: 600; margin-top: 16px;\">📌 You can make new reservations anytime through the Publisher Portal.</p>";
    }

    return """
        <!DOCTYPE html>
        <html>
        <head>
        </head>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0;">
          <div style="width: 100%%; background-color: #f8fafc; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #dc2626; color: #ffffff; padding: 40px; text-align: center;">
                <h2 style="margin: 0; font-size: 28px; font-weight: 700;">🚫 Reservation Cancelled</h2>
              </div>
              <div style="padding: 40px;">
                <div style="font-size: 20px; color: #0f172a; margin-bottom: 24px; font-weight: 600;">Dear %s,</div>
                
                <div style="color: #475569; line-height: 1.6; margin-bottom: 24px; font-size: 16px;">
                  We regret to inform you that your reservation for <strong>%s</strong> has been cancelled by the administration.
                </div>

                <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                  <div style="font-weight: 600; color: #991b1b; margin-bottom: 12px; font-size: 16px;">Cancelled Stalls:</div>
                  <ul style="list-style-type: none; padding: 0; margin: 0;">
                    %s
                  </ul>
                </div>

                <div style="background-color: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <div style="font-weight: 600; color: #92400e; margin-bottom: 12px; font-size: 16px;">📊 Your Booking Status:</div>
                  <div style="color: #0f172a; line-height: 1.6; font-size: 15px;">%s</div>
                  %s
                </div>

                <div style="background-color: #f0f9ff; border: 1px solid #0284c7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <div style="font-weight: 600; color: #075985; margin-bottom: 12px; font-size: 16px;">💡 What Happens Next?</div>
                  <ul style="margin: 0; padding-left: 20px; color: #0f172a; line-height: 1.8;">
                    <li>The reserved stalls have been released and are now available for others</li>
                    <li>Your booking count has been updated</li>
                    <li>No further action is required from your side</li>
                    <li>You can browse and book other stalls anytime</li>
                  </ul>
                </div>

                <div style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
                  We sincerely apologize for any inconvenience this may cause. If you have any questions or concerns, please don't hesitate to contact us.
                </div>

                <div style="text-align: center; margin-top: 32px;">
                  <a href="#" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Browse Available Stalls</a>
                </div>
              </div>
              <div style="text-align: center; padding: 32px 40px; background-color: #f8fafc; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0;">
                <strong>Sri Lanka Book Publishers' Association</strong><br>
                <span style="font-size: 12px; margin-top: 8px; display: block;">This is an automated message, please do not reply.</span>
              </div>
            </div>
          </div>
        </body>
        </html>
        """.formatted(
        businessName,
        exhibitionName,
        stallList.toString(),
        statusMessage,
        additionalInfo);
  }
}
