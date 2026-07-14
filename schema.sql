-- FarmaciaLearn — esquema MySQL 8+
-- Ejecutar:  mysql -u root -p < schema.sql

DROP DATABASE IF EXISTS farmaciaLear;
CREATE DATABASE farmaciaLear
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE farmaciaLear;

-- ============================================================
-- CACHÉ: openFDA + LibreTranslate
-- ============================================================

CREATE TABLE medicamento (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  openfda_set_id     VARCHAR(64)  NOT NULL,
  nombre_marca       VARCHAR(255) NULL,
  nombre_generico    VARCHAR(255) NULL,
  principio_activo   VARCHAR(500) NULL,
  fabricante         VARCHAR(255) NULL,
  indicaciones       MEDIUMTEXT NULL,
  contraindicaciones MEDIUMTEXT NULL,
  dosis              MEDIUMTEXT NULL,
  efectos_adversos   MEDIUMTEXT NULL,
  advertencias       MEDIUMTEXT NULL,
  payload_json       JSON NULL,
  sincronizado_en    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  creado_en          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_openfda_set_id (openfda_set_id),
  KEY idx_nombre_generico (nombre_generico),
  KEY idx_nombre_marca (nombre_marca)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE medicamento_traduccion (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  medicamento_id BIGINT UNSIGNED NOT NULL,
  idioma         CHAR(5) NOT NULL DEFAULT 'es',
  campo          ENUM('indicaciones','contraindicaciones','dosis',
                      'efectos_adversos','advertencias') NOT NULL,
  texto          MEDIUMTEXT NOT NULL,
  traducido_en   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_medicamento_idioma_campo (medicamento_id, idioma, campo),
  CONSTRAINT fk_traduccion_medicamento FOREIGN KEY (medicamento_id)
    REFERENCES medicamento (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- JUEGO
-- ============================================================

CREATE TABLE usuario (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(120) NOT NULL,
  correo        VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  creado_en     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE ronda (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id      BIGINT UNSIGNED NOT NULL,
  tipo_juego      ENUM('opcion_multiple') NOT NULL DEFAULT 'opcion_multiple',
  estado          ENUM('en_curso','terminada','abandonada') NOT NULL DEFAULT 'en_curso',
  total_preguntas SMALLINT UNSIGNED NOT NULL,
  puntos          INT UNSIGNED NOT NULL DEFAULT 0,
  iniciada_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  terminada_en    TIMESTAMP NULL,

  PRIMARY KEY (id),
  KEY idx_usuario_estado (usuario_id, estado),
  CONSTRAINT fk_ronda_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuario (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Medicamentos que el usuario eligió para la ronda (N:M)
CREATE TABLE ronda_medicamento (
  ronda_id       BIGINT UNSIGNED NOT NULL,
  medicamento_id BIGINT UNSIGNED NOT NULL,

  PRIMARY KEY (ronda_id, medicamento_id),
  KEY idx_medicamento (medicamento_id),
  CONSTRAINT fk_rm_ronda FOREIGN KEY (ronda_id)
    REFERENCES ronda (id) ON DELETE CASCADE,
  CONSTRAINT fk_rm_medicamento FOREIGN KEY (medicamento_id)
    REFERENCES medicamento (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE pregunta (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ronda_id       BIGINT UNSIGNED NOT NULL,
  medicamento_id BIGINT UNSIGNED NOT NULL,
  atributo       ENUM('indicaciones','contraindicaciones','dosis',
                      'principio_activo','efectos_adversos') NOT NULL,
  enunciado      TEXT NOT NULL,
  orden          SMALLINT UNSIGNED NOT NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_ronda_orden (ronda_id, orden),

  -- La pregunta solo puede tratar sobre un medicamento que el usuario eligió
  CONSTRAINT fk_pregunta_ronda_medicamento
    FOREIGN KEY (ronda_id, medicamento_id)
    REFERENCES ronda_medicamento (ronda_id, medicamento_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE opcion (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pregunta_id    BIGINT UNSIGNED NOT NULL,
  texto          TEXT NOT NULL,
  es_correcta    BOOLEAN NOT NULL DEFAULT FALSE,
  orden          TINYINT UNSIGNED NOT NULL,

  -- UNIQUE ignora los NULL: fuerza como máximo una opción correcta por pregunta
  correcta_unica BIGINT UNSIGNED
    GENERATED ALWAYS AS (IF(es_correcta, pregunta_id, NULL)) STORED,

  PRIMARY KEY (id),
  UNIQUE KEY uq_pregunta_orden (pregunta_id, orden),
  UNIQUE KEY uq_una_correcta (correcta_unica),
  UNIQUE KEY uq_opcion_pregunta (id, pregunta_id),
  CONSTRAINT fk_opcion_pregunta FOREIGN KEY (pregunta_id)
    REFERENCES pregunta (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE respuesta (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pregunta_id   BIGINT UNSIGNED NOT NULL,
  opcion_id     BIGINT UNSIGNED NOT NULL,
  tiempo_ms     INT UNSIGNED NULL,
  respondida_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_respuesta_pregunta (pregunta_id),

  -- La opción elegida debe pertenecer a esa misma pregunta
  CONSTRAINT fk_respuesta_opcion FOREIGN KEY (opcion_id, pregunta_id)
    REFERENCES opcion (id, pregunta_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- LEADERBOARD
-- ============================================================

CREATE VIEW v_ranking AS
SELECT
  u.id                       AS usuario_id,
  u.nombre,
  COALESCE(SUM(r.puntos), 0) AS puntos_totales,
  COUNT(r.id)                AS rondas_jugadas,
  MAX(r.terminada_en)        AS ultima_partida
FROM usuario u
LEFT JOIN ronda r
  ON r.usuario_id = u.id
 AND r.estado = 'terminada'
GROUP BY u.id, u.nombre
ORDER BY puntos_totales DESC;
