/**
 * NX Studio - EmailJS Configuration
 * Central configuration for all EmailJS integrations.
 * Replace placeholder values with your actual EmailJS credentials.
 */
var NX_EMAILJS = {
  PUBLIC_KEY: 'e5SFwPGwY7W-peiwj',
  SERVICE_ID: 'service_pm9vzml',

  // Contact Form Templates
  CONTACT_TEMPLATE_ID: 'template_osp7m6i',    // Admin notification (Form Details)
  AUTOREPLY_TEMPLATE_ID: 'template_tsn9kqj',  // Visitor auto-reply

  // Admin email (used in template "to" field)
  ADMIN_EMAIL: 'nx.studio.net@outlook.com',

  // Submission throttle: minimum ms between sends
  THROTTLE_MS: 5000,

  // Maximum message length
  MAX_MESSAGE_LENGTH: 5000
};
