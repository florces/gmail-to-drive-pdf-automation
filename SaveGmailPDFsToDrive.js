function guardarPDFsEnDrivePorFechaJerarquica() {
  // Carpeta base donde se crearán las subcarpetas (año/mes/día)
  const ID_CARPETA_BASE = "1mesVSWzCHx3UXt1uriSPE1eHJ7RXcBGc"; // Cambia por tu carpeta principal
  const ASUNTO_BUSCADO = "Pdf"; // Cambia según lo que quieras buscar

  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
  const fechaInicio = Utilities.formatDate(inicioMes, Session.getScriptTimeZone(), "yyyy/MM/dd");

  Logger.log(`Buscando correos desde: ${fechaInicio}`);
  Logger.log(`Asunto a buscar: "${ASUNTO_BUSCADO}"`);

  const query = `subject:${ASUNTO_BUSCADO} has:attachment filename:pdf after:${fechaInicio}`;
  const threads = GmailApp.search(query);

  if (threads.length === 0) {
    Logger.log("No se encontraron correos con el asunto indicado desde el inicio del mes.");
    return;
  }

  Logger.log(`Se encontraron ${threads.length} hilos con PDFs.`);
  const carpetaBase = DriveApp.getFolderById(ID_CARPETA_BASE);

  let totalPDFsGuardados = 0;

  threads.forEach((thread, threadIndex) => {
    Logger.log(`Procesando hilo ${threadIndex + 1}/${threads.length}: ${thread.getFirstMessageSubject()}`);

    const mensajes = thread.getMessages();
    mensajes.forEach((mensaje, mensajeIndex) => {
      const fechaMensaje = mensaje.getDate();
      const año = Utilities.formatDate(fechaMensaje, Session.getScriptTimeZone(), "yyyy");
      const mes = Utilities.formatDate(fechaMensaje, Session.getScriptTimeZone(), "MM");
      const dia = Utilities.formatDate(fechaMensaje, Session.getScriptTimeZone(), "dd");

      // Crear o encontrar carpeta del año
      let carpetaAño;
      const carpetasAño = carpetaBase.getFoldersByName(año);
      if (carpetasAño.hasNext()) {
        carpetaAño = carpetasAño.next();
      } else {
        carpetaAño = carpetaBase.createFolder(año);
        Logger.log(`Carpeta creada: ${año}`);
      }

      // Crear o encontrar carpeta del mes dentro del año
      let carpetaMes;
      const carpetasMes = carpetaAño.getFoldersByName(mes);
      if (carpetasMes.hasNext()) {
        carpetaMes = carpetasMes.next();
      } else {
        carpetaMes = carpetaAño.createFolder(mes);
        Logger.log(`Carpeta creada: ${año}/${mes}`);
      }

      // Crear o encontrar carpeta del día dentro del mes
      let carpetaDia;
      const carpetasDia = carpetaMes.getFoldersByName(dia);
      if (carpetasDia.hasNext()) {
        carpetaDia = carpetasDia.next();
      } else {
        carpetaDia = carpetaMes.createFolder(dia);
        Logger.log(`Carpeta creada: ${año}/${mes}/${dia}`);
      }

      Logger.log(`Mensaje ${mensajeIndex + 1} recibido el ${año}-${mes}-${dia}`);

      const adjuntos = mensaje.getAttachments();
      adjuntos.forEach(archivo => {
        if (archivo.getContentType() === "application/pdf") {
          try {
            const archivosExistentes = carpetaDia.getFilesByName(archivo.getName());
            if (archivosExistentes.hasNext()) {
              Logger.log(`Ya existe: ${archivo.getName()} en ${año}/${mes}/${dia}`);
            } else {
              carpetaDia.createFile(archivo);
              totalPDFsGuardados++;
              Logger.log(`Guardado: ${archivo.getName()} en ${año}/${mes}/${dia}`);
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

  Logger.log(`Proceso completado. Total de PDFs guardados: ${totalPDFsGuardados}`);
}
