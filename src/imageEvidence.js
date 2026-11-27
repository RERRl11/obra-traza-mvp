const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = 350_000;
const MAX_IMAGE_DIMENSION = 1280;

export function prepareImageEvidence(file) {
  if (!file || !file.type.startsWith('image/')) {
    return Promise.reject(new Error('Selecciona un archivo de imagen válido.'));
  }
  if (file.size > MAX_SOURCE_BYTES) {
    return Promise.reject(new Error('La foto supera el límite de 15 MB.'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la foto seleccionada.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('El archivo seleccionado no se pudo procesar como imagen.'));
      image.onload = () => {
        const scaleToFit = Math.min(1, MAX_IMAGE_DIMENSION / image.width, MAX_IMAGE_DIMENSION / image.height);
        let scale = scaleToFit;
        let quality = 0.82;
        let dataUrl = '';

        for (let attempt = 0; attempt < 8; attempt += 1) {
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext('2d');
          if (!context) {
            reject(new Error('No se pudo preparar la foto en este navegador.'));
            return;
          }
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          if (dataUrl.length <= MAX_DATA_URL_LENGTH) {
            resolve({ nombre: file.name, dataUrl });
            return;
          }
          if (quality > 0.58) {
            quality -= 0.08;
          } else {
            scale *= 0.8;
            quality = 0.68;
          }
        }

        reject(new Error('La foto no se pudo reducir lo suficiente para guardarla localmente.'));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
