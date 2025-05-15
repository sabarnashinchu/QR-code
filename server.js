const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const Jimp = require('jimp');
const QrCode = require('qrcode-reader');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Generate QR Code
app.post('/generate-qr', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const qrCode = await QRCode.toDataURL(text);
        res.json({ qrCode });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

// Decode QR Code
app.post('/decode-qr', upload.single('qrImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const image = await Jimp.read(req.file.buffer);
        const qrCodeInstance = new QrCode();

        const value = await new Promise((resolve, reject) => {
            qrCodeInstance.callback = (err, value) => {
                if (err) reject(err);
                resolve(value);
            };
            qrCodeInstance.decode(image.bitmap);
        });

        if (value && value.result) {
            res.json({ text: value.result });
        } else {
            res.status(400).json({ error: 'Could not decode QR code' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to decode QR code' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 