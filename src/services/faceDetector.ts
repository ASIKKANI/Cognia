import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

class FaceLandmarkService {
    private landmarker: FaceLandmarker | null = null;
    private isLoading = false;

    async init() {
        if (this.landmarker || this.isLoading) return;
        this.isLoading = true;
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
            this.landmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numFaces: 1,
                outputFaceBlendshapes: true
            });
            console.log('Face Landmarker loaded successfully');
        } catch (error) {
            console.error('Failed to load face landmarker:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async detect(videoElement: HTMLVideoElement): Promise<FaceLandmarkerResult | null> {
        if (!this.landmarker) {
            await this.init();
        }
        if (!this.landmarker) return null;

        try {
            const result = this.landmarker.detectForVideo(videoElement, performance.now());
            return result;
        } catch (error) {
            console.error('Face detection error:', error);
            return null;
        }
    }

    // Rule: eye openness < 5%
    // Simplified eye openness using landmarks: Distance between upper and lower lids
    getEyeOpenness(landmarks: any[]): number {
        if (!landmarks || landmarks.length === 0) return 1;

        // Use indexes for left and right eye lids
        // Left eye: 159 (upper), 145 (lower)
        // Right eye: 386 (upper), 374 (lower)
        const getDist = (p1: any, p2: any) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

        const leftOpenness = getDist(landmarks[159], landmarks[145]);
        const rightOpenness = getDist(landmarks[386], landmarks[374]);

        // Normalize based on eye width (roughly)
        const leftWidth = getDist(landmarks[33], landmarks[133]);
        const rightWidth = getDist(landmarks[263], landmarks[362]);

        const avg = ((leftOpenness / leftWidth) + (rightOpenness / rightWidth)) / 2;
        // Typical open eye ratio is ~0.2-0.3. 0.05 (5%) is very closed.
        // We'll return a raw percentage-like value where ~0.1 is 10%
        return avg;
    }

    // Rule: lips downarc
    // Lips corners (61, 291) vs upper/lower lip centers (13, 14)
    getLipArc(landmarks: any[]): 'downarc' | 'uparc' | 'neutral' {
        if (!landmarks || landmarks.length === 0) return 'neutral';

        const cornersY = (landmarks[61].y + landmarks[291].y) / 2;
        const centersY = (landmarks[13].y + landmarks[14].y) / 2;

        const diff = cornersY - centersY;

        if (diff > 0.005) return 'downarc'; // Corners are below centers
        if (diff < -0.005) return 'uparc';
        return 'neutral';
    }

    cropFace(canvas: HTMLCanvasElement, result: FaceLandmarkerResult): HTMLCanvasElement | null {
        if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;

        const landmarks = result.faceLandmarks[0];
        let minX = 1, minY = 1, maxX = 0, maxY = 0;

        landmarks.forEach(p => {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        });

        const originX = minX * canvas.width;
        const originY = minY * canvas.height;
        const width = (maxX - minX) * canvas.width;
        const height = (maxY - minY) * canvas.height;

        // Add 25% padding
        const padding = 0.25;
        const px = width * padding;
        const py = height * padding;

        const cropX = Math.max(0, originX - px);
        const cropY = Math.max(0, originY - py);
        const cropW = Math.min(canvas.width - cropX, width + px * 2);
        const cropH = Math.min(canvas.height - cropY, height + py * 2);

        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = 224;
        faceCanvas.height = 224;
        const ctx = faceCanvas.getContext('2d');

        if (ctx) {
            ctx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, 224, 224);
            return faceCanvas;
        }
        return null;
    }
}

export const faceDetector = new FaceLandmarkService();
