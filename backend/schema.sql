-- UNIMEX backend
-- Compatible baseline with PostgreSQL / MySQL (minor syntax adjustments may be required).

-- USERS
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    student_id VARCHAR(40) UNIQUE,
    career VARCHAR(120),
    semester SMALLINT CHECK (semester BETWEEN 1 AND 12),
    phone VARCHAR(20),
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    role VARCHAR(16) NOT NULL CHECK (role IN ('admin', 'user')),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_phone ON users(phone);

-- EVENTS
CREATE TABLE events (
    id VARCHAR(32) PRIMARY KEY,
    image VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(80) NOT NULL,
    place VARCHAR(180) NOT NULL,
    location TEXT NOT NULL,
    spots INTEGER NOT NULL CHECK (spots >= 0),
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('Presencial', 'En línea')),
    summary TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_type ON events(event_type);

-- EVENT AGENDA
CREATE TABLE event_agenda_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id VARCHAR(32) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    item_order INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, item_order)
);

CREATE INDEX idx_event_agenda_event_id ON event_agenda_items(event_id);

-- EVENT REQUIREMENTS
CREATE TABLE event_requirements (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id VARCHAR(32) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    item_order INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, item_order)
);

CREATE INDEX idx_event_requirements_event_id ON event_requirements(event_id);

-- EVENT REGISTRATIONS
CREATE TABLE event_registrations (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(32) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    full_name VARCHAR(120) NOT NULL,
    student_id VARCHAR(40) NOT NULL,
    email VARCHAR(254) NOT NULL,
    career VARCHAR(120) NOT NULL,
    semester SMALLINT NOT NULL CHECK (semester BETWEEN 1 AND 12),
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('registered', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, student_id),
    UNIQUE (event_id, email)
);

CREATE INDEX idx_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_registrations_status ON event_registrations(status);
CREATE INDEX idx_registrations_created_at ON event_registrations(created_at);

-- AUTH SMS VERIFICATIONS
CREATE TABLE auth_sms_verifications (
    id VARCHAR(80) PRIMARY KEY,
    code VARCHAR(8) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    student_id VARCHAR(40) NOT NULL,
    email VARCHAR(254) NOT NULL,
    career VARCHAR(120) NOT NULL,
    semester SMALLINT NOT NULL CHECK (semester BETWEEN 1 AND 12),
    phone VARCHAR(20) NOT NULL,
    attempts SMALLINT NOT NULL DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sms_verifications_expires_at ON auth_sms_verifications(expires_at);
