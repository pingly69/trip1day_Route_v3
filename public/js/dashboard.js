/**
 * Dashboard & Reports View Logic
 */
let currentDashboardData = [];

async function dash_init() {
  showLoading();
  try {
    const sites = await loadSitesIfNeeded();
    const sel = document.getElementById('f_siteId');
    sel.innerHTML = '<option value="">-- ทั้งหมด --</option>';
    sites.forEach(s => {
      sel.innerHTML += `<option value="${s.Site_ID}">${s.Site_Name}</option>`;
    });

    await dash_search();
  } catch (err) {
    Swal.fire('Error', String(err.message || err), 'error');
  } finally {
    hideLoading();
  }
}

async function dash_search() {
  const filters = {
    startDate_CreatedAt: document.getElementById('f_startDate_CreatedAt').value,
    endDate_CreatedAt: document.getElementById('f_endDate_CreatedAt').value,
    startDate_ReqDate: document.getElementById('f_startDate_ReqDate').value,
    endDate_ReqDate: document.getElementById('f_endDate_ReqDate').value,
    reqName: document.getElementById('f_reqName').value.trim(),
    plateNo: document.getElementById('f_plateNo').value.trim(),
    siteId: document.getElementById('f_siteId').value,
    status: document.getElementById('f_status').value,
    startDate_Approve: document.getElementById('f_startDate_Approve').value,
    endDate_Approve: document.getElementById('f_endDate_Approve').value,
  };

  showLoading();
  try {
    const res = await ApiClient.call('api_getDashboardTransactions', filters);
    currentDashboardData = res.data || [];
    dash_renderTable(currentDashboardData);
  } catch (err) {
    Swal.fire('Error', String(err.message || err), 'error');
  } finally {
    hideLoading();
  }
}

function dash_clearFilter() {
  document.getElementById('f_startDate_CreatedAt').value = '';
  document.getElementById('f_endDate_CreatedAt').value = '';
  document.getElementById('f_startDate_ReqDate').value = '';
  document.getElementById('f_endDate_ReqDate').value = '';
  document.getElementById('f_startDate_Approve').value = '';
  document.getElementById('f_endDate_Approve').value = '';
  document.getElementById('f_reqName').value = '';
  document.getElementById('f_plateNo').value = '';
  document.getElementById('f_siteId').value = '';
  document.getElementById('f_status').value = 'ALL';
  dash_search();
}

