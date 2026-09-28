/**
 * Master Site View Logic
 */
let modalSite;

document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('modalMasterSite');
  if (el) modalSite = new bootstrap.Modal(el);
});

async function site_loadData() {
  showLoading();
  try {
    const sites = await loadSitesIfNeeded();
    site_renderTable(sites);
  } catch (err) {
    Swal.fire('Error', String(err.message || err), 'error');
  } finally {
    hideLoading();
  }
}

function site_renderTable(sites) {
  const tbody = document.querySelector('#tbMasterSite tbody');
  tbody.innerHTML = '';
  if (sites.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">ไม่พบข้อมูล Site</td></tr>';
    return;
  }

  sites.forEach((s, idx) => {
    const badge = s.Active
      ? '<span class="badge bg-success">Active</span>'
      : '<span class="badge bg-secondary">Inactive</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><span class="badge bg-light text-dark font-monospace border px-2 py-1">${s.Site_ID}</span></td>
      <td class="fw-bold">${s.Site_Name}</td>
      <td>${badge}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1" onclick='site_openModal(${JSON.stringify(s)})' title="แก้ไข"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="site_deleteData('${s.Site_ID}')" title="ลบ"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function site_openModal(siteObj = null) {
  document.getElementById('formMasterSite').reset();
  const siteIdInput = document.getElementById('site_id');
  const isEditInput = document.getElementById('site_is_edit');
  const helpText = document.getElementById('site_id_help');

  if (siteObj) {
    document.getElementById('modalMasterSiteLabel').innerText = 'แก้ไข Master Site';
    isEditInput.value = 'true';
    siteIdInput.value = siteObj.Site_ID;
    siteIdInput.readOnly = true;
    siteIdInput.classList.add('bg-light');
    helpText.innerHTML = '<i class="fas fa-lock text-warning me-1"></i>รหัส Site (Site ID) ไม่สามารถแก้ไขได้ หากต้องการเปลี่ยนรหัสต้องลบแล้วสร้างใหม่';
    document.getElementById('site_name').value = siteObj.Site_Name;
    document.getElementById('site_active').checked = siteObj.Active;
  } else {
    document.getElementById('modalMasterSiteLabel').innerText = 'เพิ่ม Master Site ใหม่';
    isEditInput.value = 'false';
    siteIdInput.value = '';
    siteIdInput.readOnly = false;
    siteIdInput.classList.remove('bg-light');
    helpText.innerHTML = '<i class="fas fa-info-circle me-1"></i>ระบุรหัสจากระบบ ERP (ห้ามซ้ำ) ไม่สามารถแก้ไขได้หลังสร้างแล้ว';
    document.getElementById('site_name').value = '';
    document.getElementById('site_active').checked = true;
  }

  modalSite.show();
}

async function site_saveData() {
  const isEdit = document.getElementById('site_is_edit').value === 'true';
  const siteId = document.getElementById('site_id').value.trim();
  const siteName = document.getElementById('site_name').value.trim();
  const active = document.getElementById('site_active').checked;

  if (!siteId) {
    Swal.fire('แจ้งเตือน', 'กรุณาระบุรหัส Site (Site ID / ERP Code)', 'warning');
    return;
  }

  if (!siteName) {
    Swal.fire('แจ้งเตือน', 'กรุณาระบุชื่อ Site', 'warning');
    return;
  }

  const payload = {
    isEdit: isEdit,
    Site_ID: siteId,
    Site_Name: siteName,
    Active: active,
  };

  const btn = document.getElementById('btnSaveSite');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> กำลังบันทึก...';

  try {
    await ApiClient.call('api_saveMasterSite', payload);
    modalSite.hide();
    Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1500, showConfirmButton: false });

    // Invalidate state and reload
    invalidateSites();
    invalidateRoutes(); // Cascade routes updates might happen
    await site_loadData();
  } catch (err) {
    Swal.fire('เกิดข้อผิดพลาด', String(err.message || err), 'error');
  } finally {
    btn.disabled = false;
    btn.innerText = 'บันทึกข้อมูล';
  }
}

function site_deleteData(siteId) {
  Swal.fire({
    title: 'ยืนยันการลบ?',
    text: `ลบ Site "${siteId}" ใช่หรือไม่? (เส้นทางทั้งหมดที่ผูกกับ Site นี้จะถูกลบไปด้วย)`,
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
        await ApiClient.call('api_deleteMasterSite', siteId);
        Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1500, showConfirmButton: false });
        invalidateSites();
        invalidateRoutes();
        await site_loadData();
      } catch (err) {
        Swal.fire('Error', String(err.message || err), 'error');
      } finally {
        hideLoading();
      }
    }
  });
}
