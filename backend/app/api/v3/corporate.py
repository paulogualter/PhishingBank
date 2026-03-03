"""
VULN-15: LDAP Injection em login corporativo
"""
from flask import request, jsonify


def register_corporate_routes(bp):
    @bp.route("/corporate/auth", methods=["POST"])
    def corporate_login():
        """VULN-15: Filtro LDAP com concatenação direta - injection"""
        data = request.get_json() or {}
        username = data.get("username", "")
        password = data.get("password", "")
        # VULN-15: Concatenação direta - bypass com *)("""
        try:
            from ldap3 import Server, Connection, ALL
            # Simulação - ldap3 escape seria o correto
            filter_str = f"(&(uid={username})(password={password}))"
            return jsonify({"filter_used": filter_str, "auth": "bypass_ldap"})
        except ImportError:
            return jsonify({"error": "ldap3 não instalado", "filter": f"(&(uid={username})(password={password}))"})
