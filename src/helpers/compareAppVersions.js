// check the app version
export const compareAppVersions = async (version1, version2) => {
  const v1 = version1.split(".").map(Number);
  const v2 = version2.split(".").map(Number);
  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;
    if (num1 < num2) {
      return -1;
    } else if (num1 > num2) {
      return 1;
    }
  }
  return 0; // Both versions are equal
};
