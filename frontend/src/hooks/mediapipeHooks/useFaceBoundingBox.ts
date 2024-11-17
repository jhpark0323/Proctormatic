export const useFaceBoundingBox = (
  landmarks: any,
  canvas: HTMLCanvasElement
) => {
  const getBoundingBox = () => {
    const xCoords = landmarks.map((point: any) => point.x * canvas.width);
    const yCoords = landmarks.map((point: any) => point.y * canvas.height);
    const minX = Math.min(...xCoords);
    const minY = Math.min(...yCoords);
    const maxX = Math.max(...xCoords);
    const maxY = Math.max(...yCoords);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  };
  return getBoundingBox();
};
