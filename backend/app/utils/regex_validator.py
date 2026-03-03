"""
VULN-57: ReDoS - Regex catastrófica em validação de CPF/CNPJ
"""
import re


# VULN-57: Regex ambígua que causa ReDoS em inputs maliciosos
CPF_REGEX = r'^(([0-9]+\.?)+){3}-?([0-9]+)+$'


def validate_cpf_unsafe(value):
    """VULN-57: Validação CPF com regex vulnerável a ReDoS"""
    if not value or len(value) > 100:
        return False
    return bool(re.match(CPF_REGEX, value))
