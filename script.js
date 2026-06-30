// ===== Year (if footer present) =====
var yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Scroll reveal =====
var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

// ===== Animated stat counters =====
function formatNum(n) { return n.toLocaleString('en-IN'); }

function animateCounter(el) {
  var target = parseInt(el.getAttribute('data-count'), 10);
  var prefix = el.getAttribute('data-prefix') || '';
  var suffix = el.getAttribute('data-suffix') || '';
  var duration = 1400;
  var start = null;

  function step(ts) {
    if (!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    var value = Math.round(eased * target);
    el.textContent = prefix + formatNum(value) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

var statObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(function (el) { statObserver.observe(el); });

// ===== FAQ accordion =====
document.querySelectorAll('.faq-q').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var item = btn.parentElement;
    var answer = item.querySelector('.faq-a');
    var isOpen = item.classList.contains('open');

    // close all
    document.querySelectorAll('.faq-item').forEach(function (i) {
      i.classList.remove('open');
      i.querySelector('.faq-a').style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// ===== Mobile: digits only =====
var mobileInput = document.getElementById('mobile');
mobileInput.addEventListener('input', function () {
  mobileInput.value = mobileInput.value.replace(/\D/g, '').slice(0, 10);
});

// ===== Form validation + submit =====
var form = document.getElementById('loan-form');
var successBox = document.getElementById('form-success');

function setError(name, message) {
  var span = document.querySelector('.error[data-for="' + name + '"]');
  if (span) {
    span.textContent = message || '';
    var field = span.closest('.field');
    if (field) field.classList.toggle('invalid', !!message);
  }
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  var ok = true;

  var employment = form.querySelector('input[name="employment"]:checked');
  if (!employment) { setError('employment', 'Please select Salaried or Self Employed.'); ok = false; }
  else setError('employment', '');

  var name = form.name.value.trim();
  if (!name) { setError('name', 'Name is required.'); ok = false; }
  else if (!/^[A-Za-z\s]+$/.test(name)) { setError('name', 'Name should contain only letters and spaces.'); ok = false; }
  else setError('name', '');

  var mobile = form.mobile.value;
  if (!mobile) { setError('mobile', 'Mobile number is required.'); ok = false; }
  else if (!/^[6-9]\d{9}$/.test(mobile)) { setError('mobile', 'Enter a valid 10-digit mobile number.'); ok = false; }
  else setError('mobile', '');

  var salary = form.salary.value;
  if (salary === '') { setError('salary', 'Salary is required.'); ok = false; }
  else if (Number(salary) < 0) { setError('salary', 'Salary cannot be negative.'); ok = false; }
  else setError('salary', '');

  if (!ok) return;

  var data = {
    employment: employment.value,
    name: name,
    mobile: mobile,
    salary: salary,
    submittedAt: new Date().toISOString()
  };
  try {
    var leads = JSON.parse(localStorage.getItem('salarytopup_leads') || '[]');
    leads.push(data);
    localStorage.setItem('salarytopup_leads', JSON.stringify(leads));
  } catch (err) { /* ignore storage errors */ }

  console.log('SalaryTopup lead captured:', data);

  form.hidden = true;
  successBox.hidden = false;
  successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
