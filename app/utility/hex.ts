const toNumber = (hexStr: string) => {
  const removeLeadingNewLine = (str: string) => str.replace(/^(0A)/, "");
  const removedTailingNulls = (str: string) => str.replace(/0+$/, "");
  const ascii = removeLeadingNewLine(removedTailingNulls(hexStr))
    .match(/.{2,2}/g)
    ?.map((byte) => String.fromCharCode(parseInt(byte, 16)))
    .join("");
  return Number(ascii);
};

const toHex = (string: string) =>
  string
    .split("")
    .map((ch) => ch.charCodeAt(0).toString(16))
    .join("");

export { toHex, toNumber };
