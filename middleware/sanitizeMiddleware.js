const DOMPurify = require('dompurify');

const sanitizeMiddleware = (req, res, next) => {
  // ตรวจสอบว่ามีข้อมูล body ที่ส่งมาหรือไม่
  if (req.body) {
    // ล้างและป้องกัน XSS ของข้อมูล body โดยใช้ DOMPurify
    for (const key in req.body) {
      if (Object.hasOwnProperty.call(req.body, key)) {
        req.body[key] = DOMPurify.sanitize(req.body[key]);
      }
    }
  }
  next();
};

module.exports = sanitizeMiddleware;