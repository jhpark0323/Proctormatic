const useFaceBoundingBox = (landmarks: any) => {
  const getBoundingBox = () => {
    const xCoords = landmarks.map((point: any) => point.x);
    const yCoords = landmarks.map((point: any) => point.y);
    const minX = Math.min(...xCoords) * 800;
    const minY = Math.min(...yCoords) * 600;
    const maxX = Math.max(...xCoords) * 800;
    const maxY = Math.max(...yCoords) * 600;
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  };
  return getBoundingBox();
};

export default useFaceBoundingBox;
