"""
VULN-05: SVG XSS/SSRF | VULN-06: ZIP Slip
"""
import os
import zipfile
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename


def register_upload_routes(bp):
    @bp.route("/profile/avatar", methods=["POST"])
    @jwt_required()
    def upload_avatar():
        """VULN-05: Aceita SVG sem sanitizar - XSS stored e SSRF via <image href>"""
        from flask import current_app
        upload_dir = current_app.config.get("UPLOAD_FOLDER", os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads"))
        os.makedirs(upload_dir, exist_ok=True)
        if "file" not in request.files:
            return jsonify({"error": "arquivo obrigatório"}), 400
        f = request.files["file"]
        if f.filename == "":
            return jsonify({"error": "arquivo vazio"}), 400
        # VULN-05: Valida apenas extensão, não sanitiza conteúdo
        if f.filename.lower().endswith(".svg"):
            path = os.path.join(upload_dir, f"avatar_{get_jwt_identity()}.svg")
            f.save(path)
            return jsonify({"url": f"/uploads/avatar_{get_jwt_identity()}.svg"})
        return jsonify({"error": "apenas SVG aceito"}), 400

    @bp.route("/import/zip", methods=["POST"])
    @jwt_required()
    def import_zip():
        """VULN-06: ZIP Slip - extractall sem validar nomes dos arquivos"""
        from flask import current_app
        upload_dir = current_app.config.get("UPLOAD_FOLDER", os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads"))
        os.makedirs(upload_dir, exist_ok=True)
        if "file" not in request.files:
            return jsonify({"error": "arquivo obrigatório"}), 400
        f = request.files["file"]
        if not f.filename.endswith(".zip"):
            return jsonify({"error": "apenas ZIP"}), 400
        extract_dir = os.path.join(upload_dir, "zip_extract", str(get_jwt_identity()))
        os.makedirs(extract_dir, exist_ok=True)
        try:
            with zipfile.ZipFile(f, "r") as z:
                # VULN-06: extractall sem sanitizar - path traversal
                z.extractall(extract_dir)
            return jsonify({"success": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 400
