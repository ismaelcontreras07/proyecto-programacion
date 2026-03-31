-- SQL para importar en https://dbdiagram.io (PostgreSQL compatible)

CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  student_id VARCHAR(40) NOT NULL UNIQUE,
  career VARCHAR(120),
  semester SMALLINT CHECK (semester BETWEEN 1 AND 12),
  role VARCHAR(16) NOT NULL CHECK (role IN ('admin', 'user')),
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE event_agenda_items (
  id BIGINT PRIMARY KEY,
  event_id VARCHAR(32) NOT NULL,
  item_order INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (event_id, item_order),
  CONSTRAINT fk_event_agenda_event
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE event_requirements (
  id BIGINT PRIMARY KEY,
  event_id VARCHAR(32) NOT NULL,
  item_order INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (event_id, item_order),
  CONSTRAINT fk_event_requirements_event
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE event_registrations (
  id VARCHAR(64) PRIMARY KEY,
  event_id VARCHAR(32) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  student_id VARCHAR(40) NOT NULL,
  career VARCHAR(120) NOT NULL,
  semester SMALLINT NOT NULL CHECK (semester BETWEEN 1 AND 12),
  status VARCHAR(20) NOT NULL CHECK (status IN ('registered', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (event_id, student_id),
  CONSTRAINT fk_event_registrations_event
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE event_reviews (
  id VARCHAR(64) PRIMARY KEY,
  event_id VARCHAR(32) NOT NULL,
  student_id VARCHAR(40) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (event_id, student_id),
  CONSTRAINT fk_event_reviews_event
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
