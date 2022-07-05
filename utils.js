export const getFileNameFromPath = filePath => {
  const split = filePath.split('/');
  return split[split.length - 1].replace(/\./g, '-');
};
