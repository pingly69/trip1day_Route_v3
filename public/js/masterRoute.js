/**
 * Master Route View Logic
 */
let modalRoute;

document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('modalMasterRoute');
  if (el) modalRoute = new bootstrap.Modal(el);
});

async function route_loadData() {
  showLoading();
  try {
    const [sites, routes] = await Promise.all([loadSitesIfNeeded(), loadRoutesIfNeeded()]);

    // Populate Site filter dropdown
    const filterSelect = document.getElementById('filterRouteSite');
    filterSelect.innerHTML = '<option value="ALL">-- ดูทุก Site --</option>';
    sites.forEach(s => {
      filterSelect.innerHTML += `<option value="${s.Site_ID}">${s.Site_Name}</option>`;
    });

    // Populate Modal Dropdown (Only Active Sites)
    const modalSelect = document.getElementById('route_site_id');
    modalSelect.innerHTML = '<option value="">-- เลือก Site --</option>';
    sites
      .filter(s => s.Active)
      .forEach(s => {
        modalSelect.innerHTML += `<option value="${s.Site_ID}">${s.Site_Name}</option>`;
      });

    route_applyFilter();
  } catch (err) {
    Swal.fire('Error', String(err.message || err), 'error');
  } finally {
    hideLoading();
  }
}

function route_applyFilter() {
  const selectedSite = document.getElementById('filterRouteSite').value;
  let data = AdminState.routes;

  if (selectedSite !== 'ALL') {
    data = data.filter(r => (r.site_id || r.Site_ID) === selectedSite);
  }
  route_renderTable(data);
}

function route_renderTable(routes) {
  const tbody = document.querySelector('#tbMasterRoute tbody');
  tbody.innerHTML = '';
  if (routes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">ไม่พบข้อมูลเส้นทาง</td></tr>';
    return;
  }

  routes.forEach(r => {
    const routeId = r.route_id || r.Route_ID;
    const siteName = r.site_name || r.Site_Name;
    const routeName = r.route_name || r.Route_Name;
    const origin = r.origin || r.Origin;
    const destination = r.destination || r.Destination;
    const distanceKm = r.distance_km !== undefined ? r.distance_km : r.Distance_KM;
    const isActive = r.active !== undefined ? r.active : r.Active;

    const badge = isActive
      ? '<span class="badge bg-success">Active</span>'
      : '<span class="badge bg-secondary">Inactive</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${siteName}</td>
      <td class="fw-bold">${routeName}</td>
      <td>${origin}</td>
      <td>${destination}</td>
      <td class="text-end">${distanceKm}</td>
      <td>${badge}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1" onclick='route_openModal(${JSON.stringify(r)})' title="แก้ไข"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="route_deleteData('${routeId}')" title="ลบ"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function route_openModal(routeObj = null) {
  document.getElementById('formMasterRoute').reset();
  document.getElementById('route_id').value = '';
  document.getElementById('route_active').checked = true;

  if (routeObj) {
    const routeId = routeObj.route_id || routeObj.Route_ID;
    const siteId = routeObj.site_id || routeObj.Site_ID;
    const siteName = routeObj.site_name || routeObj.Site_Name;

    document.getElementById('modalMasterRouteLabel').innerText = 'แก้ไขเส้นทาง';
    document.getElementById('route_id').value = routeId;

    // If updating, temporarily add the inactive site to dropdown if it's selected
    const select = document.getElementById('route_site_id');
    let optionExists = false;
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value === siteId) optionExists = true;
    }
    if (!optionExists) {
      select.innerHTML += `<option value="${siteId}">${siteName} (Inactive)</option>`;
    }

    document.getElementById('route_site_id').value = siteId;
    document.getElementById('route_name').value = routeObj.route_name || routeObj.Route_Name;
    document.getElementById('route_origin').value = routeObj.origin || routeObj.Origin;
    document.getElementById('route_destination').value = routeObj.destination || routeObj.Destination;
    document.getElementById('route_distance').value = routeObj.distance_km !== undefined ? routeObj.distance_km : routeObj.Distance_KM;
    document.getElementById('route_active').checked = routeObj.active !== undefined ? routeObj.active : routeObj.Active;
  } else {
    document.getElementById('modalMasterRouteLabel').innerText = 'เพิ่มเส้นทางใหม่';
  }

  modalRoute.show();
}

async function route_saveData() {
  const routeId = document.getElementById('route_id').value;
  const siteId = document.getElementById('route_site_id').value;
  const routeName = document.getElementById('route_name').value.trim();
  const origin = document.getElementById('route_origin').value.trim();
  const destination = document.getElementById('route_destination').value.trim();
  const distanceKm = document.getElementById('route_distance').value;
  const active = document.getElementById('route_active').checked;

  const payload = {
    route_id: routeId,
    site_id: siteId,
    route_name: routeName,
    origin: origin,
    destination: destination,
    distance_km: distanceKm,
    active: active,
    // Backward compatibility
    Route_ID: routeId,
    Site_ID: siteId,
    Route_Name: routeName,
    Origin: origin,
    Destination: destination,
    Distance_KM: distanceKm,
    Active: active,
  };

  // Validation
  if (!payload.Site_ID) {
    Swal.fire('แจ้งเตือน', 'กรุณาเลือก Site', 'warning');
    return;
  }
  if (!payload.Route_Name) {
    Swal.fire('แจ้งเตือน', 'กรุณาระบุชื่อเส้นทาง', 'warning');
    return;
  }
  if (!payload.Origin || !payload.Destination) {
    Swal.fire('แจ้งเตือน', 'กรุณาระบุต้นทางและปลายทาง', 'warning');
    return;
  }
  if (parseFloat(payload.Distance_KM) <= 0 || isNaN(parseFloat(payload.Distance_KM))) {
    Swal.fire('แจ้งเตือน', 'ระยะทางต้องมากกว่า 0', 'warning');
    return;
  }

  const btn = document.getElementById('btnSaveRoute');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> กำลังบันทึก...';

  try {
    await ApiClient.call('api_saveMasterRoute', payload);
    modalRoute.hide();
    Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1500, showConfirmButton: false });

    invalidateRoutes();
    await route_loadData();
  } catch (err) {
    Swal.fire('เกิดข้อผิดพลาด', String(err.message || err), 'error');
  } finally {
    btn.disabled = false;
    btn.innerText = 'บันทึกข้อมูล';
  }
}

function route_deleteData(routeId) {
  Swal.fire({
    title: 'ยืนยันการลบ?',
    text: 'ลบเส้นทางนี้ใช่หรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'ใช่, ลบเลย!',
    cancelButtonText: 'ยกเลิก',
  }).then(async result => {
    if (result.isConfirmed) {
      showLoading();
      try {
        await ApiClient.call('api_deleteMasterRoute', routeId);
        Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1500, showConfirmButton: false });
        invalidateRoutes();
        await route_loadData();
      } catch (err) {
        Swal.fire('Error', String(err.message || err), 'error');
      } finally {
        hideLoading();
      }
    }
  });
}
