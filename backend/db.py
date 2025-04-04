import psycopg2
from psycopg2.extras import RealDictCursor

def get_connection():
    return psycopg2.connect(
        host="localhost",
        port=5432,
        database="postgres",
        user="postgres",
        password="box4516",
        cursor_factory=RealDictCursor
    )

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

   
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL
        );
    """)

    cursor.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='reviews' AND column_name='user_email'
            ) THEN
                ALTER TABLE reviews ADD COLUMN user_email VARCHAR(255);
            END IF;
        END;
        $$;
    """)


    cursor.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'users' AND column_name = 'nickname'
            ) THEN
                ALTER TABLE users ADD COLUMN nickname VARCHAR(100);
            END IF;
        END;
        $$;
    
                   
        DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'reviews' AND column_name = 'nickname'
        ) THEN
            ALTER TABLE reviews ADD COLUMN nickname VARCHAR(100);
        END IF;
    END;
    $$;
    """)


    cursor.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'users' AND column_name = 'bio'
        ) THEN
            ALTER TABLE users ADD COLUMN bio TEXT;
        END IF;
    END;
    $$;
""")
    
    cursor.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'users' AND column_name = 'is_admin'
        ) THEN
            ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        END IF;
    END;
    $$;
""")
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
            author_nickname TEXT,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)



    conn.commit()
    conn.close()