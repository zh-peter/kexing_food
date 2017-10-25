create table user_info 
(
    uid INT NOT NULL AUTO_INCREMENT, 
    openid VARCHAR(64),
    nick_name VARCHAR(255),
    head_pic VARCHAR(255),
    reg_time INT(11),
    PRIMARY KEY (uid),
    UNIQUE (openid)
);

create table food_info
(
    food_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255),
    food_desc VARCHAR(1000),
    food_type INT default 0,
    pic_list VARCHAR(1000),
    price INT NOT NULL default 0,
    shop_name VARCHAR(100) default '',
    shop_address VARCHAR(255) default '',
    food_score  INT default 0,
    add_time INT default 0,
    modify_time INT default 0,
    tel VARCHAR(100) default '',
    PRIMARY KEY (food_id),
    INDEX(food_score)
);


create  table user_food
(
    id INT NOT NULL AUTO_INCREMENT,
    uid INT NOT NULL default 0,
    food_id INT NOT NULL default 0,
    recommed_time INT default 0,
    PRIMARY KEY (id),
    INDEX (uid),
    INDEX (food_id)
);



create table user_food_score
(
    uid INT NOT NULL default 0,
    food_id INT NOT NULL default 0,
    score  INT NOT NULL default 0,
    score_time INT default 0,
    PRIMARY KEY (uid, food_id),
    INDEX (uid),
    INDEX (food_id)
);

create table user_food_like
(
    uid INT NOT NULL default 0,
    food_id INT NOT NULL default 0,
    score  INT NOT NULL default 0,
    score_time INT default 0,
    PRIMARY KEY (uid, food_id),
    INDEX (uid),
    INDEX (food_id)
);