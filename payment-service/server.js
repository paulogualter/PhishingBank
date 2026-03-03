/**
 * VULN-53: Payment Service - Auth bypass via X-Internal-Service header
 * Qualquer request com X-Internal-Service: true é aceito
 */
const express = require('express');
const app = express();
app.use(express.json());

app.post('/transfer', (req, res) => {
  // VULN-53: Verifica apenas header - bypassável via SSRF
  if (req.headers['x-internal-service'] === 'true') {
    return res.json({ success: true, message: 'Transferência autorizada' });
  }
  res.status(401).json({ error: 'Unauthorized' });
});

app.listen(8001, '0.0.0.0', () => {
  console.log('Payment service on :8001');
});
