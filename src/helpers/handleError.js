const handleInternalServerError = (res, error) => {
  console.log("Error: ", error);
  return res.status(500).json({
    ok: false,
    msg: "Contacte al administrador",
  });
};

const handleErrorResponse = (res, msg = "Error", code = 401) => {
  console.log("Error: ", msg);
  return res.status(code).json({
    ok: false,
    msg,
  });
};

module.exports = { handleInternalServerError, handleErrorResponse };
