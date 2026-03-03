"""
VULN-03/04: Serialização insegura - Pickle e helpers
"""
import pickle
import base64


def cache_pickle(key, obj):
    """VULN-03: Serializa com pickle para Redis"""
    return pickle.dumps(obj)


def load_pickle(data):
    """VULN-03: Deserializa pickle sem validação - RCE"""
    return pickle.loads(data)
