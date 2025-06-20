// middleware/requestContext.js
module.exports = (req, res, next) => {
  req.requestContext = {
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    userAgent: req.headers["user-agent"],
    request: {
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
    },
  };
  next();
};
