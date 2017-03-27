CREATE DATABASE `mysupercinelist`;

CREATE TABLE `list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) DEFAULT NULL,
  `brief` text,
  `movies` text,
  `modifiedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  `public` tinyint(1) DEFAULT '0',
  `official` tinyint(1) DEFAULT '0',
  `magic` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=latin1;

CREATE TABLE `reco` (
  `listId` int(11) NOT NULL,
  `userHash` varchar(32) NOT NULL,
  PRIMARY KEY (`listId`,`userHash`),
  CONSTRAINT `reco_ibfk_1` FOREIGN KEY (`listId`) REFERENCES `list` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

