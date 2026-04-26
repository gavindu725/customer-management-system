USE cms_db;

-- ─── Countries ───────────────────────────────────────────────
INSERT INTO country (name) VALUES
('Sri Lanka'),
('India'),
('United Kingdom'),
('Australia'),
('United States');

-- ─── Cities ──────────────────────────────────────────────────
INSERT INTO city (name, country_id) VALUES
-- Sri Lanka (id=1)
('Colombo',    1),
('Kandy',      1),
('Galle',      1),
('Jaffna',     1),
('Negombo',    1),
-- India (id=2)
('Mumbai',     2),
('Delhi',      2),
('Chennai',    2),
-- UK (id=3)
('London',     3),
('Manchester', 3),
-- Australia (id=4)
('Sydney',     4),
('Melbourne',  4),
-- USA (id=5)
('New York',   5),
('Los Angeles',5);

-- ─── Sample Customers ─────────────────────────────────────────
INSERT INTO customer (name, date_of_birth, nic_number) VALUES
('Amal Perera',    '1985-03-15', '850315-1234V'),
('Saman Fernando', '1990-07-22', '900722-5678V'),
('Nimal Jayasena', '1978-11-08', '781108-9012V');

-- ─── Phone Numbers ────────────────────────────────────────────
INSERT INTO phone_number (number, customer_id) VALUES
('0711234567', 1),
('0119876543', 1),
('0759998887', 2),
('0777001122', 3);

-- ─── Addresses ────────────────────────────────────────────────
INSERT INTO address (address_line_1, address_line_2, city_id, country_id, customer_id) VALUES
('45 Galle Road',    'Colombo 03', 1, 1, 1),
('12 Temple Street', NULL,         2, 1, 2),
('88 Beach Road',    'Galle',      3, 1, 3);

-- ─── Family Relationship ──────────────────────────────────────
-- Customers 1 and 2 are family members of each other
INSERT INTO customer_family (customer_id, family_member_id) VALUES
(1, 2),
(2, 1);