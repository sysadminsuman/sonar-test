import crypto from "crypto";
//  Get random numbers any length
export const getRandomNumbers = (min, max) => {
  let range = max - min;
  let randomValue = 0;
  while (randomValue >= range || randomValue === 0) {
    randomValue = crypto.randomInt(range) + min;
  }
  return randomValue;
};

export const generateRandomPassword=(length)=> {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const specialCharacters = '!@#$%^&*()_+-=';
  const allCharacters = characters + specialCharacters;
  const randomBytes = crypto.randomBytes(length);
  let password = '';

  for (let i = 0; i < randomBytes.length; i++) {
    const randomIndex = randomBytes.readUInt8(i) % allCharacters.length;
    password += allCharacters[randomIndex];
  }

  return password;

};
