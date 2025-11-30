export function cleanModelName(modelName) {
  if (!modelName) return '';

  if (typeof modelName === 'string' && modelName.startsWith('models/')) {
    return modelName.replace('models/', '');
  }

  return modelName;
}

export function getDefaultModel() {
  return 'gemini-2.5-flash-preview-09-2025';
}

export function getValidModelName(modelName) {
  const cleaned = cleanModelName(modelName);
  return cleaned || getDefaultModel();
}




