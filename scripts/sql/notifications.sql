-- Notifications (MVP) stored in srv83804_contracts
-- Run on the contracts DB

CREATE TABLE IF NOT EXISTS notification_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  type VARCHAR(64) NOT NULL,
  kitchen_id INT NOT NULL DEFAULT 0,
  client_id INT NOT NULL,
  meal_date DATE NOT NULL,
  count INT NOT NULL DEFAULT 0,
  first_at DATETIME NOT NULL,
  last_at DATETIME NOT NULL,
  last_notified_at DATETIME NULL,
  batch_at DATETIME NOT NULL,
  status ENUM('open','closed') NOT NULL DEFAULT 'open',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_event (type, kitchen_id, client_id, meal_date, status, batch_at),
  KEY idx_status_last (status, last_at),
  KEY idx_type (type),
  KEY idx_kitchen (kitchen_id),
  KEY idx_client (client_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notification_reads (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_id BIGINT UNSIGNED NOT NULL,
  user_id INT NOT NULL,
  read_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_read (event_id, user_id),
  KEY idx_user (user_id),
  CONSTRAINT fk_notification_reads_event
    FOREIGN KEY (event_id) REFERENCES notification_events(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notification_jobs (
  job_name VARCHAR(64) NOT NULL,
  last_checked_at DATETIME NULL,
  PRIMARY KEY (job_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notification_role_settings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_id INT NOT NULL,
  type VARCHAR(64) NOT NULL,
  inapp_enabled TINYINT(1) NOT NULL DEFAULT 1,
  email_enabled TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_role_type (role_id, type),
  KEY idx_role (role_id),
  CONSTRAINT fk_notification_role_settings_role
    FOREIGN KEY (role_id) REFERENCES roles(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed defaults for diet roles (optional)
INSERT INTO notification_role_settings (role_id, type, inapp_enabled, email_enabled)
SELECT id, 'diet_meal_approval_pending', 1, 0
FROM roles
WHERE name IN ('dietitian', 'diet_head')
ON DUPLICATE KEY UPDATE
  inapp_enabled = VALUES(inapp_enabled),
  email_enabled = VALUES(email_enabled);
