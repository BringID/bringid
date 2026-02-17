import configs from '../configs'

function defineApiUrl() {
  try {
    return configs.ZUPLO_API_URL || '';
  } catch (err) {
    console.error('[BringID] Failed to define API URL:', err)
    return '';
  }
}

export default defineApiUrl;
