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
TRUNCATE TABLE Partner RESTART IDENTITY CASCADE;
INSERT INTO Partner (Ten, DiaChi, SoDienThoai) VALUES
('Công ty ABC', 'Hà Nội, Việt Nam', '0981234567'),
('Tập đoàn XYZ', 'TP. Hồ Chí Minh, Việt Nam', '0976543210'),
('Công ty DEF', 'Đà Nẵng, Việt Nam', '0967890123');
select * from Partner
CREATE TABLE NhanSu (
    ID SERIAL PRIMARY KEY,
    Ten VARCHAR(225) NOT NULL,
    SoDienThoai VARCHAR(225) NOT NULL,
    DiaChi VARCHAR(225) NOT NULL,
    PartnerID INT,
    FOREIGN KEY (PartnerID) REFERENCES Partner(ID)
);
INSERT INTO NhanSu (Ten, SoDienThoai, DiaChi, PartnerID) VALUES
('Nguyễn Văn A', '0987654321', 'Hà Nội, Việt Nam', 1),
('Trần Thị B', '0912345678', 'TP. Hồ Chí Minh, Việt Nam', 2),
('Lê Văn C', '0901234567', 'Đà Nẵng, Việt Nam', 1),
('Phạm Thị D', '0976543210', 'Cần Thơ, Việt Nam', 3),
('Hoàng Minh E', '0967890123', 'Hải Phòng, Việt Nam', 2);
