# LottoPass Backend

> **로또 번호 데이터를 안전하게 관리하고 제공하는 백엔드 애플리케이션**

LottoPass의 백엔드는 로또 번호 데이터의 수집, 저장, 관리, 및 API 제공 역할을 수행합니다. 이 레포지토리는 LottoPass의 백엔드 애플리케이션을 위한 코드베이스를 포함합니다.

---

## 📌 **주요 기능**

- **로또 번호 API 제공**: 과거 로또 당첨 데이터를 조회할 수 있는 API 제공.
- **최신 회차 데이터 업데이트**: 매주 최신 당첨 데이터를 자동으로 저장.
- **안정적인 데이터 관리**: TypeORM과 MySQL을 활용한 데이터 관리.
- **스케줄링**: 최신 데이터를 정기적으로 업데이트하는 크론 작업.

---

## 🛠 **기술 스택**

- **NestJS**: 백엔드 애플리케이션 프레임워크.
- **TypeScript**: 타입 안전성을 보장하는 JavaScript 확장.
- **TypeORM**: 데이터베이스 ORM.
- **MySQL**: 데이터베이스.
- **Axios**: 외부 API 호출.
- **Schedule Module**: 크론 작업 스케줄링.

---

## 📂 **프로젝트 구조**

```
lottopass-backend/
├── src/
│   ├── filters/                # HTTP 예외 필터
│   ├── lotto/                  # 로또 데이터 관련 모듈
│   │   ├── lotto-draw.entity.ts  # 로또 데이터 엔티티 정의
│   │   ├── lotto.controller.ts   # API 엔드포인트 컨트롤러
│   │   ├── lotto.service.ts      # 비즈니스 로직 서비스
│   │   └── lotto.module.ts       # 모듈 정의
│   ├── utils/                  # 유틸리티 함수
│   ├── app.controller.ts       # 기본 앱 컨트롤러
│   ├── app.service.ts          # 기본 앱 서비스
│   ├── app.module.ts           # 애플리케이션 루트 모듈
│   └── main.ts                 # 애플리케이션 엔트리포인트
├── test/                       # 테스트 코드
├── .env                        # 환경 변수 파일
└── Dockerfile                  # Docker 설정
```

---

## 🧑‍💻 **설치 및 실행**

### 1. 레포지토리 클론

```bash
git clone https://github.com/zlzlzlmo/lottopass-backend.git
cd lottopass-backend
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 값을 입력하세요.

### 4. 데이터베이스 설정

- MySQL 데이터베이스를 생성합니다.
- `.env` 파일에 데이터베이스 설정값을 입력합니다.
  ```env
  MYSQLHOST=localhost
  MYSQLPORT=3306
  MYSQLUSER=root
  MYSQLPASSWORD=password
  MYSQLDATABASE=lottopass
  ```

### 5. 서버 실행

#### 개발 서버 실행
```bash
npm run start:dev
```

#### 프로덕션 빌드 및 실행
```bash
npm run build
npm run start:prod
```

---

## 📡 **API 명세**

### 1. 전체 로또 추첨 데이터 가져오기
- **URL**: `/api/lotto/all`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "drawNumber": 1,
        "date": "2023-01-01",
        "winningNumbers": [1, 2, 3, 4, 5, 6],
        "bonusNumber": 7,
        "prizeStatistics": {
          "totalPrize": 1000000000,
          "firstWinAmount": 200000000,
          "firstAccumAmount": 600000000,
          "firstPrizeWinnerCount": 3
        }
      }
    ]
  }
  ```

### 2. 특정 회차 로또 데이터 가져오기
- **URL**: `/api/lotto/draw/:drawNumber`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "drawNumber": 123,
      "date": "2022-03-01",
      "winningNumbers": [5, 8, 13, 22, 29, 33],
      "bonusNumber": 10,
      "prizeStatistics": {
        "totalPrize": 800000000,
        "firstWinAmount": 160000000,
        "firstAccumAmount": 480000000,
        "firstPrizeWinnerCount": 3
      }
    }
  }
  ```

### 3. 최신 로또 데이터 가져오기
- **URL**: `/api/lotto/latest`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "drawNumber": 1000,
      "date": "2023-12-31",
      "winningNumbers": [10, 20, 30, 40, 41, 42],
      "bonusNumber": 43,
      "prizeStatistics": {
        "totalPrize": 1500000000,
        "firstWinAmount": 300000000,
        "firstAccumAmount": 900000000,
        "firstPrizeWinnerCount": 5
      }
    }
  }
  ```

---

## ✨ **향후 업데이트**

- **당첨 지역 데이터 크롤링 및 API 제공**
- **데이터 통계 대시보드 API**
- **유저 인증 및 관리**

---

## 📬 **문의**

프로젝트와 관련된 문의 사항은 다음 이메일로 연락주세요:

- Email: [zlzlzlmo60@gmail.com](mailto:zlzlzlmo60@gmail.com)

