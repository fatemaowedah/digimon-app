DROP TABLE IF EXISTS digmon;
CREATE TABLE IF NOT EXISTS digmon(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    img VARCHAR(255),
    level VARCHAR(255)
)