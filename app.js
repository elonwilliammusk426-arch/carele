// Tesla Platform Frontend Script - Real Backend Connectivity

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

  // Request form real submission
  var requestForm = document.getElementById('request-form');
  if (requestForm) {
    requestForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var selects = requestForm.querySelectorAll('select');
      var inputs = requestForm.querySelectorAll('input[type="text"]');
      var textarea = requestForm.querySelector('textarea');
      
      var serviceType = selects.length > 0 ? selects[0].value : 'Personal Sourcing';
      var model = inputs.length > 0 ? inputs[inputs.length - 1].value : 'Tesla Model Y';
      var name = inputs.length > 1 ? inputs[0].value : 'Client';
      var email = inputs.length > 2 ? inputs[1].value : 'client@tesla.com';
      var notes = textarea ? textarea.value : '';

      fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_type: serviceType, model: model, name: name, email: email, notes: notes })
      })
      .then(res => res.json())
      .then(data => {
        var panel = document.getElementById('confirm-panel');
        var idField = document.getElementById('confirm-id');
        if (idField) {
          idField.textContent = data.id;
        }
        requestForm.style.display = 'none';
        if (panel) panel.classList.add('show');
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
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

  // Track order real lookup
  var trackForm = document.getElementById('track-form');
  if (trackForm) {
    trackForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('track-input');
      var result = document.getElementById('track-result');
      var idOut = document.getElementById('track-id-out');
      if (!input || !input.value.trim()) return;
      var briefId = input.value.trim().toUpperCase();

      fetch('/api/briefs/lookup?id=' + encodeURIComponent(briefId))
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert('Reference ID not found in Tesla database.');
          return;
        }
        if (idOut) idOut.textContent = data.id;
        if (result) {
          result.classList.add('show');
          result.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
});
