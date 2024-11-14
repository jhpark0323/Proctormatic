import { useEffect, useState } from "react";

const useYoloPostProcessing = (output: Float32Array | undefined) => {
  const [processedResults, setProcessedResults] = useState<any[]>([]);
  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

  const processOutput = () => {
    if (!output) return;

    const numClasses = 4;
    const outputSize = 85;
    let results = [];

    for (let i = 0; i < output.length; i += outputSize) {
      const bbox = output.slice(i, i + 4);
      const objectness = sigmoid(output[i + 4]);
      const classProbs = output.slice(i + 5, i + 5 + numClasses).map(sigmoid);

      const maxClassProb = Math.max(...classProbs);
      const classId = classProbs.indexOf(maxClassProb);
      const confidence = objectness * maxClassProb;

      if (confidence > 0.5) {
        const [centerX, centerY, width, height] = bbox;
        const x = (centerX - width / 2) * 640;
        const y = (centerY - height / 2) * 480;
        const w = width * 640;
        const h = height * 480;

        results.push({ bbox: [x, y, w, h], objectness, classId, confidence });
      }
    }
    setProcessedResults(results);
  };

  useEffect(() => {
    processOutput();
  }, [output]);

  return { processedResults };
};

export default useYoloPostProcessing;
