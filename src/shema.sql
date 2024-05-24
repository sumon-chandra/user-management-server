CREATE DATABASE user_management;
USE user_management;

CREATE TABLE users (
    id integer PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    age int(11) NOT NULL,
    email varchar(255) NOT NULL,
    profession TEXT,
    created TIMESTAMP NOT NULL DEFAULT NOW()
)

INSERT INTO users (name, age, email, profession)
VALUE
("John", 23, "jhon@gmail.com", "Developer"),
("John", 23, "jhon@gmail.com", "Designer"),
("Michael", 45, "michael@gmail.com", "Marketer");

-- To rename a column
ALTER TABLE users
RENAME COLUMN firstName TO name;
ADD email varchar(255) NOT NULL;
ADD profession TEXT;

-- To modify user column data types
ALTER TABLE locations
MODIFY COLUMN userID integer UNIQUE;

-- Foreign keys for relation between tables
CREATE TABLE locations (
    locationId int NOT NULL AUTO_INCREMENT,
    city varchar(255) NOT NULL,
    country varchar(255) NOT NULL,
    userId integer,
    PRIMARY KEY (locationId),
    FOREIGN KEY (userId) REFERENCES users (id)
)