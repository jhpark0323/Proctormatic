# 빌드 단계
FROM node:18 AS build

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# Nginx 설정 단계
FROM nginx:alpine

# 빌드된 정적 파일을 Nginx HTML 폴더로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 추가: public 폴더의 모델 파일 복사
# COPY --from=build /app/public/models /usr/share/nginx/html/dist/models

# Nginx 기본 설정 유지
CMD ["nginx", "-g", "daemon off;"]
