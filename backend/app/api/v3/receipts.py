"""
VULN-12: SSTI em geração de comprovante
"""
from flask import request, jsonify
from flask_jwt_extended import jwt_required


def register_receipts_routes(bp):
    @bp.route("/receipts/generate", methods=["GET"])
    @jwt_required()
    def generate_receipt():
        """VULN-12: SSTI - name interpolado no template Jinja2"""
        name = request.args.get("name", "Cliente")
        try:
            from app.services.pdf_generator import generate_receipt_unsafe
            receipt = generate_receipt_unsafe(name)
            return jsonify({"receipt": receipt})
        except Exception as e:
            return jsonify({"error": str(e)}), 400
