function guardarPDFsEnDrive() {
  // Variables que DEBES modificar:
  
  const ID_CARPETA_DRIVE = "PON_AQUI_EL_ID_DE_TU_CARPETA"; // Ejemplo: "1A2b3C4d5E6f..."
  const ASUNTO_BUSCADO = "Factura"; // Ejemplo: "Factura", "Boleta", "Recibo", etc.

  const query = `subject:${ASUNTO_BUSCADO} has:attachment filename:pdf`;
  const threads = GmailApp.search(query);

  if (threads.length === 0) {
    Logger.log("No se encontraron correos con el asunto indicado.");
    return;
  }

  const carpetaDestino = DriveApp.getFolderById(ID_CARPETA_DRIVE);

  threads.forEach(thread => {
    const mensajes = thread.getMessages();
    mensajes.forEach(mensaje => {
      const adjuntos = mensaje.getAttachments();
      adjuntos.forEach(archivo => {
        if (archivo.getContentType() === "application/pdf") {
          carpetaDestino.createFile(archivo);
          Logger.log(`Guardado: ${archivo.getName()}`);
        }
      });
    });
  });

  Logger.log("Proceso completado correctamente.");
}
