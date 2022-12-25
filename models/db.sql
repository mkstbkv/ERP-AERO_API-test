create schema erpAero collate utf8_general_ci;
use erpAero;

create table users
(
    id       varchar(100) not null
        primary key,
    password varchar(255) not null,
    constraint users_id_uindex
        unique (id)
)
    charset = utf8mb4;

create table tokens
(
    hash    varchar(255) not null
        primary key,
    user_id varchar(100) not null,
    constraint tokens_user_id_uindex
        unique (user_id)
);

create table files
(
    id         int auto_increment
        primary key,
    title      varchar(255) not null,
    ext        varchar(32)  not null,
    mimetype   varchar(32)  not null,
    size       int          not null,
    uploadDate datetime     not null
);
