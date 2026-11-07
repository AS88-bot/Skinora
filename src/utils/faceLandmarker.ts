/**
 * MediaPipe Face Landmarker Service
 * Provides real-time 468 facial landmark detection for makeup AR try-on.
 */

// MediaPipe landmark indices for cosmetic applications:
export const LIP_LANDMARKS = {
  // Upper Lip
  upperLipOuter: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
  upperLipInner: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308],

  // Lower Lip
  lowerLipOuter: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
  lowerLipInner: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308],

  // Full lip loop (Outer perimeter)
  lipsOuter: [
    61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
    375, 321, 405, 314, 17, 84, 181, 91, 146, 61
  ],
  // Inner lip loop (Mouth opening fissure to keep teeth unpainted)
  lipsInner: [
    78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308,
    324, 318, 402, 317, 14, 87, 178, 88, 95, 78
  ],

  // Key highlight anchor points
  cupidsBowLeft: 37,
  cupidsBowCenter: 0,
  cupidsBowRight: 267,
  lowerLipCushionLeft: 84,
  lowerLipCushionCenter: 17,
  lowerLipCushionRight: 314,
  mouthLeftCorner: 61,
  mouthRightCorner: 291,
  upperInnerCenter: 13,
  lowerInnerCenter: 14,
};

// Eye contours for clean cutout in foundation masks
export const EYE_LANDMARKS = {
  leftEye: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33],
  rightEye: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398, 362],
};

// Face oval boundary for foundation and facial radiance
export const FACE_OVAL_LANDMARKS = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10
];

// Left & Right cheekbones for highlighter
export const CHEEK_LANDMARKS = {
  leftCheekbone: [116, 123, 50, 205, 207, 214, 100],
  rightCheekbone: [345, 352, 280, 425, 427, 434, 329],
  leftCheekCenter: 116,
  rightCheekCenter: 345,
};

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export type FaceMeshResult = {
  landmarks: NormalizedLandmark[];
  upperLipPath: string;
  lowerLipPath: string;
  fullLipPathWithInnerHole: string;
  faceOvalPath: string;
  foundationMaskPath: string;
  mouthOpenDistance: number;
  leftCheekX: number;
  leftCheekY: number;
  rightCheekX: number;
  rightCheekY: number;
  cupidsBowX: number;
  cupidsBowY: number;
  lowerCushionLeftX: number;
  lowerCushionLeftY: number;
  lowerCushionRightX: number;
  lowerCushionRightY: number;
  toPixelX: (pt: NormalizedLandmark) => number;
  toPixelY: (pt: NormalizedLandmark) => number;
};

let faceLandmarkerInstance: any = null;
let isInitializing = false;
let initPromise: Promise<any> | null = null;

/**
 * Initializes MediaPipe FaceLandmarker with GPU/CPU fallback and CDN wasm
 */
