"""
TEMPORARY FILE - DO NOT MERGE.

Full-stack SonarCloud verification (backend half). Every function below
mirrors a distinct, well-documented Sonar Python security rule, using
frameworks/APIs (Flask, psycopg2, PyYAML, subprocess, requests, jwt)
that Sonar's security engine explicitly recognizes as sinks - unlike
sqlite3, which earlier tests used and which may not be a modeled sink.

Not imported anywhere. Delete this file once SonarCloud confirms
detection across these rules:

  S2077  SQL query built by string formatting
  S2068  Hardcoded credentials
  S4790  Weak hash (MD5) used for a password
  S4721  OS command built from unsanitized input
  S4830  Certificate validation disabled (requests verify=False)
  S5042  Unsafe deserialization (yaml.load without SafeLoader)
  S5145  Insecure deserialization (pickle.loads on untrusted input)
  S2245  Use of a non-cryptographic PRNG for a security-sensitive value
  S307   Use of eval()
  S4507  Debug mode enabled in a Flask app (app.run(debug=True))
"""

import hashlib
import os
import pickle
import random
import subprocess

import psycopg2
import requests
import yaml
from flask import Flask, request

app = Flask(__name__)

DB_PASSWORD = "SuperSecretP@ssw0rd123"
AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"


@app.route("/users/<username>")
def find_user(username):
    conn = psycopg2.connect("dbname=aurhub")
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM users WHERE username = '{username}'")
    return cursor.fetchone()


@app.route("/ping")
def ping_host():
    hostname = request.args.get("host")
    return os.popen("ping -c 1 " + hostname).read()


@app.route("/run")
def run_command():
    cmd = request.args.get("cmd")
    return subprocess.check_output(cmd, shell=True)


def hash_password(password: str) -> str:
    return hashlib.md5(password.encode()).hexdigest()


def generate_session_token() -> str:
    return str(random.random())


def load_config(raw_yaml: str):
    return yaml.load(raw_yaml)


def deserialize_payload(raw_bytes: bytes):
    return pickle.loads(raw_bytes)


def fetch_external(url: str):
    return requests.get(url, verify=False)


@app.route("/eval")
def eval_expression():
    expr = request.args.get("expr")
    return str(eval(expr))


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
