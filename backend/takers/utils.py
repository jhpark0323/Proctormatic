from rest_framework.response import Response

def create_response(message: str, result: dict = None, status_code: int = 200) -> Response:
    response_data = {
        "message": message,
    }

    # 상태 코드가 200인 경우에만 result 포함
    if status_code == 200 and result is not None:
        response_data["result"] = result

    return Response(response_data, status=status_code)