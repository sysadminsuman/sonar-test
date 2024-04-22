// get random defaults user images
export const getRandomUserImage = async (a) => {
  switch (a) {
    case 1:
      return "/profileimages/profile-01.png";
    case 2:
      return "/profileimages/profile-02.png";
    case 3:
      return "/profileimages/profile-03.png";
    case 4:
      return "/profileimages/profile-04.png";
    default:
      return "/profileimages/profile-01.png";
  }
};
