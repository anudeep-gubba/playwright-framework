import fs from "fs";
import { ENV } from "./envLoader";

async function globalSetup() {
  console.log("\n=====================================");
  console.log(" PLAYWRIGHT FRAMEWORK");
  console.log("=====================================\n");
  console.log("BASE URL:", ENV.BASE_URL);

  const folders = ["logs", "test-results", "allure-results"];

  folders.forEach((folder) => {
    fs.mkdirSync(folder, { recursive: true });
  });
}

export default globalSetup;
