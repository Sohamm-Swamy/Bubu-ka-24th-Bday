// Photo capture and download utilities

// Convert dataURL to blob
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Download memory + photos as HTML file (viewable in browser)
export async function downloadMemoryWithPhoto(
  memoryText: string,
  finalPhoto: string | null,
  locationPhotos: string[] = []
): Promise<void> {
  // Fixed date - Bubu's birthday!
  const timestamp = "11th May 2026";

  // Detect current theme from localStorage
  const theme = localStorage.getItem('bubu_rapido_theme');
  const isDark = theme === 'dark';

  // Theme colors
  const colors = isDark
    ? {
      // Dark mode - Midnight Blue
      background: '#0D1B2A',
      surface: '#1B2838',
      primary: '#64B5F6',
      textPrimary: '#E3F2FD',
      textSecondary: '#90A4AE',
      gold: '#FFD54F',
    }
    : {
      // Light mode - Light Blue
      background: '#E3F2FD',
      surface: '#FFFFFF',
      primary: '#1976D2',
      textPrimary: '#1A237E',
      textSecondary: '#546E7A',
      gold: '#FFD700',
    };

  // Build HTML for all location photos
  let photosHtml = '';
  const locationNames = ['Fun Art at Upvan Lake', 'Lake Shore Fun Spree', 'Dine and Unwind'];

  locationPhotos.forEach((photo, index) => {
    if (photo) {
      photosHtml += `
        <div style="margin: 15px 0; padding: 10px; background: ${isDark ? '#1B2838' : '#f5f5f5'}; border-radius: 10px;">
          <p style="color: ${colors.textSecondary}; font-size: 14px; margin-bottom: 8px;">📍 ${locationNames[index] || `Location ${index + 1}`}</p>
          <img src="${photo}" alt="Adventure ${index + 1}" style="max-width: 100%; border-radius: 8px;" />
        </div>`;
    }
  });

  // Final photo
  const finalPhotoHtml = finalPhoto
    ? `<div style="margin: 20px 0; padding: 10px; background: ${isDark ? '#1B2838' : '#f5f5f5'}; border-radius: 10px;">
         <p style="color: ${colors.textSecondary}; font-size: 14px; margin-bottom: 8px;">💕 Final Memory</p>
         <img src="${finalPhoto}" alt="Final memory" style="max-width: 100%; border-radius: 8px;" />
       </div>`
    : '';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bubu's Birthday Adventure</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Nunito', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: ${colors.background}; }
    .container { background: ${colors.surface}; padding: 30px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    h1 { color: ${colors.primary}; text-align: center; }
    .date { color: ${colors.textSecondary}; text-align: center; font-size: 14px; margin-bottom: 20px; }
    .memory { font-size: 18px; line-height: 1.8; color: ${colors.textPrimary}; white-space: pre-wrap; }
    .footer { margin-top: 30px; text-align: center; color: ${colors.primary}; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎂 Bubu's Birthday Adventure 🎂</h1>
    <p class="date">${timestamp}</p>
    ${photosHtml}
    ${finalPhotoHtml}
    <p class="memory">${memoryText}</p>
    <p class="footer">Made with ❤️ for Bubu</p>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BubuKaBdayReview.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Request camera permission and get stream
export async function getCameraStream(): Promise<MediaStream | null> {
  try {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      console.warn('❌ Not in browser environment');
      return null;
    }

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      console.warn('❌ mediaDevices not available');
      alert('Camera not supported. Make sure you are on HTTPS.');
      return null;
    }

    console.log('📷 Requesting camera permission...');

    // Attempt 1 — back camera preferred
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      console.log('✅ Got camera stream (back camera)');
      return stream;
    } catch (e1: any) {
      console.warn('⚠️ Back camera failed:', e1?.name, e1?.message);
    }

    // Attempt 2 — any camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      console.log('✅ Got camera stream (any camera)');
      return stream;
    } catch (e2: any) {
      console.error('❌ All camera attempts failed:', e2?.name, e2?.message);

      if (e2?.name === 'NotAllowedError') {
        alert('Camera permission denied. Go to browser settings and allow camera for this site.');
      } else if (e2?.name === 'NotFoundError') {
        alert('No camera found on this device.');
      } else if (e2?.name === 'NotReadableError') {
        alert('Camera is being used by another app. Close other apps and try again.');
      } else {
        alert(`Camera error: ${e2?.name} — ${e2?.message}`);
      }

      return null;
    }

  } catch (outerErr: any) {
    console.error('❌ Unexpected camera error:', outerErr);
    return null;
  }
}

// Capture frame from video stream to data URL
export function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }
  return '';
}