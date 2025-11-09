const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Attendance = await ethers.getContractFactory("Attendance");
  const contract = await Attendance.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Attendance deployed to:", address);

  // Grab ABI from artifacts
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "Attendance.sol", "Attendance.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const out = {
    address,
    abi: artifact.abi
  };

  // write to backend/contract.json
  const backendPath = path.join(__dirname, "..", "..", "backend", "contract.json");
  fs.writeFileSync(backendPath, JSON.stringify(out, null, 2));
  console.log("Wrote ABI+address to", backendPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
