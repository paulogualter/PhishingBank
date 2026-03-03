"""
VULN-09: XXE em parser OFX/XML
"""
from flask import request, jsonify
from flask_jwt_extended import jwt_required


def register_ofx_routes(bp):
    @bp.route("/import/ofx", methods=["POST"])
    @jwt_required()
    def import_ofx():
        """VULN-09: XXE - parser XML sem defusedxml, aceita external entities"""
        if not request.data:
            return jsonify({"error": "XML obrigatório"}), 400
        try:
            from app.utils.xml_parser import parse_xml_unsafe
            from io import BytesIO
            root = parse_xml_unsafe(BytesIO(request.data))
            # Extrair dados básicos (simplificado)
            result = {"tag": root.tag, "parsed": True}
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": str(e), "parsed": False}), 400
