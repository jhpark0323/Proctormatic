import { useEffect, useState } from "react";

const useYoloPostProcessing = (output: Float32Array | undefined) => {
  const [processedResults, setProcessedResults] = useState<any[]>([]);

  const processOutput = () => {
    if (!output) return;

    const numClasses = 4;
    const gridSize = 80;
    const anchors = 3;
    const outputSize = 85;

    let results = [];

    for (let i = 0; i < output.length; i += outputSize) {
      const bbox = output.slice(i, i + 4);
      const objectness = output[i + 4];
      const classProbs = output.slice(i + 5, i + 5 + numClasses);

      const maxClassProb = Math.max(...classProbs);
      const classId = classProbs.indexOf(maxClassProb);

      if (objectness > 0.5 && maxClassProb > 0.5) {
        results.push({ bbox, objectness, classId, confidence: maxClassProb });
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
