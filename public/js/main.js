/**
 * Main Application & State Management
 */
const AdminState = {
  isLoggedIn: false,
  sites: [],
  routes: [],
  users: [],
  sitesLoaded: false,
  routesLoaded: false,
  usersLoaded: false,
};

function invalidateSites() {
  AdminState.sitesLoaded = false;
}

function invalidateRoutes() {
  AdminState.routesLoaded = false;
}

function invalidateUsers() {
  AdminState.usersLoaded = false;
}

async function loadSitesIfNeeded() {
  if (AdminState.sitesLoaded) return AdminState.sites;
  const res = await ApiClient.call('api_getMasterSites');
  // Sort with Thai collator (Intl.Collator('th')) as required in Spec v3 Section 4.1.2
  const collator = new Intl.Collator('th', { sensitivity: 'base' });
  AdminState.sites = (res.data || []).sort((a, b) => collator.compare(a.Site_Name, b.Site_Name));
  AdminState.sitesLoaded = true;
  return AdminState.sites;
}

async function loadRoutesIfNeeded() {
  if (AdminState.routesLoaded) return AdminState.routes;
  const res = await ApiClient.call('api_getMasterRoutes');
  const collator = new Intl.Collator('th', { sensitivity: 'base' });
  AdminState.routes = (res.data || []).sort((a, b) => collator.compare(a.Route_Name, b.Route_Name));
  AdminState.routesLoaded = true;
  return AdminState.routes;
}

async function loadUsersIfNeeded() {
  if (AdminState.usersLoaded) return AdminState.users;
  const res = await ApiClient.call('api_getUsers');
  const collator = new Intl.Collator('th', { sensitivity: 'base' });
  AdminState.users = (res.data || []).sort((a, b) => collator.compare(a.requester_name, b.requester_name));
  AdminState.usersLoaded = true;
  return AdminState.users;
}

// Loading UI helpers
function showLoading() {
  const el = document.getElementById('loadingOverlay');
  if (el) el.style.display = 'flex';
}
function hideLoading() {
  const el = document.getElementById('loadingOverlay');
  if (el) el.style.display = 'none';
}

// Router
const PAGE_TITLES = {
  dashboard: 'Dashboard / รายการเบิกจ่าย',
  masterSite: 'Master Site / จัดการสถานที่',
  masterRoute: 'Master Routes / จัดการเส้นทาง',
  usersProfile: 'Users Profile / จัดการผู้ใช้งาน',
};

function router_nav(pageId) {
  // Hide all page sections
  document.querySelectorAll('.page-section').forEach(el => {
    el.style.display = 'none';
  });

  // Update active navigation item in sidebar
  document.querySelectorAll('#sidebar-wrapper .list-group-item').forEach(el => {
    el.classList.remove('active');
  });
  const activeNav = document.getElementById('nav_' + pageId);
  if (activeNav) activeNav.classList.add('active');

  // Show selected page
  const targetPage = document.getElementById('page_' + pageId);
  if (targetPage) targetPage.style.display = 'block';

  // Update navbar title
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.innerText = PAGE_TITLES[pageId] || 'Trip1Day Admin';

  // Trigger page data loading
  if (pageId === 'dashboard') {
    dash_init();
  } else if (pageId === 'masterSite') {
    site_loadData();
  } else if (pageId === 'masterRoute') {
    route_loadData();
  } else if (pageId === 'usersProfile') {
    users_loadData();
  }
}

// UI Event Initializations
let loginModal;

document.addEventListener('DOMContentLoaded', () => {
  loginModal = new bootstrap.Modal(document.getElementById('loginModal'));

  // Sidebar toggle
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('wrapper').classList.toggle('toggled');
    });
  }

  // Check Authentication State
  const authed = sessionStorage.getItem('admin_authed');
  if (authed === 'true') {
    showApp();
  } else {
    loginModal.show();
  }
});

async function app_login() {
  const codeInput = document.getElementById('adminPasscode');
  const code = codeInput.value.trim();
  if (!code) {
    Swal.fire('แจ้งเตือน', 'กรุณากรอกรหัสผ่านแอดมิน', 'warning');
    return;
  }

  const btn = document.getElementById('btnLogin');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> กำลังเข้าสู่ระบบ...';

  try {
    const res = await ApiClient.call('api_verifyPasscode', code);
    sessionStorage.setItem('admin_authed', 'true');
    sessionStorage.setItem('admin_token', res.token);
    loginModal.hide();
    showApp();
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'เข้าสู่ระบบไม่สำเร็จ',
      text: String(err.message || err),
    });
    codeInput.value = '';
  } finally {
    btn.disabled = false;
    btn.innerText = 'เข้าสู่ระบบ';
  }
}

function app_logout() {
  sessionStorage.removeItem('admin_authed');
  sessionStorage.removeItem('admin_token');
  AdminState.isLoggedIn = false;
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('adminPasscode').value = '';
  loginModal.show();
}

function showApp() {
  AdminState.isLoggedIn = true;
  document.getElementById('appContainer').style.display = 'block';
  router_nav('dashboard');
}
