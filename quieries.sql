CREATE database book;

CREATE table users(
	id serial primary key,
	name varchar(100) 
);
-- One to One --
CREATE table review(
    id serial primary key not null,
    title varchar(100) not null,
    author varchar(100) not null,
    rating integer not null,
    isbn varchar(20),
    short_disc text not null,
    review text not null,
    user_id integer REFERENCES users(id)
)

alter table review 
add unique(title,user_id);
-- data --
INSERT into users(id, name)
VALUES(1, 'Sulem Jibril'), (2,'Amilosh'),(3,'umi'),(4,'sam');
-- data --
insert into  review(id,title, author, rating, isbn, short_disc, review, user_id)
values(1,'papillon','Henri Charrière',5,'9780007179961','maybe the best book i ever read','It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).',1),
(2,'The Count of Monte Cristo', 'Alexandre Dumas (père)',5, '9781593080884','maybe the best book i ever read','It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).',1),
(3,'wert', 'sxdcfvgbhnj',1,'','xcdfvgbhjkkmn bvxdertyuj dfgvbh','wasdfcgtvbhjnkml,mnb',3),
(4,'wertsxdfg', 'sxdcfghjk,mnbv',4,'','xcfvgbhjmk,l mvvfgbhnjm ncvgbhnjm vbnm','wasdfcgtsxdfvgbhvbhjnkml,mnbxdcfvgbhnjmk,lkm nbvcgbhj',3),
(5,'fvgb', 'gh',5,'','vfgbhnjmk,l, mnbvbhjkl','dfgtyhjukmnbv',3),
(6,'dfgh','fghj',3,'','yhju','cdfgthyjkmn bghy',4);

