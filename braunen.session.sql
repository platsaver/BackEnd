CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
insert into users (username, password, device_id)VALUES
('platsaver','cGFzc3dvcmQxMjM=','18bbe2bd9c30aee6bf707ffe3e7d7bac')