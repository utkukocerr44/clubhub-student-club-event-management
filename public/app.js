const api = {
  auth: '/api/auth',
  clubs: '/api/clubs',
  clubDiscovery: '/api/clubs/discover',
  events: '/api/events',
  students: '/api/students',
  memberships: '/api/memberships',
  registrations: '/api/registrations',
  dashboard: '/api/dashboard',
  users: '/api/users'
};

const state = {
  token: localStorage.getItem('clubhub_token'),
  user: null,
  clubs: [],
  availableClubs: [],
  events: [],
  students: [],
  memberships: [],
  registrations: [],
  users: []
};

document.addEventListener('DOMContentLoaded', async () => {
  bindTabs();
  bindForms();
  bindResetButtons();
  document.querySelector('#logout-button').addEventListener('click', logout);
  showFileProtocolWarning();

  if (state.token) {
    try {
      state.user = await request(`${api.auth}/me`);
      showApp();
      await loadAll();
      return;
    } catch {
      logout(false);
    }
  }

  showAuth();
});

async function login(event) {
  event.preventDefault();
  setFormError('login-error', '');
  const payload = formData(event.currentTarget);
  try {
    const response = await request(`${api.auth}/login`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, false);
    authenticate(response);
  } catch (error) {
    setFormError('login-error', friendlyError(error));
  }
}

async function register(event) {
  event.preventDefault();
  setFormError('register-error', '');
  const payload = formData(event.currentTarget);
  try {
    const response = await request(`${api.auth}/register`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, false);
    authenticate(response);
  } catch (error) {
    setFormError('register-error', friendlyError(error));
  }
}

function authenticate(response) {
  state.token = response.token;
  state.user = response.user;
  localStorage.setItem('clubhub_token', state.token);
  showApp();
  loadAll();
}

function logout(showMessage = true) {
  state.token = null;
  state.user = null;
  localStorage.removeItem('clubhub_token');
  showAuth();
  if (showMessage) toast('Logged out.');
}

