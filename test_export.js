// Test export mapping and XLSX generation
const XLSX = require('xlsx');
const fs = require('fs');

const sampleRow = {
  Transaction_ID: 'TX-578d8a74-9a07-419d-b3b9-815bde95ad03',
  Req_Date: '2026-08-13',
  Emp_No: 'TEST',
  Req_LINE_UserId: 'U0b548b2aad82fdd5ba268f43f24c3294',
  Req_Name: 'IMG_HR & Safety',
  Plate_No: '1234',
  Site_ID: 'A10702026',
  Site_Name: 'ท่าโพธิ์ศรี จ.อุบลราชธานี FC',
  Travel_Purpose: 'Test',
  Image_URL: '',
  Trip_Details: '[{"trip_id": "t-08ikc62", "trip_no": 1, "type": "FIX", "trip_type": "ROUND_TRIP", "route_id": "e71d3bcb-0b96-433c-9588-d16e38d8c49b", "route_name": "หน้างาน-ที่พัก", "origin": "หน้างาน", "dest": "ที่พัก", "km": 4}]',
  Total_KM: 38,
  Toll_Fee: 0,
  Park_Fee: 0,
  Flat_Rate_Fee: 150,
  Net_Total: 332.4,
  Approver: 'พี่ลิขิต',
  Status: 'REJECTED',
  Approve_Datetime: '2026-08-14 15:59:31',
  Created_At: '2026-08-14T15:54:42.007+07:00'
};

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
  Net_Total: 'ยอดสุทธิ',
  Approver: 'ผู้อนุมัติ',
  Status: 'สถานะ',
  Approve_Datetime: 'วันเวลาที่อนุมัติ',
  Created_At: 'วันเวลาที่บันทึก',
};

const tripTypeLabel = (tripType) => {
  switch (String(tripType || '').toUpperCase()) {
    case 'ROUND_TRIP': return 'ไปกลับ';
    case 'SINGLE': return 'เที่ยวเดียว';
    default: return tripType ? String(tripType) : '';
  }
};

function mapForExport(dataArray) {
  return dataArray.map(row => {
    const mapped = {};
    Object.keys(HEADER_MAP).forEach(key => {
      let val = row[key] !== undefined && row[key] !== null ? row[key] : '';
      if ((key === 'Req_Date' || key === 'Created_At' || key === 'Approve_Datetime') && val !== '') {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          const pad = n => n.toString().padStart(2, '0');
          val = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        }
      }
      if (key === 'Trip_Details' && val !== '') {
        try {
          const trips = typeof val === 'string' ? JSON.parse(val) : val;
          if (Array.isArray(trips)) {
            val = trips
              .map(t => {
                let name = t.route_name;
                if (t.origin && t.dest && (!name || name === 'ระบุเอง')) {
                  name = `${t.origin} - ${t.dest}`;
                }
                const dist = t.km || 0;
                const type = tripTypeLabel(t.trip_type);
                return `${name || '-'} (${dist} กม.)${type ? ` - ${type}` : ''}`;
              })
              .join(' / ');
          }
        } catch {}
      }
      mapped[HEADER_MAP[key]] = val;
    });
    return mapped;
  });
}

const mapped = mapForExport([sampleRow]);
console.log('Mapped row:', mapped[0]);

const worksheet = XLSX.utils.json_to_sheet(mapped);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
XLSX.writeFile(workbook, 'test_output.xlsx');
console.log('test_output.xlsx size:', fs.statSync('test_output.xlsx').size);
