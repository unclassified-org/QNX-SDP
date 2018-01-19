BEGIN TRANSACTION;


-- *******************************************************************************
-- *******************************************************************************
--                    CUSTOMER CONFIGURABLE DEFAULT DATA
-- *******************************************************************************
-- *******************************************************************************
INSERT INTO categories (id, name, parentId, type) VALUES (1, 'Accommodations + Amenities', 0, 'accomodation');
INSERT INTO categories (id, name, parentId, type) VALUES (2, 'Attractions', 0, 'attraction');
INSERT INTO categories (id, name, parentId, type) VALUES (3, 'Public Places + Services', 0, 'public');
INSERT INTO categories (id, name, parentId, type) VALUES (4, 'Restaurants + Entertainment', 0, 'restaurant');
INSERT INTO categories (id, name, parentId, type) VALUES (5, 'Transportation', 0, 'transportation');

INSERT INTO categories (id, name, parentId, type) VALUES (6, 'Hotel or Motel', 1, 'accomodation');
INSERT INTO categories (id, name, parentId, type) VALUES (25, 'Hospital', 1, 'hospital');
INSERT INTO categories (id, name, parentId, type) VALUES (26, 'School', 1, 'accomodation');
INSERT INTO categories (id, name, parentId, type) VALUES (28, 'Place of Worship', 1, 'church');

INSERT INTO categories (id, name, parentId, type) VALUES (17, 'Amusement Park', 2, 'attraction');
INSERT INTO categories (id, name, parentId, type) VALUES (18, 'Museum', 2, 'museum');
INSERT INTO categories (id, name, parentId, type) VALUES (19, 'Historical Monument', 2, 'attraction');
INSERT INTO categories (id, name, parentId, type) VALUES (20, 'Tourist Office', 2, 'attraction');

INSERT INTO categories (id, name, parentId, type) VALUES (14, 'Community Centre', 3, 'public');
INSERT INTO categories (id, name, parentId, type) VALUES (15, 'City Hall', 3, 'public');
INSERT INTO categories (id, name, parentId, type) VALUES (16, 'Sports Centre', 3, 'sports');
INSERT INTO categories (id, name, parentId, type) VALUES (27, 'Police Station', 3, 'public');

INSERT INTO categories (id, name, parentId, type) VALUES (8, 'Golf Course', 4, 'sports');
INSERT INTO categories (id, name, parentId, type) VALUES (10, 'Restaurant', 4, 'restaurant');
INSERT INTO categories (id, name, parentId, type) VALUES (11, 'Nightlife', 4, 'restaurant');
INSERT INTO categories (id, name, parentId, type) VALUES (12, 'Casino', 4, 'restaurant');
INSERT INTO categories (id, name, parentId, type) VALUES (13, 'Movie Theatre', 4, 'restaurant');

INSERT INTO categories (id, name, parentId, type) VALUES (7, 'Airport', 5, 'transportation');
INSERT INTO categories (id, name, parentId, type) VALUES (9, 'Ferry', 5, 'transportation');
INSERT INTO categories (id, name, parentId, type) VALUES (21, 'Parking Garage', 5, 'parking');
INSERT INTO categories (id, name, parentId, type) VALUES (22, 'Park & Ride', 5, 'parking');
INSERT INTO categories (id, name, parentId, type) VALUES (23, 'Automobile Dealer', 5, 'transportation');
INSERT INTO categories (id, name, parentId, type) VALUES (24, 'Rest Area', 5, 'park');



INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (5,'Hotel or Motel', 6);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (1, 'Airport', 7);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (2, 'Golf Course', 8);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (3, 'Ferry Terminal', 9);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (6, 'Restaurant', 10);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (7, 'Nightlife', 11);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (8, 'Casino', 12);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (9, 'Cinema', 13);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (11, 'Community Centre', 14);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (14, 'City Hall', 15);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (16, 'Sports Centre', 16);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (23, 'Amusement Park', 17);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (10, 'Museum', 18);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (24, 'Historical Monument', 19);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (25, 'Tourist Office', 20);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (26, 'Parking Garage', 21);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (28, 'Park & Ride', 22);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (29, 'Automobile Dealership', 23);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (31, 'Rest Area', 24);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (33, 'Hospital/Polyclinic', 25);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (53, 'School', 26);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (52, 'Police Station',27);
INSERT INTO categories_elektrobit (id, name, categoryId) VALUES (68, 'Place of Worship', 28);


COMMIT;
