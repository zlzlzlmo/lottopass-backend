export const decodeCustom = (text: string) => {
  return text.replace(/&&#35;40;/g, '(').replace(/&&#35;41;/g, ')');
};
