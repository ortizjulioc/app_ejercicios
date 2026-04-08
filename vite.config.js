import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Middleware para manejar la subida de imágenes y guardarlas en public/uploads
const localUploadPlugin = () => {
  return {
    name: 'local-upload',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/upload' && req.method === 'POST') {
          const chunks = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', () => {
             try {
                const body = Buffer.concat(chunks).toString();
                const data = JSON.parse(body);
                
                if (data.image) {
                  // data.image is a base64 string "data:image/png;base64,....."
                  const match = data.image.match(/^data:image\/(\w+);base64,/);
                  if (!match) throw new Error("Invalid image format");
                  
                  const ext = match[1];
                  const base64Data = data.image.replace(/^data:image\/\w+;base64,/, "");
                  
                  const filename = `img_${Date.now()}.${ext}`;
                  
                  // Guardar en la carpeta public/uploads
                  const uploadDir = path.resolve(process.cwd(), 'public/uploads');
                  if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                  }
                  
                  const filepath = path.join(uploadDir, filename);
                  fs.writeFileSync(filepath, base64Data, 'base64');
                  
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, url: `/uploads/${filename}` }));
                } else if (data.delete) {
                  // Opcional: borrar la imagen
                  const filename = path.basename(data.delete);
                  const filepath = path.resolve(process.cwd(), 'public/uploads', filename);
                  if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                  }
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true }));
                }
             } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
             }
          });
          return;
        }
        next();
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localUploadPlugin()],
})
