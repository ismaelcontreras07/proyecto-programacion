PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
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
INSERT INTO events VALUES('evt_64f4447a3b824fdd','/uploads/event_2c4e626992d84be1a1eae33d30333fe1.png','Lideres del mañana','2026-03-27','10:00 a.m-1:00 p.m','UNIMEX','UNIMEX polanco',42,'Presencial','Ismael me borro todo mi trabajo',1,'2026-02-17 13:53:07','2026-02-24 03:18:53');
INSERT INTO events VALUES('evt_03d3dee614714714','/uploads/event_43f7b23ac84345cf8295088843756faa.jpg','Prueba','2026-03-27','11:00 a.m.-1:00 p.m.','UNIMEX','UNIMEX Polanco',45,'Presencial','Prueba prueba prueba',1,'2026-02-17 14:13:41','2026-03-26 15:54:13');
CREATE TABLE event_agenda_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id VARCHAR(32) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    item_order INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, item_order)
);
INSERT INTO event_agenda_items VALUES(30,'evt_64f4447a3b824fdd',1,'itfcutfurfufyfiyfto','2026-02-17 13:53:07');
INSERT INTO event_agenda_items VALUES(31,'evt_03d3dee614714714',1,'hsbxjhasgdhygfcuhjqn','2026-02-17 14:13:41');
CREATE TABLE event_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id VARCHAR(32) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    item_order INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, item_order)
);
INSERT INTO event_requirements VALUES(30,'evt_64f4447a3b824fdd',1,'libreta','2026-02-17 13:53:07');
INSERT INTO event_requirements VALUES(31,'evt_64f4447a3b824fdd',2,'pluma','2026-02-17 13:53:07');
INSERT INTO event_requirements VALUES(32,'evt_64f4447a3b824fdd',3,'actitud','2026-02-17 13:53:07');
INSERT INTO event_requirements VALUES(33,'evt_03d3dee614714714',1,'sdygawgdjkqahqcfh','2026-02-17 14:13:41');
CREATE TABLE users (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            student_id TEXT NOT NULL UNIQUE,
            career TEXT,
            semester INTEGER CHECK (semester BETWEEN 1 AND 12),
            role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
            password_hash TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
INSERT INTO users VALUES('usr_admin','admin','Administrador','UNIMEX','ADM00001-00',NULL,NULL,'admin','be4d87e3d2295729d414d084d4e5f3a00d98d9e3a5eb6b5f35ad029e3bed93b7',1,'2026-02-15 00:13:29','2026-02-15 00:13:29');
INSERT INTO users VALUES('usr_user','user','Alumno','Demo','ALU00001-01','Ingeniería en Sistemas',4,'user','c4793df33ac5f74b826d43c02a28e160ccb2c4c5641ee36e89ee11a01702f527',1,'2026-02-15 00:13:29','2026-02-15 00:13:29');
INSERT INTO users VALUES('usr_7c8b08b12e234def','42424060-64','Ismael','Contreras','42424060-64','Sistemas Computacionales',5,'user','7ab4771dd348ab5c431c16f83dfd7869b95e07158b131f985d7b43d3914a7562',1,'2026-02-15 01:34:43','2026-02-15 01:34:43');
INSERT INTO users VALUES('usr_c070f4a380a64008','42520461-83','Ruben','Ruben','42520461-83','Administración',1,'user','6c22d14ce512dabb7b14a91aabdf9aad9a055c641914475d1b9ebd5edc9b9a28',1,'2026-02-17 13:43:03','2026-02-17 13:43:03');
INSERT INTO users VALUES('usr_ad152e41ed824f22','42520416-53','Dante','Hernandez Rodriguez','42520416-53','Sistemas Computacionales',5,'user','644b2071fdc2498b50855011fd0b557ee29e6788c84517eeeef4be987623f8b2',1,'2026-02-17 13:45:56','2026-02-17 13:45:56');
INSERT INTO users VALUES('usr_77b088fc5b884e2a','42420261-61','Isis','Muñoz','42420261-61','Sistemas Computacionales',5,'user','79b9caa959bd7be4aa96dcfd023aa79836dc83edd7830cbfabecafe1da1f3ecb',1,'2026-02-17 13:55:52','2026-02-17 13:55:52');
INSERT INTO users VALUES('usr_f837b0ff045b44be','12345671-22','vicente','suarez','12345671-22','Sistemas Computacionales',5,'user','4a558bf04a4c5411bd78bd0a3f4179782b0d7003bdcbfe21d283636d542f9a18',1,'2026-02-17 15:51:32','2026-02-17 15:51:32');
INSERT INTO users VALUES('usr_2284ec2b1b394571','12345678-90','isis','lopez','12345678-90','Derecho',1,'user','cde47b14bbdc79d40a0936b49dd6b55aa0579cec4dc9c4815f033291e79c081a',1,'2026-02-17 15:59:16','2026-02-17 15:59:16');
INSERT INTO users VALUES('usr_3dc3c7277cc9407c','01234567-89','Juanito','Juanito','01234567-89','Sistemas Computacionales',5,'user','036f53117836b0c3867234879aa5c2e5cd9cf07ac5c1f390c22b5c78ed6d865b',1,'2026-02-17 16:04:19','2026-02-17 16:04:19');
INSERT INTO users VALUES('usr_56e565cb4a274cd1','7uv14a9l-01','Alumno','Prueba Empalme','7UV14A9L-01','Ingeniería en Sistemas',4,'user','57aa46873db7a81de19910b58ae0df19cd317ba529244415b9319fc8682ce7c1',1,'2026-02-24 03:18:07','2026-02-24 03:18:07');
INSERT INTO users VALUES('usr_94946972377f4f95','yuu2zxhu-02','Alumno','Prueba Empalme 2','YUU2ZXHU-02','Ingeniería en Sistemas',4,'user','57aa46873db7a81de19910b58ae0df19cd317ba529244415b9319fc8682ce7c1',1,'2026-02-24 03:18:53','2026-02-24 03:18:53');
INSERT INTO users VALUES('usr_fec41d9113784552','a06523vi-ce','vicente','suarez cantu','A06523VI-CE','Sistemas Computacionales',1,'user','334c00e834bd3565642d3b84c3565e26602f2ab7504be64ceca318426b6f1d3d',1,'2026-03-26 15:51:54','2026-03-26 15:51:54');
CREATE TABLE event_registrations (
            id TEXT PRIMARY KEY,
            event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            student_id TEXT NOT NULL,
            career TEXT NOT NULL,
            semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 12),
            status TEXT NOT NULL CHECK (status IN ('registered', 'cancelled')),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (event_id, student_id)
        );
