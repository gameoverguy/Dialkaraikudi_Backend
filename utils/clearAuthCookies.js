const clearAuthCookies = (
  res,
  tokens = ["userToken", "businessToken", "adminToken"]
) => {
  res.clearCookie(userToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
};

module.exports = clearAuthCookies;
