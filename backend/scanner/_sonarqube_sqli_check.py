"""
TEMPORARY FILE - DO NOT MERGE.

Single-issue SonarQube scan verification.

Vulnerability type : SQL Injection + Hardcoded Credential
CWE                : CWE-89 (SQL Injection), CWE-798 (Hardcoded Credentials)
Sonar rule family   : python:S2077 (formatting SQL queries is security-sensitive)
                      python:S2068 (hardcoded credentials are security-sensitive)

Query is built with an f-string directly inside the .execute() call, the
exact shape Sonar's rule description for S2077 documents, rather than
through an intermediate variable. This mirrors the mistake the rest of
this codebase avoids (see backend/database/db.py, which uses aiosqlite
bind parameters throughout). Not imported anywhere - it exists only to
confirm the SonarCloud PR check flags these issues. Delete this file
once confirmed.
"""

import sqlite3

DB_PASSWORD = "SuperSecretP@ssw0rd123"


def find_user_by_name(conn: sqlite3.Connection, username: str):
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM users WHERE username = '{username}'")
    return cursor.fetchone()
