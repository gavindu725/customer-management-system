CREATE DATABASE IF NOT EXISTS cms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cms_db;

CREATE TABLE IF NOT EXISTS country (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT uq_country_name UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS city (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    country_id BIGINT NOT NULL,
    CONSTRAINT fk_city_country FOREIGN KEY (country_id) REFERENCES country(id)
);

CREATE TABLE IF NOT EXISTS customer (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    date_of_birth DATE         NOT NULL,
    nic_number    VARCHAR(20)  NOT NULL,
    CONSTRAINT uq_customer_nic UNIQUE (nic_number)
);

CREATE TABLE IF NOT EXISTS phone_number (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    number      VARCHAR(20) NOT NULL,
    customer_id BIGINT      NOT NULL,
    CONSTRAINT fk_phone_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS address (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city_id        BIGINT,
    country_id     BIGINT,
    customer_id    BIGINT NOT NULL,
    CONSTRAINT fk_address_city    FOREIGN KEY (city_id)     REFERENCES city(id),
    CONSTRAINT fk_address_country FOREIGN KEY (country_id)  REFERENCES country(id),
    CONSTRAINT fk_address_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE
);

-- Self-referential family relationship
CREATE TABLE IF NOT EXISTS customer_family (
    customer_id      BIGINT NOT NULL,
    family_member_id BIGINT NOT NULL,
    PRIMARY KEY (customer_id, family_member_id),
    CONSTRAINT fk_family_customer FOREIGN KEY (customer_id)      REFERENCES customer(id) ON DELETE CASCADE,
    CONSTRAINT fk_family_member   FOREIGN KEY (family_member_id) REFERENCES customer(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_customer_nic        ON customer(nic_number);
CREATE INDEX idx_customer_name       ON customer(name);
CREATE INDEX idx_phone_customer      ON phone_number(customer_id);
CREATE INDEX idx_address_customer    ON address(customer_id);
CREATE INDEX idx_city_country        ON city(country_id);