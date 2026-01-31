import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import type { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import axios from 'axios';

@Controller()
export class VisionController {
  @Post('vision')
  @UseInterceptors(FileInterceptor('image', {
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/tiff'];
      if (allowed.includes(file.mimetype)) cb(null, true);
      else cb(new Error('Unsupported file type'), false);
    }
  }))
  async vision(
    @UploadedFile() file: Express.Multer.File,
    @Body('prompt') prompt: string = 'Describe this image.',
    @Body('model') model: string = 'qwen3-vl'
  ) {
    if (!file) return { error: 'No image uploaded.' };
    const base64 = file.buffer.toString('base64');

    try {
      const response = await axios.post('http://localhost:11434/api/generate', {
        model,
        prompt,
        images: [base64],
        stream: false
      }, { headers: { 'Content-Type': 'application/json' } });

      const data = response.data;
      const respText = typeof data?.response === 'string' ? data.response : JSON.stringify(data);
      return { response: respText };
    } catch (err: any) {
      return { error: err?.message || 'Unknown error' };
    }
  }
}
