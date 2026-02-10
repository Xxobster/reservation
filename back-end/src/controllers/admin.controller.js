const { spawn } = require("child_process");
const path = require("path");

const restartBackendHandler = async (req, res) => {
  const rootDir = path.resolve(__dirname, "../../..");
  const scriptPath = path.join(rootDir, "restart-backend.sh");

  const child = spawn("bash", [scriptPath], {
    cwd: rootDir,
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  res.status(200).json({
    success: true,
    message: "Backend restart triggered. The server will restart in a few seconds.",
  });
};

module.exports = { restartBackendHandler };
