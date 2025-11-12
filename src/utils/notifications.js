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

    // Skip actual send if config missing (dev fallback)
    if (!import.meta.env.VITE_EMAILJS_SERVICE_ID || !import.meta.env.VITE_EMAILJS_TEMPLATE_ID || !import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
      console.log('EmailJS config not found, skipping real send (dev fallback).', templateParams);
      return { success: true, message: 'Email mocked (dev)' };
    }

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    return { success: true, message: 'Email notification sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new AppError(ErrorTypes.NOTIFICATION, 'Failed to send email notification', error);
  }
};

export const sendWhatsAppNotification = async (incident) => {
  try {
    if (!incident || !incident.id) {
      throw new AppError(ErrorTypes.VALIDATION, 'Invalid incident data');
    }

    const message = `New Incident Reported\nID: ${incident.id}\nTitle: ${incident.title}\nLocation: ${incident.location}\nSeverity: ${incident.severity}\nDescription: ${incident.description}\nTime: ${new Date().toLocaleString()}`;

    const endpoint = import.meta.env.VITE_WHATSAPP_API_ENDPOINT;
    const token = import.meta.env.VITE_WHATSAPP_API_TOKEN;
    const phone = import.meta.env.VITE_ADMIN_PHONE_NUMBER;

    if (!endpoint || !token || !phone) {
      console.log('WhatsApp API config missing - skipping real call (dev fallback).', { message, phone });
      return { success: true, message: 'WhatsApp mocked (dev)' };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ phone, message })
    });

    if (!res.ok) throw new Error('WhatsApp notification failed');

    return { success: true, message: 'WhatsApp notification sent successfully' };
  } catch (error) {
    console.error('WhatsApp error:', error);
    throw new AppError(ErrorTypes.NOTIFICATION, 'Failed to send WhatsApp notification', error);
  }
};

export const sendNotifications = async (incident, settings) => {
  const results = { email: null, whatsapp: null, success: false, message: 'No notifications sent' };

  if (!settings || !settings.notifications) {
    console.warn('Notification settings not provided');
    return results;
  }

  const { emailAlerts, pushNotifications, highPriorityOnly } = settings.notifications;

  if (!emailAlerts && !pushNotifications) {
    results.message = 'Notifications disabled in settings';
    return results;
  }

  const highPriorityIncidents = ['high', 'critical'];
  if (highPriorityOnly && !highPriorityIncidents.includes((incident.severity || '').toLowerCase())) {
    results.message = 'Skipped due to highPriorityOnly';
    return results;
  }

  try {
    if (emailAlerts) {
      try {
        results.email = await sendEmailNotification(incident);
      } catch (e) {
        results.email = { success: false, error: e.message };
      }
    }

    if (pushNotifications) {
      try {
        results.whatsapp = await sendWhatsAppNotification(incident);
      } catch (e) {
        results.whatsapp = { success: false, error: e.message };
      }
    }

    results.success = !!(results.email?.success || results.whatsapp?.success);
    results.message = results.success ? 'Notifications sent' : 'No notifications were successful';
    return results;
  } catch (error) {
    console.error('sendNotifications error', error);
    throw new AppError(ErrorTypes.NOTIFICATION, 'sendNotifications failed', error);
  }
};
