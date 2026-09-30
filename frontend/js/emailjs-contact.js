/**
 * NX Studio - EmailJS Contact Form Handler
 * Handles contact form validation, submission, and auto-reply via EmailJS.
 * No backend required — all email delivery handled client-side through EmailJS.
 */
(function () {
  'use strict';

  var lastSubmitTime = 0;
  var isSubmitting = false;

  document.addEventListener('DOMContentLoaded', function () {
    initContactForm();
  });

  function initContactForm() {
    var form = document.getElementById('nx-contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (isSubmitting) return;

      var nameEl = document.getElementById('cf-name');
      var emailEl = document.getElementById('cf-email');
      var subjectEl = document.getElementById('cf-subject');
      var messageEl = document.getElementById('cf-message');
      var honeypot = form.querySelector('input[name="honeypot"]');
      var submitBtn = document.getElementById('cf-submit-btn');

      // Honeypot spam check
      if (honeypot && honeypot.value) return;

      // Throttle check
      var now = Date.now();
      if (now - lastSubmitTime < NX_EMAILJS.THROTTLE_MS) {
        showFormError('Please wait a few seconds before sending another message.');
        return;
      }

      // Validation
      var name = nameEl.value.trim();
      var email = emailEl.value.trim();
      var subject = subjectEl.value.trim();
      var message = messageEl.value.trim();

      clearFormErrors();

      if (!name) {
        showFieldError(nameEl, 'Please enter your name.');
        return;
      }
      if (name.length > 100) {
        showFieldError(nameEl, 'Name is too long (max 100 characters).');
        return;
      }
      if (!email) {
        showFieldError(emailEl, 'Please enter your email address.');
        return;
      }
      if (!isValidEmail(email)) {
        showFieldError(emailEl, 'Please enter a valid email address.');
        return;
      }
      if (!subject) {
        showFieldError(subjectEl, 'Please enter a subject.');
        return;
      }
      if (subject.length > 200) {
        showFieldError(subjectEl, 'Subject is too long (max 200 characters).');
        return;
      }
      if (!message) {
        showFieldError(messageEl, 'Please enter your message.');
        return;
      }
      if (message.length > NX_EMAILJS.MAX_MESSAGE_LENGTH) {
        showFieldError(messageEl, 'Message is too long (max ' + NX_EMAILJS.MAX_MESSAGE_LENGTH + ' characters).');
        return;
      }

      // Set submitting state
      isSubmitting = true;
      lastSubmitTime = now;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="cf-btn-spinner"></span> Sending...';

      var nowDate = new Date();
      var dateStr = nowDate.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }) + ' at ' + nowDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      var templateParams = {
        from_name: name,
        from_email: email,
        subject: subject,
        message: message,
        to_name: 'NX Studio',
        reply_to: email,
        date: dateStr,
        admin_email: NX_EMAILJS.ADMIN_EMAIL
      };

      // 1. Send admin notification email
      emailjs.send(NX_EMAILJS.SERVICE_ID, NX_EMAILJS.CONTACT_TEMPLATE_ID, templateParams)
        .then(function () {
          // 2. Send auto-reply to visitor
          return emailjs.send(NX_EMAILJS.SERVICE_ID, NX_EMAILJS.AUTOREPLY_TEMPLATE_ID, templateParams);
        })
        .then(function () {
          onSendSuccess(form);
        })
        .catch(function (err) {
          onSendError(err);
        })
        .finally(function () {
          isSubmitting = false;
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Send Message';
        });
    });
  }

  function onSendSuccess(form) {
    form.reset();
    clearFormErrors();

    var successBox = document.getElementById('cf-success-message');
    if (successBox) {
      successBox.style.display = 'block';
      successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (typeof window.showToast === 'function') {
      window.showToast('Message sent successfully. A confirmation email has been sent to your address.');
    }

    setTimeout(function () {
      if (successBox) successBox.style.display = 'none';
    }, 10000);
  }

  function onSendError(err) {
    if (typeof console !== 'undefined') {
      console.error('[NX Studio] EmailJS error:', err);
    }

    var msg = 'Unable to send your message. ';
    if (err && err.status) {
      if (err.status === 400) {
        msg += 'There is a configuration issue. Please contact us directly at nx.studio.net@outlook.com.';
      } else if (err.status === 402) {
        msg += 'Email service limit reached. Please try again later.';
      } else if (err.status === 429) {
        msg += 'Too many requests. Please wait a moment and try again.';
      } else {
        msg += 'Please check your connection and try again, or email us directly at nx.studio.net@outlook.com.';
      }
    } else {
      msg += 'Please check your connection and try again, or email us directly at nx.studio.net@outlook.com.';
    }

    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFieldError(input, message) {
    input.style.borderColor = 'var(--color-red)';
    var errorEl = input.parentElement.querySelector('.form-error-msg');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
    input.focus();
  }

  function showFormError(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
    }
  }

  function clearFormErrors() {
    var form = document.getElementById('nx-contact-form');
    if (!form) return;
    form.querySelectorAll('.form-error-msg').forEach(function (el) {
      el.textContent = '';
      el.style.display = 'none';
    });
    form.querySelectorAll('.form-control').forEach(function (el) {
      el.style.borderColor = '';
    });
  }

})();
