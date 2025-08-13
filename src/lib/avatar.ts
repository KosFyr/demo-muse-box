import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 512;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);
  return { width, height };
}

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    const { width, height } = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image resized to: ${width}x${height}`);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');
    
    console.log('Processing with segmentation model...');
    const result = await segmenter(imageData);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    outputCtx.drawImage(canvas, 0, 0);
    
    const outputImageData = outputCtx.getImageData(0, 0, width, height);
    const data = outputImageData.data;
    
    // Apply inverted mask to alpha channel
    for (let i = 0; i < result[0].mask.data.length; i++) {
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('Mask applied successfully');
    
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const cropFaceFromImage = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Enhanced face detection area - focus on upper portion for better face capture
    const faceAreaRatio = 0.7; // Use 70% of the image focusing on the center-top area
    const size = Math.min(imageElement.naturalWidth, imageElement.naturalHeight) * faceAreaRatio;
    const bigHeadSize = 120; // Larger size for big head effect
    
    canvas.width = bigHeadSize;
    canvas.height = bigHeadSize;
    
    // Center-top crop for better face positioning
    const sx = (imageElement.naturalWidth - size) / 2;
    const sy = Math.max(0, (imageElement.naturalHeight - size) / 3); // Focus on upper third
    
    ctx.drawImage(imageElement, sx, sy, size, size, 0, 0, bigHeadSize, bigHeadSize);
    
    // Add slight circular mask for better integration with stick figure
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(bigHeadSize / 2, bigHeadSize / 2, bigHeadSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create cropped image'));
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error cropping face:', error);
    throw error;
  }
};

export const processAvatarImage = async (file: File): Promise<Blob> => {
  try {
    console.log('Starting avatar processing...');
    
    // Step 1: Load the image
    const imageElement = await loadImage(file);
    console.log('Image loaded successfully');
    
    // Step 2: Remove background
    console.log('Removing background...');
    const backgroundRemovedBlob = await removeBackground(imageElement);
    
    // Step 3: Load the background-removed image
    const backgroundRemovedImage = await loadImage(backgroundRemovedBlob);
    console.log('Background removed successfully');
    
    // Step 4: Crop and resize for big head effect
    console.log('Cropping face for big head...');
    const finalBlob = await cropFaceFromImage(backgroundRemovedImage);
    
    console.log('Avatar processing completed successfully');
    return finalBlob;
  } catch (error) {
    console.error('Error in avatar processing pipeline:', error);
    // Fallback: just crop the original image if background removal fails
    console.log('Falling back to simple face crop...');
    const imageElement = await loadImage(file);
    return await cropFaceFromImage(imageElement);
  }
};