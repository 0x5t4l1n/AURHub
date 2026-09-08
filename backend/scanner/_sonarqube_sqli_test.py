"""
TEMPORARY FILE - DO NOT MERGE.

Single-issue SonarQube scan verification.

Vulnerability type : SQL Injection
CWE                : CWE-89 (Improper Neutralization of Special Elements
                      used in an SQL Command)
Sonar rule family   : python:S2077 (formatting SQL queries is security-sensitive)

This mirrors the classic "build a query with string concatenation/formatting
instead of bind parameters" mistake that the rest of this codebase avoids
(see backend/database/db.py, which uses aiosqlite bind parameters
throughout). Not imported anywhere - it exists only to confirm the
SonarCloud PR check flags this one issue. Delete this file once confirmed.
"""

import sqlite3


def find_user_by_name(conn: sqlite3.Connection, username: str):
    cursor = conn.cursor()
    query = "SELECT * FROM users WHERE username = '" + username + "'"  # noqa: SQL injection, for SAST test only
    cursor.execute(query)
    return cursor.fetchone()