export async function getFaceLandmarker() {
  if (faceLandmarkerInstance) return faceLandmarkerInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      isInitializing = true;
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Attempt GPU first, then fallback cleanly to CPU
      try {
        faceLandmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        });
      } catch {
        faceLandmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        });
      }

      return faceLandmarkerInstance;
    } catch {
      return null;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

/**
 * Processes raw landmark array into ready-to-render SVG paths and cosmetic anchor points
 * Automatically corrects for object-cover camera aspect ratio differences (e.g. 16:9 video in 1:1 container)
 */
export function processLandmarks(
  landmarks: NormalizedLandmark[],
  containerWidth: number,
  containerHeight: number,
  videoWidth?: number,
  videoHeight?: number
): FaceMeshResult {
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  if (videoWidth && videoHeight && videoWidth > 0 && videoHeight > 0) {
    scale = Math.max(containerWidth / videoWidth, containerHeight / videoHeight);
    const renderedWidth = videoWidth * scale;
    const renderedHeight = videoHeight * scale;
    offsetX = (containerWidth - renderedWidth) / 2;
    offsetY = (containerHeight - renderedHeight) / 2;
  }

  const toPxX = (pt: NormalizedLandmark): number => {
    return pt.x * (videoWidth ? videoWidth * scale : containerWidth) + offsetX;
  };

  const toPxY = (pt: NormalizedLandmark): number => {
    return pt.y * (videoHeight ? videoHeight * scale : containerHeight) + offsetY;
  };

  const buildPath = (indices: number[]): string => {
    return (
      indices
        .map((idx, i) => {
          const pt = landmarks[idx];
          if (!pt) return '';
          const px = toPxX(pt).toFixed(1);
          const py = toPxY(pt).toFixed(1);
          return `${i === 0 ? 'M' : 'L'} ${px},${py}`;
        })
        .filter(Boolean)
        .join(' ') + ' Z'
    );
  };

  // Upper Lip Path
  const upperOuter = LIP_LANDMARKS.upperLipOuter;
  const upperInnerReversed = [...LIP_LANDMARKS.upperLipInner].reverse();
  const upperIndices = [...upperOuter, ...upperInnerReversed];
  const upperLipPath = buildPath(upperIndices);

  // Lower Lip Path
  const lowerOuter = LIP_LANDMARKS.lowerLipOuter;
  const lowerInnerReversed = [...LIP_LANDMARKS.lowerLipInner].reverse();
  const lowerIndices = [...lowerOuter, ...lowerInnerReversed];
  const lowerLipPath = buildPath(lowerIndices);

  // Full outer lips and inner fissure
  const fullOuterPath = buildPath(LIP_LANDMARKS.lipsOuter);
  const fullInnerPath = buildPath(LIP_LANDMARKS.lipsInner);
  const fullLipPathWithInnerHole = `${fullOuterPath} ${fullInnerPath}`;

  // Face oval boundary for foundation
  const faceOvalPath = buildPath(FACE_OVAL_LANDMARKS);

  // Eyes cutouts
  const leftEyePath = buildPath(EYE_LANDMARKS.leftEye);
  const rightEyePath = buildPath(EYE_LANDMARKS.rightEye);

  // Foundation Mask: Face boundary with eye and mouth holes punched out (evenodd rule)
  const foundationMaskPath = `${faceOvalPath} ${leftEyePath} ${rightEyePath} ${fullOuterPath}`;

  // Mouth opening distance
  const upperInnerCenterPt = landmarks[LIP_LANDMARKS.upperInnerCenter];
  const lowerInnerCenterPt = landmarks[LIP_LANDMARKS.lowerInnerCenter];
  const mouthOpenDistance =
    upperInnerCenterPt && lowerInnerCenterPt
      ? Math.abs(toPxY(lowerInnerCenterPt) - toPxY(upperInnerCenterPt))
      : 0;

  // Key highlight anchor points
  const cupidsBowPt = landmarks[LIP_LANDMARKS.cupidsBowCenter];
  const lowerLeftCushionPt = landmarks[LIP_LANDMARKS.lowerLipCushionLeft];
  const lowerRightCushionPt = landmarks[LIP_LANDMARKS.lowerLipCushionRight];
  const leftCheekPt = landmarks[CHEEK_LANDMARKS.leftCheekCenter];
  const rightCheekPt = landmarks[CHEEK_LANDMARKS.rightCheekCenter];

  return {
    landmarks,
    upperLipPath,
    lowerLipPath,
    fullLipPathWithInnerHole,
    faceOvalPath,
    foundationMaskPath,
    mouthOpenDistance,
    leftCheekX: leftCheekPt ? toPxX(leftCheekPt) : containerWidth * 0.35,
    leftCheekY: leftCheekPt ? toPxY(leftCheekPt) : containerHeight * 0.55,
    rightCheekX: rightCheekPt ? toPxX(rightCheekPt) : containerWidth * 0.65,
    rightCheekY: rightCheekPt ? toPxY(rightCheekPt) : containerHeight * 0.55,
    cupidsBowX: cupidsBowPt ? toPxX(cupidsBowPt) : containerWidth * 0.5,
    cupidsBowY: cupidsBowPt ? toPxY(cupidsBowPt) : containerHeight * 0.68,
    lowerCushionLeftX: lowerLeftCushionPt ? toPxX(lowerLeftCushionPt) : containerWidth * 0.44,
    lowerCushionLeftY: lowerLeftCushionPt ? toPxY(lowerLeftCushionPt) : containerHeight * 0.73,
    lowerCushionRightX: lowerRightCushionPt ? toPxX(lowerRightCushionPt) : containerWidth * 0.56,
    lowerCushionRightY: lowerRightCushionPt ? toPxY(lowerRightCushionPt) : containerHeight * 0.73,
    toPixelX: toPxX,
    toPixelY: toPxY,
  };
}