function dash_renderTable(data) {
  document.getElementById('dashCount').innerText = data.length;
  const tbody = document.querySelector('#tbDashboard tbody');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" class="text-center text-muted py-4">ไม่พบข้อมูลตามเงื่อนไขที่ระบุ</td></tr>';
    return;
  }

  const formatDt = dtStr => {
    if (!dtStr) return '-';
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return dtStr;
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const formatReqDate = dtStr => {
    if (!dtStr) return '-';
    const parts = String(dtStr).split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dtStr;
  };

  data.forEach(t => {
    let badgeClass = 'bg-secondary';
    if (t.Status === 'APPROVED') badgeClass = 'bg-success';
    else if (t.Status === 'REJECTED') badgeClass = 'bg-danger';
    else if (t.Status === 'PENDING') badgeClass = 'bg-warning text-dark';
    else if (t.Status === 'DRAFT') badgeClass = 'bg-light text-dark border';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-monospace">${t.Transaction_ID || '-'}</td>
      <td>${formatDt(t.Created_At)}</td>
      <td>${formatReqDate(t.Req_Date)}</td>
      <td>${t.Emp_No ? `<span class="badge bg-light text-dark font-monospace border">${t.Emp_No}</span>` : '-'}</td>
      <td class="fw-bold">${t.Req_Name || '-'}</td>
      <td>${t.Plate_No || '-'}</td>
      <td>${t.Site_Name || '-'}</td>
      <td class="text-end">${t.Total_KM || 0}</td>
      <td class="text-end fw-bold text-success">${parseFloat(t.Net_Total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td class="text-center"><span class="badge ${badgeClass}">${t.Status || '-'}</span></td>
      <td>${t.Approver || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

const HEADER_MAP = {
  Transaction_ID: 'รหัสรายการ',
  Req_Date: 'วันที่เดินทาง',
  Emp_No: 'รหัสพนักงาน',
  Req_LINE_UserId: 'LINE User ID',
  Req_Name: 'ชื่อผู้เบิก',
  Plate_No: 'ทะเบียนรถ',
  Site_ID: 'รหัสสถานที่ (Site ID)',
  Site_Name: 'สถานที่',
  Travel_Purpose: 'วัตถุประสงค์',
  Trip_Details: 'รายละเอียดเส้นทาง',
  Total_KM: 'ระยะทาง (กม.)',
  Toll_Fee: 'ค่าทางด่วน',
  Park_Fee: 'ค่าจอดรถ',
  Flat_Rate_Fee: 'ค่าเหมาจ่าย',
  Net_Total: 'ยอดสุทธิ (บาท)',
  Approver: 'ผู้อนุมัติ',
  Status: 'สถานะ',
  Approve_Datetime: 'วันเวลาที่อนุมัติ',
  Created_At: 'วันเวลาที่บันทึก',
};

function mapForExport(dataArray) {
  const tripTypeLabel = tripType => {
    switch (String(tripType || '').toUpperCase()) {
      case 'ROUND_TRIP':
        return 'ไปกลับ';
      case 'SINGLE':
        return 'เที่ยวเดียว';
      default:
        return tripType ? String(tripType) : '';
    }
  };

  return dataArray.map(row => {
    const mapped = {};
    Object.keys(HEADER_MAP).forEach(key => {
      let val = row[key] !== undefined && row[key] !== null ? row[key] : '';

      // Format Req_Date (DD/MM/YYYY)
      if (key === 'Req_Date' && val !== '') {
        const parts = String(val).split('T')[0].split('-');
        if (parts.length === 3) {
          val = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }

      // Format Datetime fields (DD/MM/YYYY HH:mm:ss)
      if ((key === 'Created_At' || key === 'Approve_Datetime') && val !== '') {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          const pad = n => n.toString().padStart(2, '0');
          val = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        }
      }

      // Parse Trip_Details JSON to readable Thai text
      if (key === 'Trip_Details' && val !== '') {
        try {
          const trips = typeof val === 'string' ? JSON.parse(val) : val;
          if (Array.isArray(trips) && trips.length > 0) {
            val = trips
              .map(t => {
                let name = t.route_name;
                if (t.origin && t.dest && (!name || name === 'ระบุเอง')) {
                  name = `${t.origin} - ${t.dest}`;
                }
                const dist = t.km || 0;
                const type = tripTypeLabel(t.trip_type);
                return `${name || '-'} (${dist} กม.)${type ? ` [${type}]` : ''}`;
              })
              .join('; ');
          } else {
            val = '-';
          }
        } catch {
          // Keep raw value if not JSON
        }
      }

      // Format Numeric fields as real numbers in Excel
      if (['Total_KM', 'Toll_Fee', 'Park_Fee', 'Flat_Rate_Fee', 'Net_Total'].includes(key)) {
        val = parseFloat(val) || 0;
      }

      mapped[HEADER_MAP[key]] = val;
    });
    return mapped;
  });
}

function getExportFilename(extension = 'xlsx') {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `Trip1Day_Report_${dateStr}.${extension}`;
}

async function dash_exportExcel() {
  if (!currentDashboardData || currentDashboardData.length === 0) {
    Swal.fire('แจ้งเตือน', 'ไม่มีข้อมูลสำหรับ Export กรุณาค้นหาข้อมูลก่อน', 'warning');
    return;
  }

  showLoading();
  try {
    if (typeof XLSX === 'undefined') {
      throw new Error('ไม่พบไลบรารี XLSX ในระบบ กรุณารีเฟรชหน้าเว็บ');
    }

    const mappedData = mapForExport(currentDashboardData);
    const worksheet = XLSX.utils.json_to_sheet(mappedData);

    // Auto-fit column widths
    const colWidths = Object.keys(mappedData[0] || {}).map(key => {
      let maxLen = key.length * 2;
      for (let i = 0; i < Math.min(mappedData.length, 30); i++) {
        const valStr = String(mappedData[i][key] || '');
        if (valStr.length > maxLen) maxLen = valStr.length;
      }
      return { wch: Math.min(Math.max(maxLen + 4, 12), 60) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const filename = getExportFilename('xlsx');

    // Create binary array and proper Blob for Microsoft Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 500);

    hideLoading();
    Swal.fire({
      icon: 'success',
      title: 'ส่งออกสำเร็จ',
      text: `ดาวน์โหลดไฟล์ "${filename}" เรียบร้อยแล้ว`,
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (err) {
    hideLoading();
    Swal.fire('เกิดข้อผิดพลาด', `ไม่สามารถส่งออก Excel ได้: ${err.message || err}`, 'error');
  }
}

// Fallback CSV Export Function (100% compatible with all devices and browsers)
function dash_exportCSV() {
  if (!currentDashboardData || currentDashboardData.length === 0) {
    Swal.fire('แจ้งเตือน', 'ไม่มีข้อมูลสำหรับ Export กรุณาค้นหาข้อมูลก่อน', 'warning');
    return;
  }

  showLoading();
  try {
    const mappedData = mapForExport(currentDashboardData);
    const headers = Object.keys(mappedData[0] || {});
    
    // Build CSV string with UTF-8 BOM for Thai language Excel support
    let csvContent = '\uFEFF';
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\r\n';

    mappedData.forEach(row => {
      const line = headers.map(h => {
        const val = row[h] !== undefined && row[h] !== null ? String(row[h]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
      csvContent += line + '\r\n';
    });

    const filename = getExportFilename('csv');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 500);

    hideLoading();
    Swal.fire({
      icon: 'success',
      title: 'ส่งออก CSV สำเร็จ',
      text: `ดาวน์โหลดไฟล์ "${filename}" เรียบร้อยแล้ว`,
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (err) {
    hideLoading();
    Swal.fire('เกิดข้อผิดพลาด', `ไม่สามารถส่งออก CSV ได้: ${err.message || err}`, 'error');
  }
}
