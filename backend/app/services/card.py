"""
VULN-26: Criptografia AES-ECB em dados de cartão - proposital
"""
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import hashlib


def get_card_key(cnpj="12345678000199"):
    """VULN-26: Deriva chave fraca do CNPJ com MD5"""
    return hashlib.md5(cnpj.encode()).digest()


def encrypt_pan(card_number, key=None):
    """VULN-26: AES-ECB - modo vulnerável a análise de padrões"""
    key = key or get_card_key()
    cipher = AES.new(key, AES.MODE_ECB)
    return cipher.encrypt(pad(card_number.encode(), 16))


def decrypt_pan(encrypted, key=None):
    key = key or get_card_key()
    cipher = AES.new(key, AES.MODE_ECB)
    return unpad(cipher.decrypt(encrypted), 16).decode()
