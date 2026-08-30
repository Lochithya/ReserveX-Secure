-- ReserveX sample catalogue: 3 venues, 4 exhibitions, and their stalls only.
-- This script is safe to run more than once. It does not insert into users,
-- reservations, reservation_stalls, or any other table.

START TRANSACTION;

-- Venues
INSERT INTO defaultdb.venues
    (name, address_line1, address_line2, city, country, postal_code, timezone)
VALUES
    ('Bandaranaike Memorial International Conference Hall', 'Bauddhaloka Mawatha', NULL, 'Colombo', 'Sri Lanka', '00700', 'Asia/Colombo')
ON DUPLICATE KEY UPDATE venue_id = LAST_INSERT_ID(venue_id);
SET @bmich_id = LAST_INSERT_ID();

INSERT INTO defaultdb.venues
    (name, address_line1, address_line2, city, country, postal_code, timezone)
VALUES
    ('Sri Lanka Exhibition and Convention Centre', '12, D. R. Wijewardena Mawatha', NULL, 'Colombo', 'Sri Lanka', '01000', 'Asia/Colombo')
ON DUPLICATE KEY UPDATE venue_id = LAST_INSERT_ID(venue_id);
SET @slec_id = LAST_INSERT_ID();

INSERT INTO defaultdb.venues
    (name, address_line1, address_line2, city, country, postal_code, timezone)
VALUES
    ('Kandy City Centre Convention Hall', '5, Dalada Veediya', 'Level 3, Kandy City Centre', 'Kandy', 'Sri Lanka', '20000', 'Asia/Colombo')
ON DUPLICATE KEY UPDATE venue_id = LAST_INSERT_ID(venue_id);
SET @kcc_id = LAST_INSERT_ID();

-- Exhibitions
INSERT INTO defaultdb.exhibitions
    (venue_id, name, description, start_date, end_date, status, max_stalls_per_vendor)
VALUES
    (@bmich_id, 'Colombo International Book Fair 2026', 'Annual book fair for local and international publishers, authors, and readers.', '2026-09-18', '2026-09-27', 'PUBLISHED', 3)
ON DUPLICATE KEY UPDATE
    exhibition_id = LAST_INSERT_ID(exhibition_id),
    description = VALUES(description), end_date = VALUES(end_date), status = VALUES(status),
    max_stalls_per_vendor = VALUES(max_stalls_per_vendor);
SET @book_fair_id = LAST_INSERT_ID();

INSERT INTO defaultdb.exhibitions
    (venue_id, name, description, start_date, end_date, status, max_stalls_per_vendor)
VALUES
    (@slec_id, 'Sri Lanka Technology Expo 2026', 'Technology showcase for software companies, startups, hardware suppliers, and digital-service providers.', '2026-10-09', '2026-10-11', 'PUBLISHED', 2)
ON DUPLICATE KEY UPDATE
    exhibition_id = LAST_INSERT_ID(exhibition_id),
    description = VALUES(description), end_date = VALUES(end_date), status = VALUES(status),
    max_stalls_per_vendor = VALUES(max_stalls_per_vendor);
SET @tech_expo_id = LAST_INSERT_ID();

INSERT INTO defaultdb.exhibitions
    (venue_id, name, description, start_date, end_date, status, max_stalls_per_vendor)
VALUES
    (@kcc_id, 'Kandy Handicrafts and Heritage Fair 2026', 'Regional exhibition celebrating handmade crafts, textiles, food, and cultural products.', '2026-11-20', '2026-11-22', 'PUBLISHED', 2)
ON DUPLICATE KEY UPDATE
    exhibition_id = LAST_INSERT_ID(exhibition_id),
    description = VALUES(description), end_date = VALUES(end_date), status = VALUES(status),
    max_stalls_per_vendor = VALUES(max_stalls_per_vendor);
SET @heritage_fair_id = LAST_INSERT_ID();

INSERT INTO defaultdb.exhibitions
    (venue_id, name, description, start_date, end_date, status, max_stalls_per_vendor)
VALUES
    (@bmich_id, 'Colombo Education and Careers Expo 2027', 'Education, training, employment, and career-development exhibition.', '2027-01-15', '2027-01-17', 'DRAFT', 2)
ON DUPLICATE KEY UPDATE
    exhibition_id = LAST_INSERT_ID(exhibition_id),
    description = VALUES(description), end_date = VALUES(end_date), status = VALUES(status),
    max_stalls_per_vendor = VALUES(max_stalls_per_vendor);
