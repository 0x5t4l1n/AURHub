"""
Sanitization utilities for ArchStore.
Prevents command injection and validates all user-supplied input
before it reaches any shell command.
"""

import re

# Strict whitelist: only allow valid package name characters
# Arch package names: lowercase letters, digits, @, ., _, +, -
PACKAGE_NAME_PATTERN = re.compile(r'^[a-zA-Z0-9@._+\-]+$')

# Maximum lengths
MAX_PACKAGE_NAME_LENGTH = 256
MAX_SEARCH_QUERY_LENGTH = 128


def sanitize_package_name(name: str) -> str:
    """
    Validate and sanitize a package name.
    Raises ValueError if the name contains invalid characters.
    """
    if not name or not isinstance(name, str):
        raise ValueError("Package name cannot be empty")

    name = name.strip()

    if len(name) > MAX_PACKAGE_NAME_LENGTH:
        raise ValueError(f"Package name too long (max {MAX_PACKAGE_NAME_LENGTH} chars)")

    if not PACKAGE_NAME_PATTERN.match(name):
        raise ValueError(
            f"Invalid package name '{name}'. "
            "Only letters, digits, @, ., _, +, - are allowed."
        )

    return name


def sanitize_search_query(query: str) -> str:
    """
    Validate and sanitize a search query.
    More permissive than package names but still safe.
    """
    if not query or not isinstance(query, str):
        raise ValueError("Search query cannot be empty")

    query = query.strip()

    if len(query) > MAX_SEARCH_QUERY_LENGTH:
        raise ValueError(f"Search query too long (max {MAX_SEARCH_QUERY_LENGTH} chars)")

    # Remove any shell metacharacters
    dangerous_chars = set(';&|`$(){}[]!#~\\<>"\'\n\r\t')
    sanitized = ''.join(c for c in query if c not in dangerous_chars)

    if not sanitized:
        raise ValueError("Search query contains only invalid characters")

    return sanitized


def validate_source_filter(source: str) -> str:
    """Validate the source filter parameter."""
    allowed = {"all", "pacman", "aur"}
    source = source.strip().lower()
    if source not in allowed:
        raise ValueError(f"Invalid source filter '{source}'. Allowed: {', '.join(allowed)}")
    return source
