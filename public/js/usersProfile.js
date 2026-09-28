/**
 * Users Profile View Logic
 */
let modalUserInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('modalUser');
  if (el) modalUserInstance = new bootstrap.Modal(el);
});

async function users_loadData() {
  showLoading();
  try {
    const users = await loadUsersIfNeeded();
    users_renderTable(users);
  } catch (err) {
    Swal.fire('Error', String(err.message || err), 'error');
  } finally {
    hideLoading();
  }
}

function users_renderTable(data) {
  const tbody = document.getElementById('tb_users');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">ไม่พบข้อมูลผู้ใช้งาน</td></tr>`;
    return;
  }

  data.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-bold text-primary font-monospace">${u.Line_uid || ''}</td>
      <td>${u.emp_no ? `<span class="badge bg-light text-dark font-monospace border">${u.emp_no}</span>` : '<span class="text-muted">-</span>'}</td>
      <td class="fw-bold">${u.requester_name || ''}</td>
      <td>${u.car_no || ''}</td>
      <td><span class="badge bg-info text-dark">กลุ่ม ${u.group_car || 1}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="users_edit('${u.Line_uid}')" title="แก้ไข">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="users_delete('${u.Line_uid}')" title="ลบ">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function users_search() {
  const keyword = document.getElementById('f_userSearch').value.trim().toLowerCase();
  if (!keyword) {
    users_renderTable(AdminState.users);
    return;
  }

  const filtered = AdminState.users.filter(
    u =>
      (u.Line_uid && u.Line_uid.toLowerCase().includes(keyword)) ||
      (u.emp_no && u.emp_no.toLowerCase().includes(keyword)) ||
      (u.requester_name && u.requester_name.toLowerCase().includes(keyword)) ||
      (u.car_no && u.car_no.toLowerCase().includes(keyword))
  );

  users_renderTable(filtered);
}

function users_openModal() {
  document.getElementById('u_isEdit').value = '0';
  document.getElementById('u_lineUid').value = '';
  document.getElementById('u_lineUid').readOnly = false;
  document.getElementById('u_empNo').value = '';
  document.getElementById('u_reqName').value = '';
  document.getElementById('u_carNo').value = '';
  document.getElementById('u_groupCar').value = '1';

  document.getElementById('modalUserTitle').innerText = 'เพิ่มผู้ใช้';

  if (!modalUserInstance) {
    modalUserInstance = new bootstrap.Modal(document.getElementById('modalUser'));
  }
  modalUserInstance.show();
}

function users_edit(lineUid) {
  const user = AdminState.users.find(u => u.Line_uid === lineUid);
  if (!user) return;

  document.getElementById('u_isEdit').value = '1';
  document.getElementById('u_lineUid').value = user.Line_uid || '';
  document.getElementById('u_lineUid').readOnly = true; // Primary Key
  document.getElementById('u_empNo').value = user.emp_no || '';
  document.getElementById('u_reqName').value = user.requester_name || '';
  document.getElementById('u_carNo').value = user.car_no || '';
  document.getElementById('u_groupCar').value = user.group_car || '1';

  document.getElementById('modalUserTitle').innerText = 'แก้ไขข้อมูลผู้ใช้';

  if (!modalUserInstance) {
    modalUserInstance = new bootstrap.Modal(document.getElementById('modalUser'));
  }
  modalUserInstance.show();
}

async function users_save() {
  const isEdit = document.getElementById('u_isEdit').value === '1';
  const lineUid = document.getElementById('u_lineUid').value.trim();
  const empNo = document.getElementById('u_empNo').value.trim();
  const reqName = document.getElementById('u_reqName').value.trim();
  const carNo = document.getElementById('u_carNo').value.trim();
  const groupCar = document.getElementById('u_groupCar').value;

  if (!lineUid || !reqName || !carNo) {
    Swal.fire('แจ้งเตือน', 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (Line UID, ชื่อผู้ขอเบิก, ทะเบียนรถ)', 'warning');
    return;
  }

  const payload = {
    isEdit: isEdit,
    Line_uid: lineUid,
    emp_no: empNo,
    requester_name: reqName,
    car_no: carNo,
    group_car: Number(groupCar),
  };

  showLoading();
  try {
    await ApiClient.call('api_saveUser', payload);
    Swal.fire({
      icon: 'success',
      title: 'บันทึกสำเร็จ',
      timer: 1500,
      showConfirmButton: false,
    });
    modalUserInstance.hide();
    invalidateUsers();
    await users_loadData();
  } catch (err) {
    Swal.fire('Error', String(err.message || err), 'error');
  } finally {
    hideLoading();
  }
}

async function users_delete(lineUid) {
  const result = await Swal.fire({
    title: 'ยืนยันการลบ?',
    text: `คุณต้องการลบข้อมูล Line UID: ${lineUid} ใช่หรือไม่?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'ใช่, ลบเลย!',
    cancelButtonText: 'ยกเลิก',
  });

  if (result.isConfirmed) {
    showLoading();
    try {
      await ApiClient.call('api_deleteUser', lineUid);
      Swal.fire({
        icon: 'success',
        title: 'ลบข้อมูลสำเร็จ',
        timer: 1500,
        showConfirmButton: false,
      });
      invalidateUsers();
      await users_loadData();
    } catch (err) {
      Swal.fire('Error', String(err.message || err), 'error');
    } finally {
      hideLoading();
    }
  }
}
