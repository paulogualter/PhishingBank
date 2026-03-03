"""
VULN-09/10/11: Parser XML sem desabilitar entidades externas - XXE
NÃO usar defusedxml - proposital para fins educacionais
"""
import xml.etree.ElementTree as ET
from io import BytesIO


def parse_xml_unsafe(content):
    """
    VULN-09: XXE - resolve_entities ativo por padrão em algumas libs
    Usar lxml ou ElementTree sem defusedxml
    """
    if isinstance(content, bytes):
        content = BytesIO(content)
    # VULN: ET.parse sem proteção XXE
    tree = ET.parse(content)
    return tree.getroot()


def parse_xml_string_unsafe(xml_str):
    """VULN: Parse de string XML vulnerável a XXE"""
    return ET.fromstring(xml_str)
