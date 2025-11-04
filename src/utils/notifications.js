import emailjs from '@emailjs/browser';

import { ErrorTypes, AppError } from './errorHandler';

export const sendEmailNotification = async (incident) => {
  try {
    if (!incident || !incident.id) {
      throw new AppError(ErrorTypes.VALIDATION, 'Invalid incident data');
    }
    
    const templateParams = {
      to_email: import.meta.env.VITE_ADMIN_EMAIL,
      incident_id: incident.id,
      incident_title: incident.title,
      incident_location: incident.location,
      incident_severity: incident.severity,
      incident_description: incident.description,
      report_time: new Date().toLocaleString()
    };

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    console.log('Email notification sent successfully');
    return {
      success: true,
      message: 'Email notification sent successfully'
    };
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw new AppError(
      ErrorTypes.NOTIFICATION,
      'Failed to send email notification',
      error
    );
  }
};

export const sendWhatsAppNotification = async (incident) => {
  try {
    if (!incident || !incident.id) {
      throw new AppError(ErrorTypes.VALIDATION, 'Invalid incident data');
    }
    
    // Using WhatsApp Business API
    const message = `New Incident Reported\n
ID: ${incident.id}\n
Title: ${incident.title}\n
Location: ${incident.location}\n
Severity: ${incident.severity}\n
Description: ${incident.description}\n
Time: ${new Date().toLocaleString()}`;

    // Replace with your WhatsApp API integration
    const response = await fetch(import.meta.env.VITE_WHATSAPP_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_WHATSAPP_API_TOKEN}`
      },
      body: JSON.stringify({
        phone: import.meta.env.VITE_ADMIN_PHONE_NUMBER,
        message: message
      })
    });

    if (!response.ok) {
      throw new Error('WhatsApp notification failed');
    }

    console.log('WhatsApp notification sent successfully');
    return {
      success: true,
      message: 'WhatsApp notification sent successfully'
    };
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    throw new AppError(
      ErrorTypes.NOTIFICATION,
      'Failed to send WhatsApp notification',
      error
    );
  }
};

// Combined notification sender
export const sendNotifications = async (incident, settings) => {
  const results = {
    email: null,
    whatsapp: null,
    success: false,
    message: 'No notifications sent based on current settings.'
  };

  if (!settings || !settings.notifications) {
    console.warn('Notification settings not provided. Skipping notifications.');
    return results;
  }

  const { emailAlerts, pushNotifications, highPriorityOnly } = settings.notifications;

  // Check if notifications should be sent at all
  if (!emailAlerts && !pushNotifications) {
    return results;
  }

  // Check for high priority setting
  const highPriorityIncidents = ['high', 'critical'];
  if (highPriorityOnly && !highPriorityIncidents.includes(incident.severity?.toLowerCase())) {
    results.message = 'Notification skipped: Incident is not high priority.';
    return results;
  }

  try {
    // Send email notification
    if (emailAlerts) {
      try {
        results.email = await sendEmailNotification(incident);
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        results.email = { success: false, error: emailError.message };
      }
    }

    // Send WhatsApp notification (assuming this is the "push notification")
    if (pushNotifications) {
      try {
        results.whatsapp = await sendWhatsAppNotification(incident);
      } catch (whatsappError) {
        console.error('WhatsApp notification failed:', whatsappError);
        results.whatsapp = { success: false, error: whatsappError.message };
      }
    }

    // Consider it successful if at least one notification was sent
    results.success = results.email?.success || results.whatsapp?.success;
    if (results.success) {
        results.message = 'Notifications sent successfully.';
    }

    return results;
  } catch (error) {
    console.error('Error in sendNotifications:', error);
    throw new AppError(
      ErrorTypes.NOTIFICATION,
      'Failed to send notifications',
      error
    );
  }
};