SET @careers_expo_id = LAST_INSERT_ID();

-- Stalls: six per exhibition, with unique map positions inside each exhibition.
INSERT INTO defaultdb.stalls
    (exhibition_id, stall_name, size, type, price, grid_row, grid_col, description, is_active)
VALUES
    (@book_fair_id, 'A-01', 'small',  'Standard',     15000.00, 1, 1, 'Entrance-side standard book stall.', TRUE),
    (@book_fair_id, 'A-02', 'small',  'Standard',     15000.00, 1, 2, 'Standard book stall near the main aisle.', TRUE),
    (@book_fair_id, 'B-01', 'medium', 'Premium',      28000.00, 2, 1, 'Premium stall with increased visitor visibility.', TRUE),
    (@book_fair_id, 'B-02', 'medium', 'Standard',     24000.00, 2, 2, 'Medium standard stall in the central hall.', TRUE),
    (@book_fair_id, 'C-01', 'large',  'Corner Stall', 42000.00, 3, 1, 'Large corner stall suitable for major publishers.', TRUE),
    (@book_fair_id, 'C-02', 'large',  'Premium',      38000.00, 3, 2, 'Large premium stall near the author stage.', TRUE),

    (@tech_expo_id, 'T-01', 'small',  'Standard',     18000.00, 1, 1, 'Standard startup showcase booth.', TRUE),
    (@tech_expo_id, 'T-02', 'small',  'Standard',     18000.00, 1, 2, 'Standard technology demonstration booth.', TRUE),
    (@tech_expo_id, 'T-03', 'medium', 'Premium',      30000.00, 1, 3, 'Premium booth near the presentation area.', TRUE),
    (@tech_expo_id, 'U-01', 'medium', 'Standard',     26000.00, 2, 1, 'Medium booth for software and service providers.', TRUE),
    (@tech_expo_id, 'U-02', 'large',  'Corner Stall', 46000.00, 2, 2, 'Corner booth for product launches and displays.', TRUE),
    (@tech_expo_id, 'U-03', 'large',  'Premium',      41000.00, 2, 3, 'Large premium booth with high aisle exposure.', TRUE),

    (@heritage_fair_id, 'H-01', 'small',  'Standard',     12000.00, 1, 1, 'Standard stall for crafts and artisanal goods.', TRUE),
    (@heritage_fair_id, 'H-02', 'small',  'Standard',     12000.00, 1, 2, 'Standard stall for regional food products.', TRUE),
    (@heritage_fair_id, 'H-03', 'medium', 'Premium',      22000.00, 1, 3, 'Premium stall for featured craft collections.', TRUE),
    (@heritage_fair_id, 'J-01', 'medium', 'Standard',     20000.00, 2, 1, 'Medium stall for textile exhibitors.', TRUE),
    (@heritage_fair_id, 'J-02', 'large',  'Corner Stall', 36000.00, 2, 2, 'Corner stall for large cultural displays.', TRUE),
    (@heritage_fair_id, 'J-03', 'large',  'Premium',      33000.00, 2, 3, 'Large premium stall near the performance area.', TRUE),

    (@careers_expo_id, 'E-01', 'small',  'Standard',     16000.00, 1, 1, 'Standard booth for training providers.', TRUE),
    (@careers_expo_id, 'E-02', 'small',  'Standard',     16000.00, 1, 2, 'Standard booth for university admissions teams.', TRUE),
    (@careers_expo_id, 'E-03', 'medium', 'Premium',      27000.00, 1, 3, 'Premium booth near the seminar rooms.', TRUE),
    (@careers_expo_id, 'F-01', 'medium', 'Standard',     24000.00, 2, 1, 'Medium booth for recruitment agencies.', TRUE),
    (@careers_expo_id, 'F-02', 'large',  'Corner Stall', 40000.00, 2, 2, 'Corner booth for major employers.', TRUE),
    (@careers_expo_id, 'F-03', 'large',  'Premium',      37000.00, 2, 3, 'Large premium booth with interview space.', TRUE)
ON DUPLICATE KEY UPDATE
    size = VALUES(size), type = VALUES(type), price = VALUES(price),
    grid_row = VALUES(grid_row), grid_col = VALUES(grid_col),
    description = VALUES(description), is_active = VALUES(is_active);

COMMIT;
