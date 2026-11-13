/* Contact form.
   There is no server, so the form hands the message to something that already
   exists. By default it opens a prefilled GitHub issue (public, and the email
   address is never included). Put an address in CONTACT_EMAIL to send by email
   instead. */
(function () {
  'use strict';

  var CONTACT_EMAIL = '';
  var ISSUES_URL = 'https://github.com/KanwarAfaq/games/issues/new';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var nameInput = document.getElementById('c-name');
  var emailInput = document.getElementById('c-email');
  var topicInput = document.getElementById('c-topic');
  var messageInput = document.getElementById('c-message');
  var emailField = document.getElementById('field-email');
  var notice = document.getElementById('contact-notice');
  var status = document.getElementById('contact-status');
  var useEmail = CONTACT_EMAIL !== '';

  if (useEmail) {
    emailField.hidden = false;
    notice.hidden = true;
  } else {
    emailField.hidden = true;
    notice.hidden = false;
  }

  function setError(input, message) {
    var out = document.getElementById(input.id + '-error');
    out.textContent = message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    return !message;
  }

  function validate() {
    var ok = true;
    var firstBad = null;

    function check(input, message) {
      var good = setError(input, message);
      if (!good && !firstBad) firstBad = input;
      ok = ok && good;
    }

    check(nameInput, nameInput.value.trim() ? '' : 'Enter your name.');
    if (useEmail) {
      var email = emailInput.value.trim();
      check(emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Enter a valid email address.');
    }
    check(messageInput, messageInput.value.trim().length >= 10 ? '' : 'Write at least 10 characters.');

    if (firstBad) firstBad.focus();
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    if (!validate()) return;

    var name = nameInput.value.trim();
    var topic = topicInput.value;
    var message = messageInput.value.trim();
    var subject = '[' + topic + '] from ' + name;

    if (useEmail) {
      var body = message + '\n\n' + name + '\n' + emailInput.value.trim();
      window.location.href = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      status.textContent = 'Opening your email app. Press send there to finish.';
    } else {
      var issueBody = message + '\n\nSent by ' + name + ' from the Kanwar Arcade contact page.';
      var url = ISSUES_URL + '?title=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(issueBody);
      var win = window.open(url, '_blank', 'noopener');
      status.textContent = win
        ? 'GitHub opened in a new tab. Press "Submit new issue" there to send your message.'
        : 'Your browser blocked the new tab. Allow pop-ups for this site and send again.';
    }
  });

  [nameInput, emailInput, messageInput].forEach(function (input) {
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') setError(input, '');
    });
  });
})();
