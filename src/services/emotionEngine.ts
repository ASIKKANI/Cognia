import { pipeline, env } from '@huggingface/transformers';
import type { EmotionResult } from '../types';

// Allow local models if needed, but here we use Hugging Face Hub
env.allowLocalModels = false;

class EmotionEngine {
    private classifier: any = null;
    private isLoading = false;

    async init() {
        if (this.classifier || this.isLoading) return;
        this.isLoading = true;
        try {
            console.log('Loading emotion detection model...');
            this.classifier = await pipeline('image-classification', 'Xenova/facial_emotions_image_detection', {
                device: 'webgpu', // Try WebGPU first
            }).catch(async () => {
                console.warn('WebGPU failed, falling back to WASM');
                return await pipeline('image-classification', 'Xenova/facial_emotions_image_detection');
            });
            console.log('Model loaded successfully');
        } catch (error) {
            console.error('Failed to load emotion model:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async predict(imageSource: HTMLCanvasElement | string): Promise<EmotionResult[]> {
        if (!this.classifier) {
            await this.init();
        }
        if (!this.classifier) return [];

        try {
            const results = await this.classifier(imageSource);
            return results.map((res: any) => {
                const label = res.label.toLowerCase() as any;
                // Add sensitivity bias for subtle emotions like 'sad'
                const score = label === 'sad' ? res.score * 1.2 : res.score;
                return { label, score };
            });
        } catch (error) {
            console.error('Prediction error:', error);
            return [];
        }
    }
}

export const emotionEngine = new EmotionEngine();
