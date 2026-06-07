/**
 * 图片工具模块
 * 图片读取、转换、格式验证等通用工具函数
 */

import * as fs from "fs";
import * as path from "path";

const SUPPORTED_FORMATS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

/**
 * 将本地图片文件转换为 Base64 编码字符串
 * @param {string} imagePath - 图片文件路径
 * @returns {string} Base64 编码的图片数据
 */
export function imageToBase64(imagePath) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`图片文件不存在: ${imagePath}`);
  }

  const ext = path.extname(imagePath).toLowerCase();
  if (!SUPPORTED_FORMATS.includes(ext)) {
    throw new Error(
      `不支持的图片格式: ${ext}，支持: ${SUPPORTED_FORMATS.join(", ")}`
    );
  }

  return fs.readFileSync(imagePath).toString("base64");
}

/**
 * 获取图片的 MIME 类型
 * @param {string} imagePath - 图片文件路径
 * @returns {string} MIME 类型
 */
export function getMimeType(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const mimeMap = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return mimeMap[ext] || "image/jpeg";
}

/**
 * 将 Base64 图片包装为 API 可用的 data URL 格式
 * @param {string} imagePath - 图片文件路径
 * @returns {string} data:image/xxx;base64,xxx 格式的 URL
 */
export function imageToDataUrl(imagePath) {
  const base64 = imageToBase64(imagePath);
  const mimeType = getMimeType(imagePath);
  return `data:${mimeType};base64,${base64}`;
}
