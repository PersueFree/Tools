export const bulkGenerateSecureStrings = (
  length: number = 15,
  count: number = 1,
  prefix?: string,
  type: number = 0,
) => {
  const strset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const numset = "0123456789";
  const charset = type === 0 ? `${strset}${numset}` : (type === 1 ? strset : numset);
  const charsetLength = charset.length;
  const totalValues = count * length;

  const randomValues = new Uint32Array(totalValues);
  crypto.getRandomValues(randomValues);

  if (count === 1) {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charsetLength];
    }
    return prefix + result;
  }

  const results = [];
  for (let i = 0; i < count; i++) {
    let str = "";
    const offset = i * length;
    for (let j = 0; j < length; j++) {
      str += charset[randomValues[offset + j] % charsetLength];
    }
    results.push(prefix + str);
  }
  return results;
};
