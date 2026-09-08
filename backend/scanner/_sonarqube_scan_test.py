"""
TEMPORARY FILE - DO NOT MERGE.

Added solely to verify that SonarQube (or any configured SAST scanner) is
actually running against pull requests in this repository. It intentionally
contains well-known insecure patterns that static analyzers flag out of the
box:

  * hardcoded credential            -> python:S2068 / S6437
  * weak/broken hash for a password -> python:S4790 / S5344
  * OS command built from input     -> python:S4721 (command injection)
  * SQL query built via string
    concatenation                   -> python:S2077 (SQL injection)

None of this code is imported or wired into the application. If the scan
picks these up as expected, delete this file and close the PR without
merging.
"""

import hashlib
import os
import sqlite3

DB_PASSWORD = "SuperSecretP@ssw0rd123"


def hash_password(password: str) -> str:
    return hashlib.md5(password.encode()).hexdigest()


def run_diagnostic_ping(hostname: str) -> str:
    return os.popen("ping -c 1 " + hostname).read()


def find_user_by_name(conn: sqlite3.Connection, username: str):
    cursor = conn.cursor()
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    cursor.execute(query)
    return cursor.fetchone()
