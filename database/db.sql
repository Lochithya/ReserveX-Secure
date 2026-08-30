-- assumption - "defaultdb" is the database name




-- Assumption: MySQL 8+ and defaultdb.users already exists.


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


CREATE TABLE defaultdb.venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255) NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Sri Lanka',
    postal_code VARCHAR(20) NULL,
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Colombo',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_venue_address (name, address_line1, city, country)
) ENGINE=InnoDB;



CREATE TABLE defaultdb.exhibitions (
    exhibition_id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL,

    name VARCHAR(255) NOT NULL,
    description TEXT NULL,

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    status ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED')
        NOT NULL DEFAULT 'DRAFT',

    -- NULL means no platform-defined stall limit for one vendor.
    max_stalls_per_vendor INT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_exhibition_dates
        CHECK (end_date >= start_date),

    CONSTRAINT chk_max_stalls_per_vendor
        CHECK (
            max_stalls_per_vendor IS NULL
            OR max_stalls_per_vendor > 0
        ),

    CONSTRAINT fk_exhibitions_venue
        FOREIGN KEY (venue_id)
        REFERENCES defaultdb.venues(venue_id)
        ON DELETE RESTRICT,

    -- Allows recurring annual events.
    UNIQUE KEY uq_exhibition_occurrence (venue_id, name, start_date),

    -- Supports overlap validation in the backend.
    KEY idx_exhibitions_venue_dates (venue_id, start_date, end_date),
    KEY idx_exhibitions_status_dates (status, start_date, end_date)
) ENGINE=InnoDB;



CREATE TABLE defaultdb.stalls (
    stall_id INT AUTO_INCREMENT PRIMARY KEY,
    exhibition_id INT NOT NULL,

    -- Human-readable identifier: A-01, B-12, Premium-05, etc.
    stall_name VARCHAR(50) NOT NULL,

    size ENUM('small', 'medium', 'large') NOT NULL,
    type ENUM('Standard', 'Premium', 'Corner Stall') NOT NULL,

    price DECIMAL(10,2) NOT NULL,

    grid_row INT NOT NULL,
    grid_col INT NOT NULL,

    description TEXT NULL,

    -- Use this to hide a stall without destroying historical data.
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_stall_price
        CHECK (price >= 0),

    CONSTRAINT chk_stall_grid_position
        CHECK (grid_row > 0 AND grid_col > 0),

    CONSTRAINT fk_stalls_exhibition
        FOREIGN KEY (exhibition_id)
        REFERENCES defaultdb.exhibitions(exhibition_id)
        ON DELETE RESTRICT,

    -- A-01 can exist in several exhibitions, but only once per exhibition.
    UNIQUE KEY uq_stall_name_per_exhibition (
        exhibition_id,
        stall_name
    ),

    -- No two stalls can occupy the same map cell for one exhibition.
    UNIQUE KEY uq_stall_position_per_exhibition (
        exhibition_id,
        grid_row,
        grid_col
    ),

    -- Required to guarantee reservations use stalls from their own exhibition.
    UNIQUE KEY uq_stall_exhibition_pair (
        stall_id,
        exhibition_id
    ),

    KEY idx_stalls_exhibition_active (
        exhibition_id,
        is_active
    )
) ENGINE=InnoDB;



CREATE TABLE defaultdb.reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    exhibition_id INT NOT NULL,

    -- Vendor-selected date. Validate in the backend:
    -- CURRENT_DATE <= reservation_date <= exhibition.end_date
    reservation_date DATE NOT NULL,

    status ENUM(
        'PENDING',
        'APPROVED',
        'REJECTED',
        'CANCELLED',
        'EXPIRED'
    ) NOT NULL DEFAULT 'PENDING',

    requested_stall_type ENUM(
        'Standard',
        'Premium',
        'Corner Stall'
    ) NULL,

    preferred_size ENUM(
        'small',
        'medium',
        'large'
    ) NULL,

    no_of_stalls_required INT NOT NULL DEFAULT 1,

    business_category ENUM(
        'Food & Beverage',
        'Clothing',
        'Electronics',
        'Handicrafts',
        'Services'
    ) NOT NULL,

    special_requirements TEXT NULL,

    -- Populate only after the reservation is approved.
    qr_code_token CHAR(36) NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_reservation_stall_count
        CHECK (no_of_stalls_required > 0),

    CONSTRAINT fk_reservations_user
        FOREIGN KEY (user_id)
        REFERENCES defaultdb.users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_reservations_exhibition
        FOREIGN KEY (exhibition_id)
        REFERENCES defaultdb.exhibitions(exhibition_id)
        ON DELETE RESTRICT,

    -- Required for the cross-event protection foreign key below.
    UNIQUE KEY uq_reservation_exhibition_pair (
        reservation_id,
        exhibition_id
    ),

    UNIQUE KEY uq_reservation_qr_token (
        qr_code_token
    ),

    KEY idx_reservations_user_created (
        user_id,
        created_at
    ),

    KEY idx_reservations_exhibition_status (
        exhibition_id,
        status
    )
) ENGINE=InnoDB;



CREATE TABLE defaultdb.reservation_stalls (
    reservation_stall_id INT AUTO_INCREMENT PRIMARY KEY,

    reservation_id INT NOT NULL,
    exhibition_id INT NOT NULL,
    stall_id INT NOT NULL,

    -- Price snapshot for invoices and historical accuracy.
    reserved_price DECIMAL(10,2) NOT NULL,

    allocation_status ENUM(
        'HELD',
        'ALLOCATED',
        'RELEASED'
    ) NOT NULL DEFAULT 'HELD',

    allocated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP NULL,

    -- Active allocation prevents another vendor reserving the same stall.
    -- When released, this becomes NULL and the stall can be reserved again.
    active_stall_id INT GENERATED ALWAYS AS (
        CASE
            WHEN allocation_status IN ('HELD', 'ALLOCATED')
                THEN stall_id
            ELSE NULL
        END
    ) STORED,

    CONSTRAINT chk_reserved_price
        CHECK (reserved_price >= 0),

    -- Guarantees the reservation is for the same exhibition.
    CONSTRAINT fk_reservation_stalls_reservation
        FOREIGN KEY (reservation_id, exhibition_id)
        REFERENCES defaultdb.reservations(
            reservation_id,
            exhibition_id
        )
        ON DELETE CASCADE,

    -- Guarantees the stall belongs to that same exhibition.
    CONSTRAINT fk_reservation_stalls_stall
        FOREIGN KEY (stall_id, exhibition_id)
        REFERENCES defaultdb.stalls(
            stall_id,
            exhibition_id
        )
        ON DELETE RESTRICT,

    -- A reservation cannot include the same stall twice.
    UNIQUE KEY uq_reservation_stall (
        reservation_id,
        stall_id
    ),

    -- A stall can have only one active HELD or ALLOCATED reservation.
    UNIQUE KEY uq_active_stall_allocation (
        active_stall_id
    ),

    KEY idx_reservation_stalls_reservation (
        reservation_id
    ),

    KEY idx_reservation_stalls_stall (
        stall_id
    )
) ENGINE=InnoDB;



CREATE TABLE defaultdb.reservation_genres (
    reservation_stall_id INT NOT NULL,
    genre_name VARCHAR(100) NOT NULL,

    PRIMARY KEY (
        reservation_stall_id,
        genre_name
    ),

    CONSTRAINT fk_reservation_genres_reservation_stall
        FOREIGN KEY (reservation_stall_id)
        REFERENCES defaultdb.reservation_stalls(reservation_stall_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


