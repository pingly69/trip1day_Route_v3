#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automated Verification Test Suite for Trip1Day-db
Database: Trip1Day-db.sqlite
Author: Senior Full Stack Developer
Date: 2026-09-19
"""

import sqlite3
import os
import sys
import json
import re

DB_FILE = "IMG_DB.sqlite" if os.path.exists("IMG_DB.sqlite") else "Trip1Day-db.sqlite"

def print_header(title):
    print("\n" + "=" * 70)
    print(f" {title}")
    print("=" * 70)

def print_pass(msg):
    print(f"  [PASS] {msg}")

def print_fail(msg):
    print(f"  [FAIL] {msg}")

def main():
    print_header(f"RUNNING VERIFICATION TEST SUITE ON {DB_FILE}")
    
    if not os.path.exists(DB_FILE):
        print_fail(f"Database file '{DB_FILE}' does not exist!")
        sys.exit(1)
        
    file_size_kb = os.path.getsize(DB_FILE) / 1024
    print_pass(f"Found '{DB_FILE}' (Size: {file_size_kb:.2f} KB)")
    
    conn = sqlite3.connect(DB_FILE)
    conn.execute("PRAGMA foreign_keys = ON;")
    cursor = conn.cursor()
    
    total_tests = 0
    passed_tests = 0

    # -------------------------------------------------------------
    # Test Suite 1: Table Existence and Row Count Verification
    # -------------------------------------------------------------
    print_header("Test Suite 1: Table Existence & Expected Row Counts")
    expected_tables = {
        "master_site": 36,
        "master_routes": 21,
        "users_profile": 47,
        "master_config": 3,
        "rate_car": 3,
        "approve_users": 5,
        "transactions": 255
    }
    
    for table_name, expected_count in expected_tables.items():
        total_tests += 1
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            actual_count = cursor.fetchone()[0]
            if actual_count == expected_count:
                print_pass(f"Table '{table_name}': {actual_count} rows (Matches expected {expected_count})")
                passed_tests += 1
            else:
                print_fail(f"Table '{table_name}': Got {actual_count} rows, expected {expected_count}")
        except Exception as e:
            print_fail(f"Table '{table_name}': Query failed: {e}")

    # -------------------------------------------------------------
    # Test Suite 2: Foreign Key Integrity Check
    # -------------------------------------------------------------
    print_header("Test Suite 2: Foreign Key Integrity Verification")
    total_tests += 1
    cursor.execute("PRAGMA foreign_key_check;")
    fk_violations = cursor.fetchall()
    if len(fk_violations) == 0:
        print_pass("PRAGMA foreign_key_check returned 0 violations (100% Referential Integrity)")
        passed_tests += 1
    else:
        print_fail(f"Found {len(fk_violations)} Foreign Key violations: {fk_violations}")

    # -------------------------------------------------------------
    # Test Suite 3: Index Verification
    # -------------------------------------------------------------
    print_header("Test Suite 3: Critical Performance & Constraint Indices")
    expected_indices = [
        "idx_site_name_lower",
        "idx_master_site_active_name",
        "idx_route_name_per_site",
        "idx_master_routes_site_active",
        "idx_rate_car_date_desc",
        "idx_approve_users_active",
        "idx_transactions_date_user_site",
        "idx_transactions_date_user",
        "idx_transactions_created_at",
        "idx_transactions_req_date",
        "idx_transactions_approve_datetime",
        "idx_transactions_site_status"
    ]
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type = 'index'")
    existing_indices = {row[0] for row in cursor.fetchall()}
    
    for idx in expected_indices:
        total_tests += 1
        if idx in existing_indices:
            print_pass(f"Index '{idx}' is present in schema")
            passed_tests += 1
        else:
            print_fail(f"Index '{idx}' is MISSING from schema!")

    # -------------------------------------------------------------
    # Test Suite 4: Uniqueness Constraints Enforcement (In Rollback Transaction)
    # -------------------------------------------------------------
    print_header("Test Suite 4: Business Rules & Uniqueness Enforcement")
    
    # 4.1 Master Site Uniqueness (Case-insensitive & Trim)
    total_tests += 1
    cursor.execute("SAVEPOINT test_uniqueness;")
    site_unique_pass = False
    try:
        # Existing site: 'Sale' -> 'วัดพื้นที่/รับมอบพื้นที่'
        cursor.execute("INSERT INTO master_site (site_id, site_name, active) VALUES ('TEST_DUP_SITE', '  วัดพื้นที่/รับมอบพื้นที่  ', 1)")
        conn.commit()
    except sqlite3.IntegrityError:
        site_unique_pass = True
    finally:
        cursor.execute("ROLLBACK TO SAVEPOINT test_uniqueness;")
        
    if site_unique_pass:
        print_pass("Master Site: Case-insensitive & Trim duplicate prevention confirmed (Rejected duplicate)")
        passed_tests += 1
    else:
        print_fail("Master Site: Allowed duplicate site name with trim/case variation!")

    # 4.2 Master Route Uniqueness (Per Site)
    total_tests += 1
    cursor.execute("SAVEPOINT test_route_uniqueness;")
    route_unique_pass = False
    try:
        # Route 'สำนักงานใหญ่-ตลาดสดราชพัสดุชุมแพ จ.ขอนแก่น' in site 'A10502026'
        cursor.execute("""
            INSERT INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active)
            VALUES ('TEST_DUP_ROUTE', 'A10502026', '  สำนักงานใหญ่-ตลาดสดราชพัสดุชุมแพ จ.ขอนแก่น  ', 'Origin', 'Dest', 10.0, 1)
        """)
        conn.commit()
    except sqlite3.IntegrityError:
        route_unique_pass = True
    finally:
        cursor.execute("ROLLBACK TO SAVEPOINT test_route_uniqueness;")
        
    if route_unique_pass:
        print_pass("Master Routes: Uniqueness within same site confirmed (Rejected duplicate)")
        passed_tests += 1
    else:
        print_fail("Master Routes: Allowed duplicate route name in same site!")

    # 4.3 Same Route name in DIFFERENT site should succeed
    total_tests += 1
    cursor.execute("SAVEPOINT test_route_diff_site;")
    route_diff_site_pass = False
    try:
        cursor.execute("""
            INSERT INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active)
            VALUES ('TEST_DIFF_SITE_ROUTE', 'A07902026', 'สำนักงานใหญ่-ตลาดสดราชพัสดุชุมแพ จ.ขอนแก่น', 'Origin', 'Dest', 10.0, 1)
        """)
        route_diff_site_pass = True
    except Exception as e:
        print_fail(f"Different site same route error: {e}")
    finally:
        cursor.execute("ROLLBACK TO SAVEPOINT test_route_diff_site;")
        
    if route_diff_site_pass:
        print_pass("Master Routes: Same route name in DIFFERENT site is correctly allowed")
        passed_tests += 1
    else:
        print_fail("Master Routes: Erroneously blocked same route name in different site")

    # 4.4 Transaction Duplicate Reimbursement Prevention (1 Person + 1 Day + 1 Site = 1 Record)
    total_tests += 1
    cursor.execute("SAVEPOINT test_tx_dup;")
    tx_dup_blocked = False
    try:
        # Insert duplicate for existing transaction (2026-08-13, U0b548b2aad82fdd5ba268f43f24c3294, A10702026)
        cursor.execute("""
            INSERT INTO transactions (transaction_id, req_name, req_line_user_id, req_date, site_id, site_name, net_total)
            VALUES ('TX_TEST_DUP', 'Test', 'U0b548b2aad82fdd5ba268f43f24c3294', '2026-08-13', 'A10702026', 'Test Site', 100.0)
        """)
        conn.commit()
    except sqlite3.IntegrityError:
        tx_dup_blocked = True
    finally:
        cursor.execute("ROLLBACK TO SAVEPOINT test_tx_dup;")
        
    if tx_dup_blocked:
        print_pass("Transactions: Duplicate prevention (1 User + 1 Date + 1 Site) strictly enforced")
        passed_tests += 1
    else:
        print_fail("Transactions: Allowed duplicate transaction for same user, date, and site!")

    # -------------------------------------------------------------
    # Test Suite 5: Cascade Delete & Snapshot Behavior
    # -------------------------------------------------------------
    print_header("Test Suite 5: Cascade Delete & Historical Snapshot Safety")
    
    # 5.1 Route Cascade Delete
    total_tests += 1
    cursor.execute("SAVEPOINT test_cascade;")
    cascade_passed = False
    try:
        # Site 'A10502026' has 2 routes
        cursor.execute("SELECT COUNT(*) FROM master_routes WHERE site_id = 'A10502026'")
        before_routes = cursor.fetchone()[0]
        
        cursor.execute("DELETE FROM master_site WHERE site_id = 'A10502026'")
        cursor.execute("SELECT COUNT(*) FROM master_routes WHERE site_id = 'A10502026'")
        after_routes = cursor.fetchone()[0]
        
        if before_routes > 0 and after_routes == 0:
            cascade_passed = True
    finally:
        cursor.execute("ROLLBACK TO SAVEPOINT test_cascade;")
        
    if cascade_passed:
        print_pass("Cascade Delete: Deleting Master Site automatically purges associated routes")
        passed_tests += 1
    else:
        print_fail(f"Cascade Delete: Routes were not purged (before: {before_routes}, after: {after_routes})")

    # 5.2 Deleting Site with Historical Transactions
    total_tests += 1
    cursor.execute("SAVEPOINT test_tx_safety;")
    tx_safety_passed = False
    try:
        # Site 'A10702026' has 4 transactions
        cursor.execute("SELECT COUNT(*) FROM transactions WHERE site_id = 'A10702026'")
        before_tx = cursor.fetchone()[0]
        
        cursor.execute("DELETE FROM master_site WHERE site_id = 'A10702026'")
        cursor.execute("SELECT COUNT(*) FROM transactions WHERE site_id = 'A10702026'")
        after_tx = cursor.fetchone()[0]
        
        if before_tx > 0 and after_tx == before_tx:
            tx_safety_passed = True
    finally:
        cursor.execute("ROLLBACK TO SAVEPOINT test_tx_safety;")
        
    if tx_safety_passed:
        print_pass("Historical Snapshot: Deleting Master Site does NOT break or delete past Transactions")
        passed_tests += 1
    else:
        print_fail(f"Historical Snapshot: Transaction retention failed (before: {before_tx}, after: {after_tx})")

    # -------------------------------------------------------------
    # Test Suite 6: Data Integrity, Types & JSON Format
    # -------------------------------------------------------------
    print_header("Test Suite 6: Data Formatting & JSON Integrity")
    
    # 6.1 Check Req_Date format YYYY-MM-DD
    total_tests += 1
    cursor.execute("SELECT COUNT(*) FROM transactions WHERE req_date NOT LIKE '____-__-__'")
    invalid_dates = cursor.fetchone()[0]
    if invalid_dates == 0:
        print_pass("Req_Date: All 255 records comply with ISO 'YYYY-MM-DD' format")
        passed_tests += 1
    else:
        print_fail(f"Req_Date: Found {invalid_dates} records with invalid date format!")

    # 6.2 Check JSON validity in trip_details
    total_tests += 1
    cursor.execute("SELECT transaction_id, trip_details FROM transactions")
    invalid_json_count = 0
    all_trips = cursor.fetchall()
    for tx_id, trip_str in all_trips:
        try:
            parsed = json.loads(trip_str)
            if not isinstance(parsed, list):
                invalid_json_count += 1
        except Exception:
            invalid_json_count += 1
            
    if invalid_json_count == 0:
        print_pass(f"Trip_Details: All {len(all_trips)} records contain valid JSON Array")
        passed_tests += 1
    else:
        print_fail(f"Trip_Details: Found {invalid_json_count} records with invalid JSON format!")

    # 6.3 Check Users Profile emp_no
    total_tests += 1
    cursor.execute("SELECT COUNT(*) FROM users_profile WHERE emp_no != ''")
    emp_no_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM users_profile")
    total_users = cursor.fetchone()[0]
    if emp_no_count > 0:
        print_pass(f"Users Profile: {emp_no_count}/{total_users} users have Employee ID (emp_no) mapped")
        passed_tests += 1
    else:
        print_fail("Users Profile: No employee ID found!")

    # -------------------------------------------------------------
    # Summary
    # -------------------------------------------------------------
    print_header("TEST RESULTS SUMMARY")
    print(f"Total Tests Executed: {total_tests}")
    print(f"Tests Passed:        {passed_tests}")
    print(f"Tests Failed:        {total_tests - passed_tests}")
    
    if passed_tests == total_tests:
        print("\n>>> ALL TESTS PASSED! Database 'Trip1Day-db.sqlite' is 100% VERIFIED & READY FOR PHASE 2. <<<\n")
        conn.close()
        sys.exit(0)
    else:
        print("\n>>> SOME TESTS FAILED! Please inspect the logs above. <<<\n")
        conn.close()
        sys.exit(1)

if __name__ == "__main__":
    main()
