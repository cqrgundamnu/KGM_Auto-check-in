import fs from "node:fs";
import { close_api, delay, send, startService } from "./utils/utils.js";
import { hasSecretWriteToken, setRepoSecret } from "./utils/githubSecrets.js";

async function generate() {
  const api = startService();
  await delay(2000);
  try {
    const result = await send("/login/qr/key?timestrap=" + Date.now(), "GET", {});
    if (result.status !== 1) throw new Error("二维码生成失败");
    if (!hasSecretWriteToken()) throw new Error("未配置 PAT");
    const image = result.data.qrcode_img.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync("qrcode.png", Buffer.from(image, "base64"));
    setRepoSecret("QRKEY", result.data.qrcode);
    console.log("二维码已生成，请下载本次运行的 qrcode artifact 后扫码。");
  } finally {
    close_api(api);
  }  if (api.killed) {
    process.exit(0);
  }
}

generate();
