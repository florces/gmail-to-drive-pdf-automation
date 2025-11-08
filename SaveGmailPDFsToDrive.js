function guardarPDFsEnDrive() {
  // Variables que DEBES modificar:
  
  const ID_CARPETA_DRIVE = "PON_AQUI_EL_ID_DE_TU_CARPETA"; // Ejemplo: "1A2b3C4d5E6f..."
  const ASUNTO_BUSCADO = "Factura"; // Ejemplo: "Factura", "Boleta", "Recibo", etc.

  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const fechaInicio = Utilities.formatDate(inicioMes, Session.getScriptTimeZone(), "yyyy/MM/dd");
  
  Logger.log(`Buscando correos desde inicio del mes: ${fechaInicio}`);
  Logger.log(`Asunto a buscar: "${ASUNTO_BUSCADO}"`);

  const query = `subject:${ASUNTO_BUSCADO} has:attachment filename:pdf after:${fechaInicio}`;
  
  Logger.log(`Query de búsqueda: ${query}`);
  
  const threads = GmailApp.search(query);

  if (threads.length === 0) {
    Logger.log("No se encontraron correos con el asunto indicado desde el inicio del mes.");
    return;
  }

  Logger.log(`Se encontraron ${threads.length} hilos de conversación con PDFs.`);

  const carpetaDestino = DriveApp.getFolderById(ID_CARPETA_DRIVE);
  Logger.log(`Carpeta de destino: ${carpetaDestino.getName()}`);

  let totalPDFsGuardados = 0;

  threads.forEach((thread, threadIndex) => {
    Logger.log(`Procesando hilo ${threadIndex + 1}/${threads.length}: ${thread.getFirstMessageSubject()}`);
    
    const mensajes = thread.getMessages();
    mensajes.forEach((mensaje, mensajeIndex) => {
      const fechaMensaje = Utilities.formatDate(mensaje.getDate(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      Logger.log(`Mensaje ${mensajeIndex + 1}: ${fechaMensaje}`);
      
      const adjuntos = mensaje.getAttachments();
      adjuntos.forEach(archivo => {
        if (archivo.getContentType() === "application/pdf") {
          try {

            const archivosExistentes = carpetaDestino.getFilesByName(archivo.getName());
            if (archivosExistentes.hasNext()) {
              Logger.log(`Ya existe: ${archivo.getName()}`);
            } else {
              carpetaDestino.createFile(archivo);
              totalPDFsGuardados++;
              Logger.log(`Guardado: ${archivo.getName()}`);
            }
          } catch (error) {
            Logger.log(`Error al guardar ${archivo.getName()}: ${error.message}`);
          }
        } else {
          Logger.log(`Adjunto ignorado (no PDF): ${archivo.getName()} - ${archivo.getContentType()}`);
        }
      });
    });
  });

  Logger.log(`Proceso completado. Total PDFs guardados: ${totalPDFsGuardados}`);
  Logger.log(`Resumen: ${threads.length} hilos procesados, ${totalPDFsGuardados} PDFs guardados desde ${fechaInicio}`);
}
