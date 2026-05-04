SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS user_mission_status;
DROP TABLE IF EXISTS mission_logs;
DROP TABLE IF EXISTS daily_missions;
DROP TABLE IF EXISTS missions;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    coins INT NOT NULL DEFAULT 0,
    streak_days INT NOT NULL DEFAULT 0,
    last_completed_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- user_sessions
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME,
    user_agent VARCHAR(255),
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- missions
CREATE TABLE missions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    reward_coins INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- daily_missions
CREATE TABLE daily_missions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mission_date DATE NOT NULL,
    mission_id INT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_daily_mission (mission_date, mission_id),
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
);

-- mission_logs
CREATE TABLE mission_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mission_id INT NOT NULL,
    mission_date DATE NOT NULL,
    image_url TEXT,
    content TEXT,
    verified BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
);

-- user_mission_status
CREATE TABLE user_mission_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mission_id INT NOT NULL,
    mission_date DATE NOT NULL,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    completed_at DATETIME,
    mission_log_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_mission (user_id, mission_id, mission_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_log_id) REFERENCES mission_logs(id) ON DELETE SET NULL
);

-- posts
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mission_log_id INT,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_log_id) REFERENCES mission_logs(id) ON DELETE SET NULL
);

-- comments
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- likes
CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 🔥 전체 미션 데이터 (원본 유지)
INSERT INTO missions (title, description, category, reward_coins, is_active) VALUES
('물 1.5L 마시기', '하루에 물 1.5리터 이상 마시기', 'health', 1, TRUE),
('5000보 이상 걷기', '하루에 5000보 이상 걷기', 'health', 1, TRUE),
('30분 운동하기', '30분 이상 운동하기', 'health', 1, TRUE),
('명상 10분', '10분 이상 명상하기', 'mind', 1, TRUE),
('건강한 식단', '채소 3가지 이상 섭취', 'health', 2, TRUE),
('충분한 수면', '7시간 이상 수면', 'health', 1, TRUE),

('스트레칭 15분', '아침 또는 저녁에 15분 스트레칭하기', 'health', 1, TRUE),
('계단 이용하기', '엘리베이터 대신 계단 이용하기 (3층 이상)', 'health', 1, TRUE),
('플랭크 1분', '플랭크 자세 1분 유지하기', 'health', 1, TRUE),
('과일 2가지 섭취', '하루에 과일 2가지 이상 먹기', 'health', 1, TRUE),
('패스트푸드 안 먹기', '하루 동안 패스트푸드 섭취하지 않기', 'health', 2, TRUE),
('푸시업 20개', '푸시업 20개 완료하기', 'health', 1, TRUE),
('스쿼트 30개', '스쿼트 30개 완료하기', 'health', 1, TRUE),
('자전거 타기 20분', '자전거로 20분 이상 이동하기', 'health', 2, TRUE),
('아침 식사 챙기기', '아침 식사를 거르지 않고 먹기', 'health', 1, TRUE),
('야식 안 먹기', '오후 9시 이후 음식 섭취하지 않기', 'health', 2, TRUE),
('설탕 줄이기', '음료나 음식에 설탕 추가하지 않기', 'health', 2, TRUE),
('10분 일광욕', '햇빛 아래서 10분 이상 산책 또는 휴식', 'health', 1, TRUE),
('요가 20분', '요가 동작 20분 이상 수련하기', 'health', 2, TRUE),
('스마트폰 1시간 줄이기', '전날 대비 스마트폰 사용 1시간 줄이기', 'mind', 2, TRUE),

('수영 30분', '수영장에서 30분 이상 수영하기', 'health', 3, TRUE),
('눈 건강 지키기', '1시간마다 5분씩 눈 휴식 취하기', 'health', 1, TRUE),
('올바른 자세 유지', '앉을 때 바른 자세를 의식적으로 유지하기', 'health', 1, TRUE),
('소금 줄이기', '음식에 소금 또는 간장 추가하지 않기', 'health', 2, TRUE),
('10000보 달성', '하루 10,000보 이상 걷기', 'health', 3, TRUE),
('카페인 줄이기', '카페인을 적정량만 섭취하기', 'health', 2, TRUE),
('냉수 샤워', '마지막 1분 동안 찬물로 샤워하기', 'health', 2, TRUE),
('건강 간식 먹기', '간식으로 견과류 또는 과일 먹기', 'health', 1, TRUE),
('실내 자전거 20분', '헬스장 또는 집에서 실내 자전거 20분', 'health', 2, TRUE),
('단백질 챙기기', '하루 단백질 식품 2가지 이상 섭취', 'health', 1, TRUE),

('5분 눈 운동', '눈 피로 회복 운동 5분 수행', 'health', 1, TRUE),
('비타민 챙겨 먹기', '영양제 또는 비타민 섭취하기', 'health', 1, TRUE),
('점심 산책', '점심시간 10분 이상 산책하기', 'health', 1, TRUE),
('폼롤러 사용', '폼롤러로 근막 이완 10분 하기', 'health', 1, TRUE),
('허리 스트레칭', '허리 통증 예방 스트레칭 10분', 'health', 1, TRUE),
('2km 런닝하기', '(친구와) 페이스 맞춰 2km 런닝하기', 'health', 2, TRUE),
('줄넘기 200개', '(친구와) 개수 세 가며 줄넘기 200개 채워보기', 'health', 2, TRUE),

('텀블러 사용하기', '일회용 컵 대신 개인 텀블러 사용하기', 'eco', 2, TRUE),
('장바구니 사용', '마트에서 비닐봉지 대신 장바구니 사용', 'eco', 2, TRUE),
('대중교통 이용', '자동차 대신 대중교통으로 이동하기', 'eco', 2, TRUE),
('분리수거 실천', '쓰레기 분리수거 올바르게 하기', 'eco', 1, TRUE),
('전기 절약하기', '사용하지 않는 전등 끄기 (3회 이상)', 'eco', 1, TRUE),
('플라스틱 프리 데이', '하루 동안 일회용 플라스틱 사용하지 않기', 'eco', 3, TRUE),
('음식물 쓰레기 줄이기', '음식 남기지 않고 다 먹기', 'eco', 1, TRUE),
('플로깅 참여', '조깅하면서 쓰레기 줍기 (20분 이상)', 'eco', 3, TRUE),
('코드 뽑기', '사용 안 하는 가전제품 플러그 뽑기 (3개 이상)', 'eco', 1, TRUE),
('종이 타월 줄이기', '화장실에서 핸드 드라이어 또는 개인 손수건 사용', 'eco', 1, TRUE),
('음식 포장 줄이기', '배달 주문 시 일회용품 없음 선택하기', 'eco', 2, TRUE),
('에코백 사용', '외출 시 에코백 챙겨서 사용하기', 'eco', 1, TRUE),
('물병 리필하기', '생수 구매 대신 물병에 물 채워 사용', 'eco', 1, TRUE),
('식물성 단백질 먹기', '두부, 콩, 견과류 등 식물성 단백질 섭취', 'eco', 1, TRUE),
('음식 낭비 제로', '남은 음식 보관 후 다음 끼니에 활용하기', 'eco', 2, TRUE),
('짧은 이동 도보로', '1km 이내 이동 시 걸어서 가기', 'eco', 1, TRUE),
('음식 직접 요리', '배달·포장 음식 대신 직접 요리해 먹기', 'eco', 2, TRUE);