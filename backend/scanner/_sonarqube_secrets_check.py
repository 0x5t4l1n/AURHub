"""
TEMPORARY FILE - DO NOT MERGE.

Secret-scanning verification (SonarCloud "Secrets" engine, not language-
specific taint analysis). Uses the industry-standard dummy test strings
that AWS's own docs and every secret-scanner (TruffleHog, Gitleaks,
GitHub secret scanning, SonarCloud) use as canonical examples - these are
publicly documented placeholders, not real credentials.

Rule family : secrets:S6290 (AWS credentials), secrets:S6334 (generic
              high-entropy / provider tokens)

Not imported anywhere - exists only to confirm the SonarCloud PR check
flags leaked secrets. Delete this file once confirmed.
"""

AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
GITHUB_TOKEN = "ghp_16C7e42F292c6912E7710c838347Ae178B4a"
