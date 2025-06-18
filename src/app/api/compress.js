import formidable from "formidable";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const form = new formidable.IncomingForm({
    uploadDir: tempDir,
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: "File upload failed" });
    }
    const compressionLevel = fields.compressionLevel || "recommended";
    const file = files.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const inputPath = file.filepath || file.path;
    const outputPath = path.join(
      tempDir,
      `compressed-${file.originalFilename || file.name}`
    );

    let compressionCommand;
    switch (compressionLevel) {
      case "extreme":
        compressionCommand = `pikepdf --optimize extreme "${inputPath}" "${outputPath}"`;
        break;
      case "recommended":
        compressionCommand = `pikepdf --optimize recommended "${inputPath}" "${outputPath}"`;
        break;
      case "low":
        compressionCommand = `pikepdf --optimize low "${inputPath}" "${outputPath}"`;
        break;
      default:
        compressionCommand = `pikepdf --optimize recommended "${inputPath}" "${outputPath}"`;
    }

    exec(compressionCommand, (error) => {
      if (error) {
        return res.status(500).json({ message: "Compression failed" });
      }
      const originalSize = fs.statSync(inputPath).size;
      const compressedSize = fs.statSync(outputPath).size;
      const compressionPercentage = Math.round(
        ((originalSize - compressedSize) / originalSize) * 100
      );
      // Serve the file as a download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=compressed-${file.originalFilename || file.name}`
      );
      const fileStream = fs.createReadStream(outputPath);
      fileStream.pipe(res);
    });
  });
}
