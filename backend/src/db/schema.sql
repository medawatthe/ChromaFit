-- ChromaFit database schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
    id                        SERIAL PRIMARY KEY,
    first_name                VARCHAR(100) NOT NULL,
    last_name                 VARCHAR(100) NOT NULL,
    username                  VARCHAR(50) UNIQUE NOT NULL,
    email                     VARCHAR(255) UNIQUE NOT NULL,
    mobile_number             VARCHAR(20),
    password_hash             TEXT NOT NULL,
    date_of_birth             DATE,
    gender                    VARCHAR(20),
    role                      VARCHAR(20) NOT NULL DEFAULT 'user',

    -- Personal styling information
    height_cm                 NUMERIC(5,2),
    weight_kg                 NUMERIC(5,2),
    skin_tone                 VARCHAR(50),
    body_shape                VARCHAR(50),
    fashion_style_preference  TEXT[] DEFAULT '{}',
    favorite_colors           TEXT[] DEFAULT '{}',
    least_favorite_colors     TEXT[] DEFAULT '{}',

    -- Lifestyle
    country                   VARCHAR(100),
    city                      VARCHAR(100),
    occupation                VARCHAR(100),
    climate_preference        VARCHAR(50),

    -- Profile
    profile_picture_url       TEXT,
    cover_photo_url           TEXT,
    bio                       TEXT,
    favorite_brands           TEXT[] DEFAULT '{}',
    language                  VARCHAR(20) DEFAULT 'en',
    theme                     VARCHAR(10) DEFAULT 'light',

    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outfits (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url         TEXT NOT NULL,
    clothing_name     VARCHAR(150),
    category          VARCHAR(50),
    brand             VARCHAR(100),
    color             VARCHAR(50),
    secondary_color   VARCHAR(50),
    pattern           VARCHAR(50),
    material          VARCHAR(50),
    sleeve_type       VARCHAR(50),
    neck_type         VARCHAR(50),
    fit_type          VARCHAR(50),
    season            VARCHAR(50),
    occasion          VARCHAR(50),
    purchase_date     DATE,
    price             NUMERIC(10,2),
    last_worn_date    DATE,
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);

CREATE TABLE IF NOT EXISTS ai_analysis (
    id                    SERIAL PRIMARY KEY,
    outfit_id             INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    dominant_colors       JSONB,
    skin_tone_category    VARCHAR(50),
    color_harmony_score   NUMERIC(5,2),
    fashion_score         NUMERIC(5,2),
    occasion_match        TEXT,
    ai_summary            TEXT,
    raw_response          JSONB,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_outfit_id ON ai_analysis(outfit_id);

CREATE TABLE IF NOT EXISTS chat_history (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message      TEXT NOT NULL,
    response     TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);

CREATE TABLE IF NOT EXISTS wear_log (
    id           SERIAL PRIMARY KEY,
    outfit_id    INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    worn_on      DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wear_log_outfit_id ON wear_log(outfit_id);
CREATE INDEX IF NOT EXISTS idx_wear_log_user_id ON wear_log(user_id);

CREATE TABLE IF NOT EXISTS contact_messages (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(150) NOT NULL,
    email        VARCHAR(255) NOT NULL,
    message      TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
