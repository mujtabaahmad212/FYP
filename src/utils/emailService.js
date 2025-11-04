import emailjs from '@emailjs/browser';

const initEmailJS = () => {
  emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
};

export const sendEmailNotification = async (incident) => {
  try {
    const templateParams = {
      to_email: import.meta.env.VITE_ADMIN_EMAIL,
      incident_id: incident.id,
      incident_title: incident.title,
      incident_location: incident.location,
      incident_severity: incident.severity,
      incident_description: incident.description,
      report_time: new Date().toLocaleString()
    };

    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams
    );

    if (response.status === 200) {
      console.log('Email notification sent successfully');
      return true;
    } else {
      throw new Error('Failed to send email notification');
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

// Initialize EmailJS
initEmailJS();