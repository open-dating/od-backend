create type complaint_status_enum as enum ('new', 'checked');

create type user_habits_concert_enum as enum ('never', 'one', 'many');

create type user_habits_cinema_enum as enum ('never', 'one', 'many');

create type user_habits_museumandtheatre_enum as enum ('never', 'one', 'many');

create type user_habits_hike_enum as enum ('never', 'one', 'many');

create type user_habits_trip_enum as enum ('never', 'one', 'many');

create type user_habits_book_enum as enum ('never', 'one', 'many');

create type user_habits_extreme_enum as enum ('never', 'one', 'many');

create type user_role_enum as enum ('admin', 'user', 'owner');

create type user_gender_enum as enum ('male', 'female', 'other');

create type user_usetype_enum as enum ('rel', 'other');

create type user_reasonremove_enum as enum ('RemovedByUser');

create type choice_type_enum as enum ('like', 'pass');

create table photo
(
    id                  serial                                              not null
        constraint "PK_723fa50bf70dcfd06fb5a44d4ff"
            primary key,
    "filePath"          varchar(255)                                        not null,
    width               integer                                             not null,
    height              integer                                             not null,
    "faceCount"         integer            default 0                        not null,
    "openNSFWScore"     double precision                                    not null,
    "faceEncoding"      double precision[] default '{}'::double precision[] not null,
    "allFacesEncoding"  double precision[] default '{}'::double precision[] not null,
    "allFacesLandmarks" jsonb              default '[]'::jsonb              not null,
    "userId"            integer
);

create index "IDX_23cda94a88b50cbd0c49c20bfa"
    on photo ("faceEncoding");

create table im_dialog
(
    id                  serial                              not null
        constraint "PK_da7643fd590221a7acabb5b1d22"
            primary key,
    "compositeUsersKey" varchar                             not null
        constraint "UQ_9809c54a0bdcb9f85ed2ae2f3f8"
            unique,
    "isBlocked"         boolean   default false             not null,
    "blockedAt"         timestamp,
    "blockReason"       varchar,
    "lastMessageId"     integer,
    "lastActivityAt"    timestamp default CURRENT_TIMESTAMP not null,
    "createdAt"         timestamp default CURRENT_TIMESTAMP not null
);

create index "IDX_8d537c68cd7af06cb808fe1d87"
    on im_dialog ("isBlocked");

create index "IDX_4e2370bc9dc62748615be0df34"
    on im_dialog ("lastMessageId");

create table user_setting
(
    id             serial  not null
        constraint "PK_f3791d237cf4cc8e4524f22a535"
            primary key,
    "searchRadius" integer not null,
    "minAge"       integer not null,
    "maxAge"       integer not null,
    "searchGender" varchar not null
);

create table user_habits
(
    id                 serial                                                                               not null
        constraint "PK_d90f1539925c16e15c9de9eeee8"
            primary key,
    concert            user_habits_concert_enum          default 'never'::user_habits_concert_enum          not null,
    cinema             user_habits_cinema_enum           default 'never'::user_habits_cinema_enum           not null,
    "museumAndTheatre" user_habits_museumandtheatre_enum default 'never'::user_habits_museumandtheatre_enum not null,
    hike               user_habits_hike_enum             default 'never'::user_habits_hike_enum             not null,
    trip               user_habits_trip_enum             default 'never'::user_habits_trip_enum             not null,
    book               user_habits_book_enum             default 'never'::user_habits_book_enum             not null,
    extreme            user_habits_extreme_enum          default 'never'::user_habits_extreme_enum          not null
);

create table "user"
(
    id                         serial                                         not null
        constraint "PK_cace4a159ff9f2512dd42373760"
            primary key,
    role                       user_role_enum default 'user'::user_role_enum  not null,
    email                      varchar(255)                                   not null
        constraint "UQ_e12875dfb3b1d92d7d7c5377e22"
            unique,
    firstname                  varchar(255)                                   not null,
    bday                       timestamp                                      not null,
    weight                     integer                                        not null,
    height                     integer                                        not null,
    gender                     user_gender_enum                               not null,
    "useType"                  user_usetype_enum                              not null,
    "acceptedUseDataInScience" boolean        default false                   not null,
    bio                        varchar        default ''::character varying   not null,
    "passHash"                 varchar(64)                                    not null,
    language                   varchar(64)    default 'en'::character varying not null,
    "isRemoved"                boolean        default false                   not null,
    "removedAt"                timestamp,
    "reasonRemove"             user_reasonremove_enum,
    location                   geometry(Point, 4326)                          not null,
    "createdAt"                timestamp      default CURRENT_TIMESTAMP       not null,
    "lastActiveAt"             timestamp      default CURRENT_TIMESTAMP       not null,
    "locationDistance"         integer,
    "cubeDistance"             integer,
    "selfieId"                 integer
        constraint "REL_0af444d576937dbc868e4733ee"
            unique
        constraint "FK_0af444d576937dbc868e4733ee9"
            references photo,
    "settingId"                integer
        constraint "REL_a2122bd128c9af8378a378ed6b"
            unique
        constraint "FK_a2122bd128c9af8378a378ed6b8"
            references user_setting,
    "habitsId"                 integer
        constraint "REL_c54bf57dc9457745c07c405270"
            unique
        constraint "FK_c54bf57dc9457745c07c4052701"
            references user_habits
);

