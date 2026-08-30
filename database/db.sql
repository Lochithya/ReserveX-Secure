-- assumption - "defaultdb" is the database name


CREATE TABLE defaultdb.users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255) NULL,
    contact_number VARCHAR(50),
    business_name VARCHAR(255),
    no_of_current_bookings INT DEFAULT 0,
    role ENUM('VENDOR', 'EMPLOYEE'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE defaultdb.exhibitions (
    exhibition_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    description TEXT,
    start_date DATE,
    end_date DATE
);

CREATE TABLE defaultdb.stalls (
    stall_id INT AUTO_INCREMENT PRIMARY KEY,
    stall_name VARCHAR(255) UNIQUE,
    size ENUM('small', 'medium', 'large'),
    type ENUM('Standard', 'Premium', 'Corner Stall'),
    price DECIMAL(10, 2),
    gridCol INT,
    gridRow INT,
    is_Confirmed BOOLEAN DEFAULT FALSE,
    description TEXT
);

CREATE TABLE defaultdb.reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exhibition_id INT NOT NULL,
    reservation_date TIMESTAMP,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    qr_code_path VARCHAR(255),
    stall_type ENUM('Standard', 'Premium', 'Corner Stall'),
    preferred_size ENUM('small', 'medium', 'large'),
    no_of_stalls_required INT DEFAULT 1,
    business_category ENUM(
        'Food & Beverage',
        'Clothing',
        'Electronics',
        'Handicrafts',
        'Services'
    ),
    special_requirements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reservations_user
        FOREIGN KEY (user_id)
        REFERENCES defaultdb.users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reservations_exhibition
        FOREIGN KEY (exhibition_id)
        REFERENCES defaultdb.exhibitions(exhibition_id)
        ON DELETE CASCADE
);

CREATE TABLE defaultdb.reservation_stalls (
    reservation_id INT NOT NULL,
    stall_id INT NOT NULL,

    PRIMARY KEY (reservation_id, stall_id),

    CONSTRAINT fk_reservation_stall_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES defaultdb.reservations(reservation_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reservation_stall_stall
        FOREIGN KEY (stall_id)
        REFERENCES defaultdb.stalls(stall_id)
        ON DELETE CASCADE
);

CREATE TABLE defaultdb.reservation_genres (
    reservation_id INT NOT NULL,
    stall_id INT NOT NULL,
    genre_name VARCHAR(255) NOT NULL,

    PRIMARY KEY (reservation_id, stall_id, genre_name),

    CONSTRAINT fk_reservation_genre_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES defaultdb.reservations(reservation_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reservation_genre_stall
        FOREIGN KEY (stall_id)
        REFERENCES defaultdb.stalls(stall_id)
        ON DELETE CASCADE
);

-- Seed Predefined Exhibitions
INSERT INTO defaultdb.exhibitions (name, description, start_date, end_date) VALUES
('Colombo International Book Fair 2026', 'The largest book exhibition in Sri Lanka, connecting publishers, authors, and readers.', '2026-09-18', '2026-09-27'),
('National Consumer Expo 2026', 'A massive expo celebrating electronics, clothing, and local food vendors.', '2026-10-10', '2026-10-15'),
('Tech & Innovation Summit 2026', 'Showcasing the latest technological advances, services, and digital products.', '2026-11-05', '2026-11-08');

-- Note: Below are DBML references for documentation/visualization tool mapping:
-- Ref: reservations.user_id > users.user_id
-- Ref: reservations.exhibition_id > exhibitions.exhibition_id
-- Ref: reservation_stalls.reservation_id > reservations.reservation_id
-- Ref: reservation_stalls.stall_id > stalls.stall_id
-- Ref: reservation_genres.reservation_id > reservations.reservation_id
