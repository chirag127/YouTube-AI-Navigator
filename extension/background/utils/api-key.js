


export async function getApiKey() {
  try {
    const result = await slg('GAK');

    return result.GAK || null;
  } catch (err) {
    console.error('Err:GetApiKey', err);
    return null;
  }
}
