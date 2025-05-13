const clearAuthCookies = (
  res,
  tokens = [userToken, businessToken, adminToken]
) => {
  tokens.forEach((tokenName) => {
    res.clearCookie(tokenName, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
  });
};

module.exports = clearAuthCookies;
