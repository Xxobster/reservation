const regularExpressions = {
  name: {
    regex: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,40}$/,
    msg: "Invalid name!",
  },
  phone: {
    regex: /^\+?[1-9][0-9]{5,18}$/,
    msg: "Invalid phone number!",
  },
};

module.exports = regularExpressions;