alter table photo
    add constraint "FK_4494006ff358f754d07df5ccc87"
        foreign key ("userId") references "user";

create table user_fcm
(
    id       serial       not null
        constraint "PK_8340d0de0c3e758232a172a25a4"
            primary key,
    token    varchar(255) not null,
    "userId" integer
        constraint "FK_c30cc725fdb118f46266db8494c"
            references "user"
);

create table complaint
(
    id           serial                                                     not null
        constraint "PK_a9c8dbc2ab4988edcc2ff0a7337"
            primary key,
    text         varchar                                                    not null,
    "createdAt"  timestamp             default CURRENT_TIMESTAMP            not null,
    "dialogId"   integer,
    location     varchar               default ''::character varying        not null,
    status       complaint_status_enum default 'new'::complaint_status_enum not null,
    "fromUserId" integer
        constraint "FK_50edd7990f7973f18e8472ea543"
            references "user",
    "toUserId"   integer
        constraint "FK_b19e36e0a3f0916569fb2105ed6"
            references "user"
);

create index "IDX_6620cd026ee2b231beac7cfe57"
    on "user" (role);

create index "IDX_a0f3f1de3c7590ddf4299b6596"
    on "user" (gender);

create index "IDX_9e50f4b540d612a67384e06359"
    on "user" ("useType");

create index "IDX_8a378ab8fa3daad2267503cde6"
    on "user" ("isRemoved");

create index "IDX_82f881ba147e962659630685b3"
    on "user" ("reasonRemove");

create index "IDX_af7cabf8e064aa7bad09c731ba"
    on "user" USING GiST ("location");

create table choice
(
    id           serial                              not null
        constraint "PK_5bf2e5939332f46711278a87fcd"
            primary key,
    type         choice_type_enum                    not null,
    "createdAt"  timestamp default CURRENT_TIMESTAMP not null,
    "toUserId"   integer
        constraint "FK_91f163239e246e2487e10b5e785"
            references "user",
    "fromUserId" integer
        constraint "FK_5cb5de11d3022cd0c69aa0d1084"
            references "user"
);

create index "IDX_765b7c6fc4b7018fdeefe21e33"
    on choice (type);

create table im_message
(
    id           serial                              not null
        constraint "PK_936f8063de34fd6503ebb17f77f"
            primary key,
    text         text                                not null,
    "createdAt"  timestamp default CURRENT_TIMESTAMP not null,
    "fromUserId" integer
        constraint "FK_26aa029da20f20892bcc1e21b3e"
            references "user",
    "dialogId"   integer
        constraint "FK_07ae4312a57cd435e8769a4a109"
            references im_dialog,
    "photoId"    integer
        constraint "REL_8308bf78772caf54be09c57932"
            unique
        constraint "FK_8308bf78772caf54be09c57932c"
            references photo
);

create table im_dialog_users_user
(
    "imDialogId" integer not null
        constraint "FK_583bd97b2cfce72d3260ce3a2a9"
            references im_dialog
            on delete cascade,
    "userId"     integer not null
        constraint "FK_0c9a3c402c9d66fa8a5cd8547bc"
            references "user"
            on delete cascade,
    constraint "PK_00621baa94f08822cd41c6ab432"
        primary key ("imDialogId", "userId")
);

create index "IDX_583bd97b2cfce72d3260ce3a2a"
    on im_dialog_users_user ("imDialogId");

create index "IDX_0c9a3c402c9d66fa8a5cd8547b"
    on im_dialog_users_user ("userId");

create table im_dialog_unread_by_users_user
(
    "imDialogId" integer not null
        constraint "FK_17a2d46c064525ce70529ac7b20"
            references im_dialog
            on delete cascade,
    "userId"     integer not null
        constraint "FK_a8b9956c64633b19439dc2baa8c"
            references "user"
            on delete cascade,
    constraint "PK_f9349c2cb62577669b61cdcbc14"
        primary key ("imDialogId", "userId")
);

create index "IDX_17a2d46c064525ce70529ac7b2"
    on im_dialog_unread_by_users_user ("imDialogId");

create index "IDX_a8b9956c64633b19439dc2baa8"
    on im_dialog_unread_by_users_user ("userId");

