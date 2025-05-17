CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
insert into users (username, password, device_id)VALUES
('platsaver','cGFzc3dvcmQxMjM=','18bbe2bd9c30aee6bf707ffe3e7d7bac')
CREATE TABLE Partner(
    ID SERIAL PRIMARY KEY,
    Ten VARCHAR(225),
    DiaChi VARCHAR(225),
    SoDienThoai VARCHAR(225)
);
INSERT INTO Partner (Ten, DiaChi, SoDienThoai) VALUES
('Công ty ABC', '123 Đường Lê Lợi, Hà Nội', '0987654321'),
('Công ty XYZ', '456 Đường Nguyễn Huệ, TP. Hồ Chí Minh', '0912345678'),
('Công ty DEF', '789 Đường Trần Phú, Đà Nẵng', '0909876543');