async function loadAll() {
  const requests = [
    request(api.dashboard),
    request(api.clubs),
    request(api.clubDiscovery),
    request(api.events),
    request(api.memberships),
    request(api.registrations)
  ];

  if (state.user.role === 'admin') {
    requests.push(request(api.students), request(api.users));
  }

  const [dashboard, clubs, availableClubs, events, memberships, registrations, students = [], users = []] = await Promise.all(requests);
  Object.assign(state, { clubs, availableClubs, events, students, memberships, registrations, users });

  renderRoleAwareLayout();
  renderMetrics(dashboard.totals);
  renderClubOptions();
  renderEventOptions();
  renderStudentOptions();
  renderClubs();
  renderEvents();
  renderStudents();
  renderMemberships();
  renderRegistrations();
  renderUsers();
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
  document.querySelector('#login-form').addEventListener('submit', login);
  document.querySelector('#register-form').addEventListener('submit', register);
  document.querySelector('#club-form').addEventListener('submit', submitClub);
  document.querySelector('#event-form').addEventListener('submit', submitEvent);
  document.querySelector('#student-form').addEventListener('submit', submitStudent);
  document.querySelector('#membership-form').addEventListener('submit', submitMembership);
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

function showAuth() {
  document.querySelector('#auth-screen').classList.remove('hidden');
  document.querySelector('#app-screen').classList.add('hidden');
  document.querySelector('#logout-button').classList.add('hidden');
  document.querySelector('#user-badge').classList.add('hidden');
}

function showApp() {
  document.querySelector('#auth-screen').classList.add('hidden');
  document.querySelector('#app-screen').classList.remove('hidden');
  document.querySelector('#logout-button').classList.remove('hidden');
  const badge = document.querySelector('#user-badge');
  badge.textContent = `${state.user.full_name} (${formatRole(state.user.role)})`;
  badge.classList.remove('hidden');
}

function renderRoleAwareLayout() {
  toggleByRole('.admin-only', state.user.role === 'admin');
  toggleByRole('.admin-manager-only', ['admin', 'club_manager'].includes(state.user.role));
  toggleByRole('.student-admin-only', ['admin', 'student'].includes(state.user.role));
  document.querySelector('#clubs-heading').textContent = state.user.role === 'student' ? 'My Clubs' : 'Clubs';
  document.querySelector('#clubs-copy').textContent = state.user.role === 'student'
    ? 'Only approved clubs connected to your account.'
    : 'Clubs visible for your current role.';
  document.querySelector('#events-heading').textContent = state.user.role === 'student' ? 'My Club Events' : 'Events';
  document.querySelector('#events-copy').textContent = state.user.role === 'student'
    ? 'Events from your approved clubs.'
    : 'Events visible for your current role.';
}

function toggleByRole(selector, visible) {
  document.querySelectorAll(selector).forEach((element) => element.classList.toggle('hidden', !visible));
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

async function submitMembership(event) {
  event.preventDefault();
  const payload = formData(event.currentTarget);
  await request(api.memberships, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  event.currentTarget.reset();
  toast(state.user.role === 'student' ? 'Membership request sent.' : 'Membership saved.');
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
  toast('Registration saved.');
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
      <td>${state.user.role === 'admin' ? `
        <button type="button" onclick="editClub(${club.id})">Edit</button>
        <button type="button" class="danger" onclick="removeRecord('${api.clubs}', ${club.id})">Delete</button>
      ` : ''}</td>
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
      <td>${event.registered_count >= event.capacity ? 'full' : escapeHtml(event.status)}</td>
      <td>${['admin', 'club_manager'].includes(state.user.role) ? `
        <button type="button" onclick="editEvent(${event.id})">Edit</button>
        <button type="button" class="danger" onclick="removeRecord('${api.events}', ${event.id})">Delete</button>
      ` : ''}</td>
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

function renderMemberships() {
  document.querySelector('#memberships-table').innerHTML = state.memberships.map((membership) => `
    <tr>
      <td>${escapeHtml(membership.club_name)}</td>
      <td>${escapeHtml(membership.student_name)}</td>
      <td>${escapeHtml(membership.role)}</td>
      <td>${escapeHtml(membership.status)}</td>
      <td>${['admin', 'club_manager'].includes(state.user.role) ? `
        <button type="button" onclick="updateMembership(${membership.id}, 'approved')">Approve</button>
        <button type="button" class="secondary" onclick="updateMembership(${membership.id}, 'rejected')">Reject</button>
      ` : ''}</td>
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
      <td>${['admin', 'club_manager'].includes(state.user.role) ? `
        <button type="button" onclick="markAttended(${registration.id})">Attended</button>
        <button type="button" class="danger" onclick="removeRecord('${api.registrations}', ${registration.id})">Delete</button>
      ` : ''}</td>
    </tr>
  `).join('');
}

function renderUsers() {
  document.querySelector('#users-table').innerHTML = state.users.map((user) => `
    <tr>
      <td>${escapeHtml(user.full_name)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(formatRole(user.role))}</td>
      <td>${user.managed_club_id || '-'}</td>
    </tr>
  `).join('');
}

function renderClubOptions() {
  document.querySelector('#event-form [name="club_id"]').innerHTML = state.clubs
    .map((club) => `<option value="${club.id}">${escapeHtml(club.name)}</option>`)
    .join('');

  document.querySelector('#membership-form [name="club_id"]').innerHTML = state.availableClubs
    .map((club) => `<option value="${club.id}">${escapeHtml(club.name)}</option>`)
    .join('');
}

function renderEventOptions() {
  document.querySelector('[name="event_id"]').innerHTML = state.events
    .filter((event) => event.status === 'scheduled' && event.registered_count < event.capacity)
    .map((event) => `<option value="${event.id}">${escapeHtml(event.title)}</option>`)
    .join('');
}

function renderStudentOptions() {
  document.querySelectorAll('[name="student_id"]').forEach((select) => {
    select.innerHTML = state.students
      .map((student) => `<option value="${student.id}">${escapeHtml(student.full_name)}</option>`)
      .join('');
  });
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

window.updateMembership = async (id, status) => {
  await request(`${api.memberships}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  toast('Membership updated.');
  loadAll();
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

async function request(url, options = {}, useAuth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (useAuth && state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(url, { headers, ...options });

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

function showFileProtocolWarning() {
  if (window.location.protocol !== 'file:') return;
  const alert = document.querySelector('#auth-alert');
  alert.textContent = 'ClubHub must be opened from http://localhost:3000 after running npm start. Forms cannot connect to the API when this file is opened directly.';
  alert.classList.remove('hidden');
}

function setFormError(id, message) {
  const element = document.querySelector(`#${id}`);
  element.textContent = message;
  element.classList.toggle('hidden', !message);
}

function friendlyError(error) {
  if (window.location.protocol === 'file:') {
    return 'Please run npm start and open http://localhost:3000. Registration and login cannot work from a file:// page.';
  }

  return error.message || 'Something went wrong. Please check your information and try again.';
}

function title(value) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatRole(role) {
  return title(role);
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
