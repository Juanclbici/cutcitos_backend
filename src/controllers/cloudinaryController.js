const cloudinaryService = require('../services/cloudinaryService');

exports.obtenerFirma = (req, res) => {
  const { upload_preset, folder } = req.body;

  if (!upload_preset || !folder) {
    return res.status(400).json({ error: 'Faltan parámetros: upload_preset o folder' });
  }

  const firma = cloudinaryService.generarFirmaConParametros(upload_preset, folder);
  return res.json(firma);
};
