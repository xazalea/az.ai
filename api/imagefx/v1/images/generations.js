import { ImageFX } from '../../packages/imageFX-api/dist/index.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Google Cookie in Authorization header (Bearer <cookie>)' });
  }

  const cookie = authHeader.substring(7); // Extract cookie from Bearer token
  if (!cookie) {
      return res.status(400).json({ error: 'Bad Request: Cookie is empty' });
  }

  const { prompt, n = 1, size = "1024x1024", model = "dall-e-3" } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  // Map OpenAI size to ImageFX aspect ratio
  let aspectRatio = "IMAGE_ASPECT_RATIO_SQUARE";
  if (size.includes("1024x1792") || size.includes("portrait")) {
      aspectRatio = "IMAGE_ASPECT_RATIO_PORTRAIT";
  } else if (size.includes("1792x1024") || size.includes("landscape")) {
      aspectRatio = "IMAGE_ASPECT_RATIO_LANDSCAPE";
  }

  // Map OpenAI model to ImageFX model (optional, ImageFX has specific models)
  // Defaulting to IMAGEN_3_5 (fastest/best available often)
  let generationModel = "IMAGEN_3_5";
  if (model.includes("imagen-3")) generationModel = "IMAGEN_3";


  try {
    const fx = new ImageFX(cookie);
    
    // Create Prompt object structure expected by ImageFX API
    const promptObj = {
        prompt: prompt,
        numberOfImages: Math.min(n, 4), // ImageFX usually limits batch size
        aspectRatio: aspectRatio,
        generationModel: generationModel
    };

    const images = await fx.generateImage(promptObj);

    // Transform to OpenAI response format
    const data = images.map(img => {
        return {
            b64_json: img.encodedImage, 
            url: `data:image/png;base64,${img.encodedImage}`, 
            revised_prompt: img.prompt
        };
    });

    return res.status(200).json({
      created: Math.floor(Date.now() / 1000),
      data: data
    });

  } catch (error) {
    console.error("ImageFX Error:", error);
    return res.status(500).json({ 
        error: 'Image generation failed', 
        details: error.message 
    });
  }
}