INSERT INTO event_registrations VALUES('reg_e5f87864a43b43a3','evt_64f4447a3b824fdd','Isis','Muñoz','42420261-61','Sistemas Computacionales',5,'registered','2026-02-17 13:56:19','2026-02-17 14:15:29');
INSERT INTO event_registrations VALUES('reg_51bc75b38bbd4e0e','evt_03d3dee614714714','Isis','Muñoz','42420261-61','Sistemas Computacionales',5,'registered','2026-02-17 14:14:48','2026-02-17 14:15:24');
INSERT INTO event_registrations VALUES('reg_867427528a40404e','evt_64f4447a3b824fdd','vicente','suarez','12345671-22','Sistemas Computacionales',5,'registered','2026-02-17 15:52:06','2026-02-17 15:52:06');
INSERT INTO event_registrations VALUES('reg_be7bea174ba64b40','evt_03d3dee614714714','isis','lopez','12345678-90','Derecho',1,'cancelled','2026-02-17 16:00:03','2026-02-17 16:00:18');
INSERT INTO event_registrations VALUES('reg_7eefb92a72f249df','evt_64f4447a3b824fdd','isis','lopez','12345678-90','Derecho',1,'registered','2026-02-17 16:01:44','2026-02-17 16:01:44');
INSERT INTO event_registrations VALUES('reg_a3978ba2a9424f07','evt_64f4447a3b824fdd','Juanito','Juanito','01234567-89','Sistemas Computacionales',5,'registered','2026-02-17 16:04:36','2026-02-17 16:04:36');
INSERT INTO event_registrations VALUES('reg_279544dcd0b0480e','evt_03d3dee614714714','Juanito','Juanito','01234567-89','Sistemas Computacionales',5,'registered','2026-02-17 16:04:55','2026-02-17 16:04:55');
INSERT INTO event_registrations VALUES('reg_fc59f78737654c5f','evt_64f4447a3b824fdd','Alumno','Demo','ALU00001-01','Ingeniería en Sistemas',4,'registered','2026-02-17 22:17:37','2026-02-17 22:17:37');
INSERT INTO event_registrations VALUES('reg_14ee6cae421f4f92','evt_03d3dee614714714','Alumno','Demo','ALU00001-01','Ingeniería en Sistemas',4,'registered','2026-02-17 22:17:37','2026-02-17 22:17:37');
INSERT INTO event_registrations VALUES('reg_d29b0b7d93074969','evt_64f4447a3b824fdd','Ismael','Contreras','42424060-64','Sistemas Computacionales',5,'registered','2026-02-17 22:47:06','2026-02-17 22:47:06');
INSERT INTO event_registrations VALUES('reg_7e0b5080acf946f4','evt_64f4447a3b824fdd','Alumno','Prueba Empalme','7UV14A9L-01','Ingeniería en Sistemas',4,'registered','2026-02-24 03:18:07','2026-02-24 03:18:07');
INSERT INTO event_registrations VALUES('reg_136693673f024877','evt_03d3dee614714714','Alumno','Prueba Empalme','7UV14A9L-01','Ingeniería en Sistemas',4,'registered','2026-02-24 03:18:07','2026-02-24 03:18:07');
INSERT INTO event_registrations VALUES('reg_1e9d900b40444475','evt_64f4447a3b824fdd','Alumno','Prueba Empalme 2','YUU2ZXHU-02','Ingeniería en Sistemas',4,'registered','2026-02-24 03:18:53','2026-02-24 03:18:53');
INSERT INTO event_registrations VALUES('reg_476c531c94e2484a','evt_03d3dee614714714','vicente','suarez cantu','A06523VI-CE','Sistemas Computacionales',1,'registered','2026-03-26 15:54:13','2026-03-26 15:54:13');
CREATE TABLE event_reviews (
            id TEXT PRIMARY KEY,
            event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
            student_id TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (event_id, student_id)
        );
INSERT INTO sqlite_sequence VALUES('event_agenda_items',31);
INSERT INTO sqlite_sequence VALUES('event_requirements',33);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_event_agenda_event_id ON event_agenda_items(event_id);
CREATE INDEX idx_event_requirements_event_id ON event_requirements(event_id);
CREATE INDEX idx_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_registrations_status ON event_registrations(status);
CREATE INDEX idx_registrations_created_at ON event_registrations(created_at);
CREATE INDEX idx_event_reviews_event_id ON event_reviews(event_id);
CREATE INDEX idx_event_reviews_student_id ON event_reviews(student_id);
CREATE INDEX idx_event_reviews_rating ON event_reviews(rating);
CREATE INDEX idx_users_student_id ON users(student_id);
COMMIT;
