"""
PKGBUILD Security Scanner for ArchStore.
Analyzes PKGBUILD files for suspicious or dangerous patterns.
"""

import re
from dataclasses import dataclass, field

@dataclass
class ScanFinding:
    """A single security finding."""
    severity: str  # "critical", "warning", "info"
    category: str
    description: str
    line_number: int = 0
    line_content: str = ""


@dataclass
class ScanResult:
    """Complete scan result."""
    package_name: str
    risk_score: int = 0  # 0-100
    findings: list = field(default_factory=list)
    scanned: bool = False

    def to_dict(self) -> dict:
        return {
            "package_name": self.package_name,
            "risk_score": self.risk_score,
            "findings": [
                {
                    "severity": f.severity,
                    "category": f.category,
                    "description": f.description,
                    "line_number": f.line_number,
                    "line_content": f.line_content,
                }
                for f in self.findings
            ],
            "scanned": self.scanned,
            "risk_level": _risk_level(self.risk_score),
        }


def _risk_level(score: int) -> str:
    if score >= 70:
        return "critical"
    elif score >= 40:
        return "warning"
    elif score >= 10:
        return "low"
    return "safe"


# --- Pattern Definitions ---

CRITICAL_PATTERNS = [
    (r'curl\s+.*\|\s*(ba)?sh', "Remote code execution via curl pipe to shell"),
    (r'wget\s+.*\|\s*(ba)?sh', "Remote code execution via wget pipe to shell"),
    (r'curl\s+.*\|\s*python', "Remote code execution via curl pipe to python"),
    (r'eval\s*\$\(', "Dynamic code evaluation with command substitution"),
    (r'base64\s+(-d|--decode)', "Base64 decoding (possible obfuscation)"),
    (r'\\x[0-9a-fA-F]{2}', "Hex-encoded characters (possible obfuscation)"),
    (r'rm\s+-rf\s+(/\s|/\*|/home|/etc|/usr|/var)', "Dangerous recursive deletion of system paths"),
    (r'chmod\s+[0-7]*777', "Setting world-writable permissions"),
    (r'chmod\s+\+s', "Setting SUID/SGID bit"),
    (r'/dev/tcp/', "Direct TCP socket access"),
    (r'nc\s+-[el]', "Netcat listener (possible backdoor)"),
    (r'mkfifo.*\|.*sh', "Named pipe shell redirect (possible backdoor)"),
]

WARNING_PATTERNS = [
    (r'curl\s+', "Network request using curl"),
    (r'wget\s+', "Network request using wget"),
    (r'git\s+clone', "Git clone operation"),
    (r'pip\s+install', "Python pip install (may bypass pacman)"),
    (r'npm\s+install\s+-g', "Global npm install"),
    (r'sudo\s+', "Sudo usage in PKGBUILD"),
    (r'systemctl\s+(enable|start)', "Enabling/starting services"),
    (r'dd\s+if=', "Direct disk write with dd"),
    (r'mkfs\.', "Filesystem formatting command"),
    (r'eval\s+', "Use of eval"),
    (r'exec\s+', "Use of exec"),
]

INFO_PATTERNS = [
    (r'source=\(', "Source file declarations"),
    (r'makedepends=', "Build dependencies declared"),
    (r'depends=', "Runtime dependencies declared"),
    (r'sha256sums=|sha512sums=|md5sums=', "Checksum verification present"),
    (r'check\(\)', "Check function present (good practice)"),
]


def scan_pkgbuild(package_name: str, content: str) -> ScanResult:
    """
    Scan a PKGBUILD file for security issues.
    Returns a ScanResult with findings and risk score.
    """
    result = ScanResult(package_name=package_name, scanned=True)

    if not content or not content.strip():
        result.findings.append(ScanFinding(
            severity="warning",
            category="empty",
            description="PKGBUILD is empty or could not be retrieved",
        ))
        result.risk_score = 20
        return result

    lines = content.split("\n")

    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        # Skip comments
        if stripped.startswith("#"):
            continue

        # Check critical patterns
        for pattern, description in CRITICAL_PATTERNS:
            if re.search(pattern, stripped, re.IGNORECASE):
                result.findings.append(ScanFinding(
                    severity="critical",
                    category="dangerous_command",
                    description=description,
                    line_number=i,
                    line_content=stripped[:200],
                ))
                result.risk_score += 25

        # Check warning patterns
        for pattern, description in WARNING_PATTERNS:
            if re.search(pattern, stripped, re.IGNORECASE):
                result.findings.append(ScanFinding(
                    severity="warning",
                    category="suspicious_command",
                    description=description,
                    line_number=i,
                    line_content=stripped[:200],
                ))
                result.risk_score += 5

        # Check info patterns
        for pattern, description in INFO_PATTERNS:
            if re.search(pattern, stripped, re.IGNORECASE):
                result.findings.append(ScanFinding(
                    severity="info",
                    category="metadata",
                    description=description,
                    line_number=i,
                    line_content=stripped[:200],
                ))

    # Check for missing checksums (security concern)
    if not re.search(r'(sha256sums|sha512sums|b2sums)=', content):
        result.findings.append(ScanFinding(
            severity="warning",
            category="missing_verification",
            description="No strong checksum verification (sha256/sha512/b2) found",
        ))
        result.risk_score += 10

    # Check for missing check() function
    if "check()" not in content:
        result.findings.append(ScanFinding(
            severity="info",
            category="best_practice",
            description="No check() function defined (testing not enforced)",
        ))

    # Cap score at 100
    result.risk_score = min(100, result.risk_score)

    return result
