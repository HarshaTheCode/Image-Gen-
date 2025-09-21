import { GoogleGenAI, Modality } from "@google/genai";
import { ImageState, AspectRatio } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Step 1: Analyze the reference image and generate a detailed text prompt that
 * captures its style, lighting, composition, and mood.
 */
async function generatePromptFromReferenceImage(referenceImage: ImageState): Promise<string> {
    const model = 'gemini-2.5-flash';

    const referenceImagePart = {
        inlineData: {
            data: referenceImage.base64,
            mimeType: referenceImage.file.type,
        },
    };

    const textPart = {
        text: `**SYSTEM PROMPT: AI IMAGE PROMPT ENGINEER**

**ROLE:** You are a world-class prompt engineer for a powerful text-to-image AI model. Your sole purpose is to analyze a given image and generate a highly detailed, one-shot "master prompt" that can be used to recreate that image's exact visual aesthetic, especially the subject's pose.

**OBJECTIVE:** Analyze the provided reference image and deconstruct its visual elements into a comprehensive text prompt. The prompt should be so detailed that another AI could use it to generate a nearly identical image in terms of style, lighting, composition, mood, and **pose**, even with a different subject.

**OUTPUT FORMAT:**
- Output only the prompt text. Do not include any other conversational text, headers, or explanations.
- Use descriptive keywords and phrases, separated by commas.
- Structure the prompt logically, covering key aspects like style, subject, setting, lighting, camera details, and color grading.

**ANALYSIS CHECKLIST (Consider these elements):**
- **Overall Style:** Is it photorealistic, cinematic, vintage, hyperrealistic, fantasy, oil painting?
- **Pose & Body Language (EXTREMELY IMPORTANT):** This is the most critical part. Describe the pose with forensic detail.
  - **Head:** What is the exact angle of the head? Tilted left, right, up, down? (e.g., "head slightly tilted to the left").
  - **Gaze:** Where is the subject looking? (e.g., "gazing directly at the camera", "looking off-camera to the right").
  - **Shoulders & Torso:** How are the shoulders and torso oriented relative to the camera? (e.g., "shoulders angled 45 degrees away from the camera", "torso turned to the side").
  - **Expression:** Describe the facial expression in detail. (e.g., "a subtle, enigmatic smile", "a serious, thoughtful expression").
- **Subject Details:** Describe the subject's apparent gender and clothing style. (e.g., "a woman wearing a vintage leather jacket").
- **Composition:** How is the shot framed? (e.g., "medium close-up shot", "rule of thirds", "centered composition").
- **Lighting:** Describe the light source, quality, and direction. (e.g., "dramatic side lighting from a single window", "soft, diffused morning light", "rim lighting", "Rembrandt lighting").
- **Environment/Background:** What is the setting? (e.g., "in a dimly lit library", "bokeh background of city lights at night", "minimalist studio background").
- **Camera & Lens:** What kind of camera setup would produce this look? (e.g., "shot on a DSLR with a 85mm f/1.4 lens", "shallow depth of field", "anamorphic lens flare", "35mm film grain").
- **Color Grading & Mood:** What is the color palette and overall feeling? (e.g., "moody and atmospheric", "warm, desaturated cinematic color grade", "vibrant and energetic", "cool blue and teal tones").

**EXAMPLE OUTPUT (for a hypothetical image):**
*photorealistic portrait, a man with a thoughtful expression, head slightly tilted down, gazing off-camera to the left, shoulders angled away from camera, medium close-up shot, dramatic Rembrandt lighting from the side, dark and moody atmosphere, deep shadows, shot on a Sony A7III with an 85mm f/1.8 lens, shallow depth of field, sharp focus on the eyes, minimalist dark background, cinematic color grade with desaturated tones, subtle film grain.*

Now, analyze the user's image and generate the prompt.`
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [referenceImagePart, textPart] },
        config: {
            temperature: 0.2,
        },
    });

    return response.text.trim();
}


/**
 * Orchestrates the full two-step image generation process.
 */
export async function generateImage(referenceImage: ImageState, userImage: ImageState, aspectRatio: AspectRatio): Promise<string | null> {
    try {
        // Step 1: Generate a detailed prompt from the reference image.
        console.log("Step 1: Generating detailed prompt from reference image...");
        const detailedPrompt = await generatePromptFromReferenceImage(referenceImage);
        console.log("Generated Prompt:", detailedPrompt);

        // Step 2: Use the generated prompt and user image to create the final portrait.
        console.log("Step 2: Generating final image with user photo and detailed prompt...");
        const model = 'gemini-2.5-flash-image-preview';

        const userImagePart = {
            inlineData: {
                data: userImage.base64,
                mimeType: userImage.file.type,
            },
        };

        const textPart = {
            text: `Your task is to create a new, single, photorealistic portrait.

**Subject:** The subject is the person in the provided user image. You must create an unmistakable, high-fidelity likeness of this person, preserving all their key facial features. Integrate them seamlessly into the new scene. Do not create a 'cut-and-paste' look.

**Instructions:** The new portrait's entire visual aesthetic—style, mood, lighting, composition, and color—is defined by the following creative brief. Follow it exactly.

**Creative Brief:**
${detailedPrompt}

**Critical Requirement - Pose:** The subject's pose in the new portrait (head tilt, shoulder angle, gaze) MUST precisely match the pose described in the Creative Brief. This is the most important instruction.

**Output Format:**
- The image must have a ${aspectRatio} aspect ratio.
- The image must be high-quality, sharp, clear, and free of any watermarks, text, or artifacts.`,
        };
        
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [userImagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData && part.inlineData.data) {
                return part.inlineData.data;
            }
        }
        
        console.warn("Gemini API did not return an image part in the final step.", response);
        const textResponse = response.text?.trim();
        if (textResponse) {
             throw new Error(`The AI failed to generate an image. Reason: ${textResponse}`);
        }
        return null;

    } catch (error) {
        console.error("Error during the two-step image generation process:", error);
        if (error instanceof Error) {
            // The error message from the SDK might be a JSON string, so we'll try to parse it for cleaner logging.
            try {
                const parsedError = JSON.parse(error.message);
                throw new Error(`Gemini API Error: ${parsedError.error?.message || error.message}`);
            } catch (e) {
                throw new Error(`Gemini API Error: ${error.message}`);
            }
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
}