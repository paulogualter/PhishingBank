"""
VULN-22/37: SSRF - requests sem validação de destino
"""
import requests


def fetch_url_unsafe(url):
    """VULN-22: SSRF - não bloqueia IPs privados (10.x, 169.254.x, etc)"""
    return requests.get(url, timeout=5)


def validate_address_callback(callback_url):
    """VULN-37: SSRF via webhook - aceita gopher://, file://"""
    return requests.post(callback_url, json={"status": "valid"}, timeout=5)
