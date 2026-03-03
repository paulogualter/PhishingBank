"""
VULN-61: Open Redirect - redirecionamento sem validação de URL
"""
from app.api.v3 import bp
from flask import request, redirect


def register_redirect_routes(bp):
    @bp.route("/redirect", methods=["GET"])
    def open_redirect():
        """
        VULN-61: Open Redirect - aceita ?next= ou ?url= e redireciona sem validar.
        Permite phishing: vítima clica em link legítimo que redireciona para site malicioso.
        """
        url = request.args.get("next") or request.args.get("url") or request.args.get("return_url")
        if not url:
            from flask import jsonify
            return jsonify({"error": "parâmetro next, url ou return_url obrigatório"}), 400
        # VULN-61: Redireciona sem validar se URL é do mesmo domínio
        return redirect(url, code=302)
