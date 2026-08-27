// Tesla Tesla Ecosystem Interactive Script
document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (o) { o.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Request / Sourcing brief mock submission
  var requestForm = document.getElementById('request-form');
  if (requestForm) {
    requestForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var panel = document.getElementById('confirm-panel');
      var idField = document.getElementById('confirm-id');
      if (idField) {
        idField.textContent = 'TSLA-REQ-' + Math.floor(100000 + Math.random() * 900000);
      }
      requestForm.style.display = 'none';
      if (panel) panel.classList.add('show');
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // Contact form mock submission
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var panel = document.getElementById('contact-confirm');
      contactForm.style.display = 'none';
      if (panel) panel.classList.add('show');
    });
  }

  // Track order mock lookup
  var trackForm = document.getElementById('track-form');
  if (trackForm) {
    trackForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('track-input');
      var result = document.getElementById('track-result');
      var idOut = document.getElementById('track-id-out');
      if (!input || !input.value.trim()) return;
      if (idOut) idOut.textContent = input.value.trim().toUpperCase();
      if (result) {
        result.classList.add('show');
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
});
