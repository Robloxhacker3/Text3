import { exec } from "child_process";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { ipa, p12, mobileprovision, password } = req.body;

  try {
    // Save uploaded files to the temporary directory
    fs.writeFileSync("/tmp/app.ipa", ipa);
    fs.writeFileSync("/tmp/devcert.p12", p12);
    fs.writeFileSync("/tmp/profile.mobileprovision", mobileprovision);

    // Run the Zsign command
    const command = `zsign -k /tmp/devcert.p12 -p ${password} -m /tmp/profile.mobileprovision -o /tmp/signed-app.ipa /tmp/app.ipa`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        return res.status(500).json({ error: stderr || error.message });
      }
      res.status(200).json({ message: "IPA signed successfully!", output: stdout });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
