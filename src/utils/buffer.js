/**
 * Buffer 工具模块
 * 处理 multer 上传的 Buffer 数据
 */

/**
 * 将 Buffer 转为 Base64 字符串
 * @param {Buffer} buffer - 图片 Buffer
 * @returns {string}
 */
export function bufferToBase64(buffer) {
  return buffer.toString("base64");
}

/**
 * 将 Buffer 转为 data URL 格式
 * @param {Buffer} buffer - 图片 Buffer
 * @param {string} mimetype - MIME 类型
 * @returns {string}
 */
export function bufferToDataUrl(buffer, mimetype = "image/jpeg") {
  const base64 = bufferToBase64(buffer);
  return `data:${mimetype};base64,${base64}`;
}

/**
 * 从图片 Buffer 中读取宽高（不依赖外部库）
 * 支持 JPEG（含 EXIF 朝向修正）和 PNG 格式
 * @param {Buffer} buffer
 * @returns {{ width: number, height: number }}
 */
export function getImageSize(buffer) {
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let rawWidth = 0;
    let rawHeight = 0;
    let orientation = 1; // 默认正常朝向

    let offset = 2;
    while (offset < buffer.length - 1) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];

      // SOF0 / SOF2: 读取原始宽高
      if (marker === 0xc0 || marker === 0xc2) {
        rawHeight = buffer.readUInt16BE(offset + 5);
        rawWidth = buffer.readUInt16BE(offset + 7);
      }

      // APP1: 读取 EXIF Orientation
      if (marker === 0xe1) {
        const exifStart = offset + 4; // 跳过 FF E1 + 长度(2字节)
        // 检查 "Exif\0\0" 标识
        if (
          buffer[exifStart] === 0x45 && // E
          buffer[exifStart + 1] === 0x78 && // x
          buffer[exifStart + 2] === 0x69 && // i
          buffer[exifStart + 3] === 0x66 // f
        ) {
          const tiffStart = exifStart + 6;
          const isBigEndian = buffer[tiffStart] === 0x4d; // 'M'
          const read16 = (pos) =>
            isBigEndian ? buffer.readUInt16BE(pos) : buffer.readUInt16LE(pos);

          const ifdOffset = isBigEndian
            ? buffer.readUInt32BE(tiffStart + 4)
            : buffer.readUInt32LE(tiffStart + 4);

          let ifdPos = tiffStart + ifdOffset;
          if (ifdPos < buffer.length - 2) {
            const entryCount = read16(ifdPos);
            ifdPos += 2;
            for (let i = 0; i < entryCount && ifdPos + 12 <= buffer.length; i++) {
              const tag = read16(ifdPos);
              if (tag === 0x0112) {
                orientation = read16(ifdPos + 8);
                break;
              }
              ifdPos += 12;
            }
          }
        }
      }

      // 标记为无数据的，直接跳过 4 字节；有数据的按长度跳
      const skip = 2 + buffer.readUInt16BE(offset + 2);
      offset += skip;
    }

    if (rawWidth && rawHeight) {
      // EXIF 朝向 6(90°顺) 或 8(90°逆) 时交换宽高
      if (orientation === 6 || orientation === 8) {
        return { width: rawHeight, height: rawWidth };
      }
      return { width: rawWidth, height: rawHeight };
    }
  }

  // PNG: IHDR chunk at offset 16 (width at 16, height at 20, both 4 bytes)
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  // 其他格式回退到 1:1
  return { width: 1024, height: 1024 };
}
