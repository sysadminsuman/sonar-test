import axios from "axios";

export const verifyTokenByclient = async (token_qa) => {
  const apiUrl = "https://gw.hanatour.com/accounts/auth/token/check?type=OPENCHAT";

  const acess_token = token_qa;

  let data = {};
  data.token = acess_token;

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: apiUrl,
    headers: { "Content-Type": "application/json", "X-AUTH-TOKEN": "ksqEk8TOidgZsL5A" },
    data: data,
  };

  let resp = await axios
    .request(config)
    .then((response) => {
      //console.log("Response:", response.data);
      if (response.data.data.success == true) {
        return true;
      }
    })
    .catch((error) => {
      //console.error("Error:", error);
      return false;
    });

  return resp;
};
