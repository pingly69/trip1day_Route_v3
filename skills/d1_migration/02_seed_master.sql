-- ====================================================================
-- Master Data Seed Script
-- Tables: master_config, rate_car, master_site, master_routes, approve_users, users_profile
-- ====================================================================

-- Table: master_config
INSERT OR REPLACE INTO master_config (key, value) VALUES ('FLAT_RATE_FEE', '150');
INSERT OR REPLACE INTO master_config (key, value) VALUES ('MAX_TRIPS_PER_DAY', '10');
INSERT OR REPLACE INTO master_config (key, value) VALUES ('MIN_TRIPS_PER_DAY', '1');

-- Table: rate_car
INSERT OR REPLACE INTO rate_car (dt_date, group_car1, group_car2) VALUES ('2026-01-01', 4.0, 4.0);
INSERT OR REPLACE INTO rate_car (dt_date, group_car1, group_car2) VALUES ('2026-04-17', 5.0, 5.0);
INSERT OR REPLACE INTO rate_car (dt_date, group_car1, group_car2) VALUES ('2026-06-26', 4.8, 4.8);

-- Table: master_site
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A06302025', 'เก็บงาน/Construction/อื่นๆ', 0);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A07902026', 'The Dentistry Pattaya', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A08002026', 'ถนนพระยาสัจจา FC', 0);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A08302026', 'ทุ่งสุขลา FC', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A09602026', 'Smile D Dental  Watcharaphol', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A10102026', 'วัดพิมมาวาส จ.ฉะเชิงเทรา (ทองมาเงินไป)', 0);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A10402026', 'สนามบินดอนเมือง (ชาตรามือ)', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A10702026', 'ท่าโพธิ์ศรี จ.อุบลราชธานี FC', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A10502026', 'ตลาดสดราชพัสดุชุมแพ จ.ขอนแก่น', 0);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A02102025', 'บ้านลดาวัลย์ 21', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A05902025', 'งานแก้ไข/คืนเงินประกัน/Construction/อื่นๆ', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A04602026', 'สำนักงานออฟฟิศ คุณสมศักดิ์', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('Sale', 'วัดพื้นที่/รับมอบพื้นที่', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A10802026', 'โลตัส บ้านโป่ง MD', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A03802026', 'The Dentistry Bangna', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A10902026', 'ไบเทค บางนา (ชาตรามือ)', 0);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A11102026', 'แจสกรีน วิลเลจ บางบัวทอง (ชาตรามือ)', 0);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A01502026', 'ตรงข้ามเทศบาลบ้านสวน', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A11602026', 'ห้างแปซิฟิคพาร์ค (ชลบุรี) FC', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A11902026', 'สามพราน นครปฐม (ทองมาเงินไป)', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A11702026', 'บางเลน นครปฐม (ทองมาเงินไป)', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A12202026', 'เรือรังสิต คลอง3 งานเพิ่มเทพื้นแทงค์น้ำ', 0);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A12102026', 'ขอนแก่น (Yadea)', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A12502026', 'ก๋วยเตี๋ยวเรือ ถนนปู่เจ้าสมิงพราย จ.สมุทรปราการ', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A12402026', 'อ่อนนุช 80', 0);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('HO', 'Head Office', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('STORE', 'Store', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A12602026', 'ตลาดนิคมพัฒนา FC', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A12302026', 'K Avenue (อาคารพาณิชย์ 12 ห้อง)', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A12702026', 'เสนา จ.อยุธยา (ทองมาเงินไป)', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A06002025', 'TIEW MAE', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A13202026', 'Lemon Green Mart สาขา ชลบุรี', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A13302026', 'กาฬสินธุ์ (Yadea)', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A13502026', 'นครราชสีมา (Yadea)', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A13402026', 'โลตัส หนองจอก (MD)', 1);
INSERT OR REPLACE INTO master_site (site_id, site_name, active) VALUES ('A12902026', 'ตลาดจอมพล จ.อยุธยา (ทองมาเงินไป)', 1);

-- Table: master_routes
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('2e9bc79d-5114-4292-b01a-f813e30a98e0', 'A10502026', 'สำนักงานใหญ่-ตลาดสดราชพัสดุชุมแพ จ.ขอนแก่น', 'สำนักงาน', 'หน้างาน', 438.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('3f53fcae-7ded-49d1-9aa3-6ea505569a75', 'A10502026', 'โกดัง -ตลาดสดราชพัสดุชุมแพ จ.ขอนแก่น', 'โกดัง', 'ตลาดสดราชพัสดุชุมแพ จ.ขอนแก่น', 417.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('bf245239-1379-4772-9c01-02b49ecfd319', 'A10702026', 'สำนักงานใหญ่-ท่าโพธิ์ศรี จ.อุบลราชธานี', 'สำนักงาน', 'หน้างาน', 585.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('dc88fba2-8be2-4166-9fa1-34feeb87dc47', 'A10702026', 'โกดัง-หน้างาน', 'โกดัง', 'ท่าโพธิ์ศรี  จ.อุบลราชธานี', 630.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('764a6187-b96e-4969-8d73-c9528446a49b', 'A09602026', 'สำนักงานใหญ่-หน้างาน', 'สำนักงาน', 'หน้างาน', 4.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('d55b15fd-7209-4a21-b109-c2171bc77825', 'A09602026', 'โกดัง-หน้างาน', 'โกดัง', 'หน้างาน', 33.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('e71d3bcb-0b96-433c-9588-d16e38d8c49b', 'A10702026', 'หน้างาน-ที่พัก', 'หน้างาน', 'ที่พัก', 4.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('873289a1-a3d2-42f4-9a82-d2ddd0180c7f', 'A10902026', 'โกดัง-หน้างาน', 'โกดัง', 'หน้างาน', 65.0, 0);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('98d07979-c12e-47db-8597-8aa115cdb6b4', 'A10902026', 'สำนักงานใหญ่-หน้างาน', 'สำนักงานใหญ่', 'หน้างาน', 35.0, 0);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('b25b664d-06e3-44d2-90f6-628a3698f06c', 'A08302026', 'โกดัง-หน้างาน', 'โกดัง', 'หน้างาน', 153.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('56725d20-bae6-436a-a269-f2479784cc1a', 'A11602026', 'โกดัง-หน้างาน', 'โกดัง', 'หน้างาน', 145.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('ddecac06-e469-45f2-9589-d806924469c8', 'A01502026', 'โกดัง-หน้างาน', 'โกดัง', 'หน้างาน', 132.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('401d02f5-57b1-4e5b-b36b-8689003e2ce8', 'A12102026', 'โกดัง-หน้างาน', 'โกดัง', 'หน้างาน', 345.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('ffa3b5e9-5054-452a-b6d7-6a150024df6f', 'A11902026', 'โกดัง-หน้างาน', 'โกดัง', 'หน้างาน', 97.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('e1042f42-536b-4b7a-a251-244dadc41825', 'A11702026', 'โกดัง-หน้างาน', 'โกดัง', 'หน้างาน', 98.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('4a0a46a3-fdc1-49c1-8edf-abfd4e3104dc', 'A12502026', 'โกดัง-หน้างาน', 'โกดัง', 'หน้างาน', 79.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('4e767839-4c94-4f3e-b136-1487eb25d418', 'A12602026', 'โกดัง-หน้างาน', 'โกดัง', 'หน้างาน', 185.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('4f308e3b-26f8-494d-bf03-a10f3dc97b40', 'A10802026', 'โกดัง-หน้างาน', 'โกดัง', 'หน้างาน', 135.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('cd1bc6de-167b-45ce-99d7-47539f3d30c3', 'A13302026', 'โกดัง-หน้างาน', 'โกดัง', 'หน้างาน', 495.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('8aa39359-e2e9-4ff1-bbaa-f1d4aec1f1f0', 'A13502026', 'โกดัง-หน้างาน', 'โกดัง', 'หน้างาน', 235.0, 1);
INSERT OR REPLACE INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active) VALUES ('0038962e-0954-48b4-ba0a-d5574e54b821', 'A13202026', 'โกดัง-หน้างาน', 'โกดัง', 'หน้างาน', 170.0, 1);

-- Table: approve_users
INSERT INTO approve_users (approve_request, line_profile, line_uid, active) VALUES ('พี่น้ำ', 'U1d9149a04436a3f9194b193d8f0fe138', 'U1d9149a04436a3f9194b193d8f0fe138', 1);
INSERT INTO approve_users (approve_request, line_profile, line_uid, active) VALUES ('พี่ดุ๋ย', 'Ucf701d10496a59d51918e6a138c16321', 'Ucf701d10496a59d51918e6a138c16321', 1);
INSERT INTO approve_users (approve_request, line_profile, line_uid, active) VALUES ('พี่ลิขิต', 'Ueee9eed854ee150cd17fab1da9e70632', 'Ueee9eed854ee150cd17fab1da9e70632', 1);
INSERT INTO approve_users (approve_request, line_profile, line_uid, active) VALUES ('พี่หมู', 'U019edef38cb012de8d2d76d4d186b50e', 'U019edef38cb012de8d2d76d4d186b50e', 0);
INSERT INTO approve_users (approve_request, line_profile, line_uid, active) VALUES ('สกุณา บ่ายเจริญ', 'U6f638fef70908eaf8375ddbe87042b5b', 'U6f638fef70908eaf8375ddbe87042b5b', 1);

-- Table: users_profile
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Ufdb8dd97e54b8652925b36386232c230', 'สุวัฒน์ Pingly TEST', 'รสดี', 1, 'ZZZZZZ');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U00a5a1d33fdc700e7b0c2e33179f05be', 'ภาดล ทองดี', '1กท7972', 1, 'M00050');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U0f6f39afc245101172bbc32732a83d0d', 'ทรงวิทย์ ทิพย์เรืองใต้', 'ยฉ4115', 1, 'D0154');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U1203074b7dbde2c97a2a90cee53467d9', 'พรชัย อินแผง', '3ฒบ6504', 1, 'D0032');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U165132ff51322225bce34c6852b0fa48', 'ณัฐพงศ์ บูรณะ', '6ขฮ6193', 1, 'D0014');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U1d9149a04436a3f9194b193d8f0fe138', 'สมบูรณ์ แซ่ลิ่ม', '8กล1622', 1, 'M00005');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U1f0b0795f3b322af02cb32ebef849125', 'ครรชนะ บูรณะ', '3ฒช8572', 1, 'M00011');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U2220675d2c220596034e663293e8b5b2', 'สุเชษฐ์ ดิษคุ้ม', '7ขฉ3448', 1, 'M00048');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U316e79481c161d18ecb3e1962e41d694', 'จัตุรงค์ ชูเชิด', 'ผต2666', 1, 'M00055');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U379ed142df7568f628d1e80bcab47cc6', 'ศักดิ์ชัย เชื้อนพคุณ', 'บพ6162', 1, 'D0100');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U4aed0bf5ce4ad4d065499959b5d99827', 'คมศักดิ์ พรรณงาม', 'บพ4067', 1, 'D0048');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U58759569032a06ec53aa9fc0ff12366a', 'จินดารัตน์ อินสำรัตน์', 'บษ4896', 1, 'D0069');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U5b80d103709126e526a98466ed9a056b', 'ลัภนนทน์ ศักดิ์ดา', '2กจ2360', 1, 'M00032');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U5ebf64b1a9347b1ab1b6434f0596aba4', 'จิรพนธ์ สมานมิตร', '2กณ9819 กรุงเทพ', 1, 'D0045');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U82613c52c3085be57f128b7aa3b0e8d9', 'ธนากร เจริญสุข', '3กศ8729', 1, 'M00018');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U83ae119ff2499ad8399b1aa743563f84', 'ศตเมธ พระแก้ว', 'กฉ7747', 1, 'M00051');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U88df45b6108a423196f833926a702563', 'ประกาศ บูรณะ', '1 ฒ จ2980', 1, 'D0011');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U894260dabe3099f91a9d63a8bec6779b', 'กมลเทพ ไชยสิน', 'กบ3184', 1, 'M00037');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U8bd9328b20088be2ea72ea5e40ddea13', 'สะท้าน ศรีษะเนตร', 'ผข-4871 ร้อยเอ็ด', 1, 'D0126');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U93bfacf1117eb1f0fe2eab6ed374945c', 'สมชาย ทานุชิต', 'กน3916', 1, 'M00046');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U9b6e2a1dd44c481691202c4d64155691', 'ชัชพงษ์ ศรีทนสา', '4ฒจ8039', 1, 'D0061');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U9dc4ae56aac790dd896e232877e6aaeb', 'เต็มใจ ขุนอินทร์', '3ฒศ8298', 1, 'D0071');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U9fc00f5c1de6e97d8212ccd8e61d8a31', 'ทรงสิทธิ์ ทิพย์เรืองใต้', 'ขฉ4117 อยุธยา', 1, 'D0064');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Ua356ff2bb149bf34cec3f0aadd875f6e', 'ปิยะพงษ์ คำน้อย', 'บล5483', 1, 'M00056');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Ua4e51091250841a867ed22d6a77dc254', 'ธีระพงศ์ วงค์งาม', 'ผม5966', 1, 'D0055');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Ua6036903bdfcfb1e57c527558f23d1a1', 'วัชระ มุมทอง', 'บล8908', 1, 'D0038');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Uaa704b946a3f6cbf57f51c8c8e67d7bc', 'กฤษณะชัย สุดประเสริฐ', 'กท4099', 1, 'M00066');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Uaafc3ecc046b6dcc9a50c47f20977168', 'ณัทชัย ศุภฤกษ์กมล', 'บพ9408', 1, 'D0031');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Ub0e680927a41c71b235a994ae62388fe', 'ณัฐพงษ์ เกตุศิริ', 'กท9259', 1, 'M00009');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Ub0fea04272d261781993ef1077e34cb2', 'ไพรรัตน์ ฝ่ายเหนือ', '5ขค2051', 1, 'M00012');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Ubb7fc2ef8df21126e2b1c5dc0795a51f', 'นันทพงศ์ สุมณีงาม', '1กฉ6804', 1, 'M00049');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Uc424afabc63a230c9007cb2f38058c87', 'กฤษดา แผ้วฉ่ำ', '6ขผ3150 กรุงเทพฯ', 1, 'M00054');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Uc69ce1840d42d928f79a989d07fcf1ae', 'ไตรภพ บูรณะ', '1ฒง6147', 1, 'M00010');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Uc6f46d1eeca3828c2fd6cfc428e94c71', 'ราชวัตร หิรัญศรี', '4ขค8386', 1, 'M00058');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Ucf31f02884e0b825b433f927c8afb9c8', 'ณรงศักดิ์ กระแสเทพ', 'ผท7019', 1, 'D0056');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Ud707c570de64143247c205a5873bb982', 'จำนงค์ ชิดปลัด', '3ขศ7232', 1, 'D0080');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Udcddd4824f7d0cd5d65c65d27dc73155', 'สมชาย ดวงแก้ว', '3ฒภ1425 กรุงเทพมหานคร', 1, 'D0029');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Ue9670f93e876ed2b4cd219e11e4dc06a', 'อภิรัตน์ ชมสาร', '6ขพ4935', 1, 'D0016');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U2690ea7efa02e62fa5aab1344a007423', 'เกษม แผ่นทอง', 'กบ6133', 1, 'M00017');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Ua96a7ce2706c4555edb666ce1c8cbaa2', 'เกรียงไกร บูรณะ', 'บษ1858', 1, 'D0027');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Ud556f5138c8df6ce2c85bdf79d9539c0', 'บุญโชย บูรณะ', 'ฒฮ3926', 1, 'M00007');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Uf2ef03a3abed7ff473278c2dcf41b6f5', 'ณรงศักดิ์ กระแสเทพ', 'ผท  7019ระยอง', 1, 'D0056');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U3bca7e7f18162abbdf99c54de91897dd', 'เฉลิม เห็นสุข', 'บพ3639', 1, 'D0076');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U10d9519ce8eaa05e273478761c0c217b', 'สุชาติ แก่นฝาง', 'บย2681', 1, 'D0075');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Ufb494b7e68ed4b72df584a204146fafd', 'อนุชา สารพันธ์', '1กฆ1779', 1, 'M00065');
INSERT OR REPLACE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('Ub31171779a42f1c0a43a3514685da80c', 'สุริยา ศรีเพชร', '7ขฏ1734', 1, 'D0005');
INSERT OR IGNORE INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no) VALUES ('U0b548b2aad82fdd5ba268f43f24c3294', 'IMG_HR & Safety', '1234', 1, 'TEST');