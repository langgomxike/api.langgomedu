import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Đường dẫn đến thư mục uploads
const uploadsBaseDir = path.join(__dirname, '../../public/uploads');

// Tạo thư mục uploads nếu nó không tồn tại
if (!fs.existsSync(uploadsBaseDir)) {
    fs.mkdirSync(uploadsBaseDir, { recursive: true });
}

// Hàm để tạo storage cho upload
const createStorage = (subfolder) => {
    const folderPath = path.join(uploadsBaseDir, subfolder);

    return multer.diskStorage({
        destination: (req, file, cb) => {
            // Tạo thư mục nếu chưa có
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
            cb(null, folderPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = uuidv4();
            const fileExtension = path.extname(file.originalname);
            cb(null, `${uniqueSuffix}${fileExtension}`);
        }
    });
};

// Thiết lập cấu hình chung cho các tùy chọn multer
const multerOptions = {
    // Giới hạn kích thước file tối đa là 5MB
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB

    // Lọc loại file hợp lệ
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg' ,'image/png', 'image/gif', 'application/pdf'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true); // Cho phép file
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'));
        }
    }
};

// Tạo các multer instances với cấu hình riêng cho từng loại thư mục
export const uploadPayment = multer({ storage: createStorage('payments'), ...multerOptions });
export const uploadAvatar = multer({ storage: createStorage('avatars'), ...multerOptions });
export const uploadReports = multer({storage: createStorage('reports'),...multerOptions,}); 