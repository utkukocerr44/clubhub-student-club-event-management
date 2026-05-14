const api = {
  clubs: '/api/clubs',
  events: '/api/events',
  students: '/api/students',
  registrations: '/api/registrations',
  dashboard: '/api/dashboard'
};

const state = {
  clubs: [],
  events: [],
  students: [],
  registrations: []
};

document.addEventListener('DOMContentLoaded', () => {
  bindTabs();
  bindForms();
  bindResetButtons();
  loadAll();
});

async function loadAll() {
  const [dashboard, clubs, events, students, registrations] = await Promise.all([
    request(api.dashboard),
    request(api.clubs),
    request(api.events),
    request(api.students),
    request(api.registrations)
  ]);

  Object.assign(state, { clubs, events, students, registrations });
  renderMetrics(dashboard.totals);
  renderClubOptions();
  renderEventOptions();
  renderStudentOptions();
  renderClubs();
  renderEvents();
  renderStudents();
  renderRegistrations();
}

function bindTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
      document.querySelectorAll('.panel').forEach((panel) => panel.classList.add('hidden'));
      tab.classList.add('active');
      document.querySelector(`#${tab.dataset.view}-view`).classList.remove('hidden');
    });
  });
}

function bindForms() {
  document.querySelector('#club-form').addEventListener('submit', submitClub);
  document.querySelector('#event-form').addEventListener('submit', submitEvent);
  document.querySelector('#student-form').addEventListener('submit', submitStudent);
  document.querySelector('#registration-form').addEventListener('submit', submitRegistration);
}

function bindResetButtons() {
  document.querySelectorAll('[data-reset]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector(`#${button.dataset.reset}`).reset();
      document.querySelector(`#${button.dataset.reset} [name="id"]`)?.setAttribute('value', '');
    });
  });
}

async function submitClub(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = formData(form);
  const id = payload.id;
  delete payload.id;

  await request(id ? `${api.clubs}/${id}` : api.clubs, {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(payload)
  });
  form.reset();
  toast('Club saved.');
  loadAll();
}

async function submitEvent(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = formData(form);
  const id = payload.id;
  delete payload.id;
  payload.capacity = Number(payload.capacity);
  payload.event_date = new Date(payload.event_date).toISOString().slice(0, 19);

  await request(id ? `${api.events}/${id}` : api.events, {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(payload)
  });
  form.reset();
  toast('Event saved.');
  loadAll();
}

async function submitStudent(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = formData(form);
  const id = payload.id;
  delete payload.id;

  await request(id ? `${api.students}/${id}` : api.students, {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(payload)
  });
  form.reset();
  toast('Student saved.');
  loadAll();
}

async function submitRegistration(event) {
  event.preventDefault();
  const payload = formData(event.currentTarget);
  await request(api.registrations, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  event.currentTarget.reset();
  toast('Student registered.');
  loadAll();
}

function renderMetrics(totals) {
  document.querySelector('#metrics').innerHTML = Object.entries(totals)
    .map(([label, value]) => `<article class="metric"><span>${title(label)}</span><strong>${value}</strong></article>`)
    .join('');
}

function renderClubs() {
  document.querySelector('#clubs-table').innerHTML = state.clubs.map((club) => `
    <tr>
      <td>${escapeHtml(club.name)}</td>
      <td>${escapeHtml(club.category)}</td>
      <td>${escapeHtml(club.president_name)}</td>
      <td>${escapeHtml(club.status)}</td>
      <td>
        <button type="button" onclick="editClub(${club.id})">Edit</button>
        <button type="button" class="danger" onclick="removeRecord('${api.clubs}', ${club.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderEvents() {
  document.querySelector('#events-table').innerHTML = state.events.map((event) => `
    <tr>
      <td>${escapeHtml(event.title)}</td>
      <td>${escapeHtml(event.club_name)}</td>
      <td>${formatDate(event.event_date)}</td>
      <td>${event.registered_count}/${event.capacity}</td>
      <td>${escapeHtml(event.status)}</td>
      <td>
        <button type="button" onclick="editEvent(${event.id})">Edit</button>
        <button type="button" class="danger" onclick="removeRecord('${api.events}', ${event.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderStudents() {
  document.querySelector('#students-table').innerHTML = state.students.map((student) => `
    <tr>
      <td>${escapeHtml(student.full_name)}</td>
      <td>${escapeHtml(student.student_number)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td>${escapeHtml(student.department)}</td>
      <td>
        <button type="button" onclick="editStudent(${student.id})">Edit</button>
        <button type="button" class="danger" onclick="removeRecord('${api.students}', ${student.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderRegistrations() {
  document.querySelector('#registrations-table').innerHTML = state.registrations.map((registration) => `
    <tr>
      <td>${escapeHtml(registration.event_title)}</td>
      <td>${escapeHtml(registration.student_name)}</td>
      <td>${escapeHtml(registration.status)}</td>
      <td>${formatDate(registration.registered_at)}</td>
      <td>
        <button type="button" onclick="markAttended(${registration.id})">Attended</button>
        <button type="button" class="danger" onclick="removeRecord('${api.registrations}', ${registration.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderClubOptions() {
  document.querySelector('[name="club_id"]').innerHTML = state.clubs
    .map((club) => `<option value="${club.id}">${escapeHtml(club.name)}</option>`)
    .join('');
}

function renderEventOptions() {
  document.querySelector('[name="event_id"]').innerHTML = state.events
    .filter((event) => event.status === 'scheduled')
    .map((event) => `<option value="${event.id}">${escapeHtml(event.title)}</option>`)
    .join('');
}

function renderStudentOptions() {
  document.querySelector('[name="student_id"]').innerHTML = state.students
    .map((student) => `<option value="${student.id}">${escapeHtml(student.full_name)}</option>`)
    .join('');
}

window.editClub = (id) => fillForm('club-form', state.clubs.find((club) => club.id === id));
window.editStudent = (id) => fillForm('student-form', state.students.find((student) => student.id === id));
window.editEvent = (id) => {
  const event = state.events.find((item) => item.id === id);
  fillForm('event-form', {
    ...event,
    event_date: event.event_date.slice(0, 16)
  });
};

window.markAttended = async (id) => {
  await request(`${api.registrations}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'attended' })
  });
  toast('Registration updated.');
  loadAll();
};

window.removeRecord = async (endpoint, id) => {
  await request(`${endpoint}/${id}`, { method: 'DELETE' });
  toast('Record deleted.');
  loadAll();
};

function fillForm(formId, values) {
  const form = document.querySelector(`#${formId}`);
  Object.entries(values).forEach(([key, value]) => {
    const input = form.elements[key];
    if (input) input.value = value;
  });
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    toast(payload.error || 'Request failed.');
    throw new Error(payload.error || 'Request failed.');
  }

  if (response.status === 204) return null;
  return response.json();
}

function toast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.classList.add('show');
  setTimeout(() => element.classList.remove('show'), 2400);
}

function title(value) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
