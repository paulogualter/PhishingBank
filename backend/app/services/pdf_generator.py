"""
VULN-12: SSTI em engine de comprovantes - Jinja2
Interpola input diretamente no template
"""
import jinja2


def generate_receipt_unsafe(name):
    """
    VULN-12: SSTI - name concatenado no template para Jinja2 interpretar
    Payload: {{ 7*7 }} ou {{ config.__class__.__init__.__globals__['os'].popen('id').read() }}
    """
    # CÓDIGO VULNERÁVEL: name vai para o template sem escape - Jinja2 executa
    template_str = "Comprovante para: " + name + "\nValor: R$ 100,00\nData: {{ now }}"
    template = jinja2.Template(template_str)
    return template.render(now="2024-01-01")
