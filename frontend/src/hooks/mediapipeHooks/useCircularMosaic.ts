import { useCallback } from "react";

// 모서리가 둥근 사다리꼴 모자이크 처리 훅 (Gaussian Blur 사용)
const useCircularMosaic = () => {
  const drawCircularMosaic = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      points: any[], // 눈과 입의 랜드마크 좌표들을 포함하는 배열
      widthMultiplier = 1.0, // 가로 확장 비율
      heightMultiplier = 1.0, // 세로 확장 비율
      cornerRadius = 50 // 모서리의 둥글기 정도
    ) => {
      // 왼쪽 눈과 오른쪽 눈, 입의 좌표를 구함
      const topPoints = points.slice(0, points.length / 2); // 위쪽 (눈)
      const bottomPoints = points.slice(points.length / 2); // 아래쪽 (입)

      // 눈과 입을 포함하는 사다리꼴 형태의 좌표를 계산
      const topLeftX =
        Math.min(...topPoints.map((point) => point.x)) * ctx.canvas.width;
      const topRightX =
        Math.max(...topPoints.map((point) => point.x)) * ctx.canvas.width;
      const topY =
        Math.min(...topPoints.map((point) => point.y)) * ctx.canvas.height;

      const bottomLeftX =
        Math.min(...bottomPoints.map((point) => point.x)) * ctx.canvas.width;
      const bottomRightX =
        Math.max(...bottomPoints.map((point) => point.x)) * ctx.canvas.width;
      const bottomY =
        Math.max(...bottomPoints.map((point) => point.y)) * ctx.canvas.height;

      // 영역을 확장하여 가로로 넓게 덮기
      const expandedLeftX =
        Math.min(topLeftX, bottomLeftX) -
        (topRightX - topLeftX) * widthMultiplier * 0.1;
      const expandedRightX =
        Math.max(topRightX, bottomRightX) +
        (topRightX - topLeftX) * widthMultiplier * 0.1;
      const expandedTopY = topY - (bottomY - topY) * heightMultiplier * 0.3;
      const expandedBottomY =
        bottomY + (bottomY - topY) * heightMultiplier * 0.2;

      if (ctx) {
        // 모자이크 영역 블러 효과 적용
        ctx.save();
        ctx.filter = "blur(20px)"; // 블러 강도 설정 (px)

        // 둥근 모서리를 가진 사다리꼴 그리기
        ctx.beginPath();
        ctx.moveTo(expandedLeftX + cornerRadius, expandedTopY);
        ctx.lineTo(expandedRightX - cornerRadius, expandedTopY);
        ctx.arcTo(
          expandedRightX,
          expandedTopY,
          expandedRightX,
          expandedTopY + cornerRadius,
          cornerRadius
        );
        ctx.lineTo(expandedRightX, expandedBottomY - cornerRadius);
        ctx.arcTo(
          expandedRightX,
          expandedBottomY,
          expandedRightX - cornerRadius,
          expandedBottomY,
          cornerRadius
        );
        ctx.lineTo(expandedLeftX + cornerRadius, expandedBottomY);
        ctx.arcTo(
          expandedLeftX,
          expandedBottomY,
          expandedLeftX,
          expandedBottomY - cornerRadius,
          cornerRadius
        );
        ctx.lineTo(expandedLeftX, expandedTopY + cornerRadius);
        ctx.arcTo(
          expandedLeftX,
          expandedTopY,
          expandedLeftX + cornerRadius,
          expandedTopY,
          cornerRadius
        );
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
      }
    },
    []
  );

  return { drawCircularMosaic };
};

export default useCircularMosaic;
