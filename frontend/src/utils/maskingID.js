<script async src="https://docs.opencv.org/4.x/opencv.js" type="text/javascript"></script>
<canvas id="canvasOutput"></canvas>
<input type="file" id="fileInput">
<script type="text/javascript">
  document.getElementById('fileInput').addEventListener('change', function(e) {
    let file = e.target.files[0]
    let reader = new FileReader()
    reader.onload = function(event) {
      let img = new Image()
      img.onload = function() {
        let src = cv.imread(img)
        let maskedImg = maskSensitiveInfo(src)
        cv.imshow('canvasOutput', maskedImg)
        src.delete()
        maskedImg.delete()
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  })

  function maskSensitiveInfo(src) {
    // 이름과 생년월일 영역을 제외한 나머지를 마스킹하기 위해 좌표 정의
    const nameRect = new cv.Rect(50, 50, 200, 50)      // 이름 위치 좌표 (예시)
    const dobRect = new cv.Rect(50, 120, 200, 50)       // 생년월일 위치 좌표 (예시)

    let maskedImg = src.clone()
    let maskColor = new cv.Scalar(0, 0, 0, 255)        // 검은색

    // 이름 및 생년월일을 제외한 나머지 영역 마스킹
    // 이미지 전체를 순회하면서 예외 영역을 제외하고 마스킹 처리
    for (let y = 0; y < maskedImg.rows; y++) {
      for (let x = 0; x < maskedImg.cols; x++) {
        if (!isInRect(x, y, nameRect) && !isInRect(x, y, dobRect)) {
          maskedImg.ucharPtr(y, x)[0] = 0   // B
          maskedImg.ucharPtr(y, x)[1] = 0   // G
          maskedImg.ucharPtr(y, x)[2] = 0   // R
        }
      }
    }

    return maskedImg
  }

  // 특정 점(x, y)이 주어진 Rect 안에 있는지 확인하는 함수
  function isInRect(x, y, rect) {
    return (
      x >= rect.x &&
      x < rect.x + rect.width &&
      y >= rect.y &&
      y < rect.y + rect.height
    )
  }
</script>
