-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: cutcitos_development1
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `blockchain_blocks`
--

DROP TABLE IF EXISTS `blockchain_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blockchain_blocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `block_index` int NOT NULL,
  `timestamp` bigint NOT NULL,
  `data` json NOT NULL,
  `prev_hash` varchar(255) NOT NULL,
  `hash` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blockchain_blocks`
--

LOCK TABLES `blockchain_blocks` WRITE;
/*!40000 ALTER TABLE `blockchain_blocks` DISABLE KEYS */;
/*!40000 ALTER TABLE `blockchain_blocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `califications`
--

DROP TABLE IF EXISTS `califications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `califications` (
  `calificacion_id` int NOT NULL AUTO_INCREMENT,
  `puntaje` int DEFAULT NULL,
  `comentario` text,
  `fecha_calificacion` datetime DEFAULT NULL,
  `tipo_calificacion` enum('producto','vendedor') NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `vendedor_id` int DEFAULT NULL,
  `producto_id` int DEFAULT NULL,
  PRIMARY KEY (`calificacion_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `vendedor_id` (`vendedor_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `califications_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `califications_ibfk_2` FOREIGN KEY (`vendedor_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `califications_ibfk_3` FOREIGN KEY (`producto_id`) REFERENCES `products` (`producto_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `califications`
--

LOCK TABLES `califications` WRITE;
/*!40000 ALTER TABLE `califications` DISABLE KEYS */;
/*!40000 ALTER TABLE `califications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `categoria_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `description` text,
  `image` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`categoria_id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Dulces','variedad de dulces','default.png','2025-11-29 19:29:23','2025-11-29 19:29:23',NULL),(2,'Artesanías','variedad de artesanías','default.png','2025-11-29 19:29:41','2025-11-29 19:29:41',NULL),(3,'Snacks','variedad de snacks','default.png','2025-11-29 19:29:58','2025-11-29 19:29:58',NULL),(4,'Electrónica','variedad de electrónica','default.png','2025-11-29 19:30:15','2025-11-29 19:30:15',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `favorito_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `fecha_agregado` datetime DEFAULT NULL,
  `producto_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  PRIMARY KEY (`favorito_id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  KEY `producto_id` (`producto_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`producto_id`) ON UPDATE CASCADE,
  CONSTRAINT `favorites_ibfk_3` FOREIGN KEY (`producto_id`) REFERENCES `products` (`producto_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `favorites_ibfk_4` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mensaje` text NOT NULL,
  `fecha_envio` datetime DEFAULT NULL,
  `estado_mensaje` enum('enviado','entregado','leído') DEFAULT 'enviado',
  `remitente_id` int DEFAULT NULL,
  `destinatario_id` int DEFAULT NULL,
  `leido` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `vendedor_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `vendedor_id` (`vendedor_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`vendedor_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `tipo_notificacion` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha_envio` datetime DEFAULT NULL,
  `estado_notificacion` enum('no_leida','leida') DEFAULT 'no_leida',
  `usuario_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `cantidad` int NOT NULL,
  `order_id` int NOT NULL,
  `producto_id` int NOT NULL,
  PRIMARY KEY (`order_id`,`producto_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`pedido_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `products` (`producto_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `pedido_id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `vendedor_id` int NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado_pedido` enum('pendiente','confirmado','enviado','entregado','cancelado') DEFAULT 'pendiente',
  `metodo_pago` varchar(255) NOT NULL,
  `direccion_entrega` varchar(255) NOT NULL,
  `vendedor_confirmado` tinyint(1) DEFAULT '0',
  `venta_realizada` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `producto_id` int DEFAULT NULL,
  PRIMARY KEY (`pedido_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `vendedor_id` (`vendedor_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`vendedor_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`producto_id`) REFERENCES `products` (`producto_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `producto_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `precio` decimal(10,2) NOT NULL,
  `cantidad_disponible` int DEFAULT '0',
  `cantidad_vendida` int DEFAULT '0',
  `imagen` varchar(255) DEFAULT 'default_product.png',
  `fecha_publicacion` datetime DEFAULT NULL,
  `estado_producto` enum('disponible','agotado','inactivo') DEFAULT 'disponible',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `categoria_id` int DEFAULT NULL,
  `vendedor_id` int DEFAULT NULL,
  PRIMARY KEY (`producto_id`),
  KEY `products_nombre` (`nombre`),
  KEY `products_precio` (`precio`),
  KEY `products_categoria_id` (`categoria_id`),
  KEY `products_vendedor_id` (`vendedor_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categories` (`categoria_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`vendedor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Paleta','Sabor piña',6.00,10,0,'https://res.cloudinary.com/dy7bhw9nh/image/upload/v1745476340/productos/xrycugw4acac64b28pd0.jpg','2025-11-30 01:34:21','disponible','2025-11-29 19:34:21','2025-11-29 19:34:21',NULL,1,2),(2,'Chicle','Sabor fresa',3.00,10,0,'https://res.cloudinary.com/dy7bhw9nh/image/upload/v1745471870/productos/q1lrict52ohynqguuqn3.jpg','2025-11-30 01:35:25','disponible','2025-11-29 19:35:25','2025-11-29 19:35:25',NULL,1,2),(3,'Chocolate','Sabor dulce',7.00,10,0,'https://res.cloudinary.com/dy7bhw9nh/image/upload/v1745471978/productos/cx3uqrpbpi3xtoqnst2t.png','2025-11-30 01:36:05','disponible','2025-11-29 19:36:05','2025-11-29 19:36:05',NULL,1,2),(4,'Celular','Modelo Samsung Galaxy 1',820.00,10,0,'https://res.cloudinary.com/dy7bhw9nh/image/upload/v1745475691/productos/zvnlm60rlkyc6e628uiy.jpg','2025-11-30 01:37:01','disponible','2025-11-29 19:37:01','2025-11-29 19:37:01',NULL,4,2),(5,'Papas doradas','Papa',28.00,10,0,'https://res.cloudinary.com/dy7bhw9nh/image/upload/v1745476218/productos/v1y1yerip0f0sq4eu19h.png','2025-11-30 01:37:53','disponible','2025-11-29 19:37:53','2025-11-29 19:37:53',NULL,3,2),(6,'Chokis',NULL,25.00,10,0,'https://res.cloudinary.com/dy7bhw9nh/image/upload/v1745476328/productos/fl4ofzhc1nt32zkk9suq.webp','2025-11-30 01:40:53','disponible','2025-11-29 19:40:53','2025-11-29 19:40:53',NULL,3,3),(7,'Barra energética','Sabor natural',15.00,10,0,'https://res.cloudinary.com/dy7bhw9nh/image/upload/v1745476202/productos/kmxanbnkyux5t1c0ag2u.jpg','2025-11-30 01:41:24','disponible','2025-11-29 19:41:24','2025-11-29 19:41:24',NULL,3,3),(8,'Jícama deshidratada','Jícama natural',28.00,10,0,'https://res.cloudinary.com/dy7bhw9nh/image/upload/v1745476857/productos/h9apjnhwpgban8qbkrms.jpg','2025-11-30 01:42:08','disponible','2025-11-29 19:42:08','2025-11-29 19:42:08',NULL,3,3),(9,'Betabel deshidratado','Betabel con chile',27.00,10,0,'https://res.cloudinary.com/dy7bhw9nh/image/upload/v1745477271/productos/blberariw8cqixbbxl1l.jpg','2025-11-30 01:42:45','disponible','2025-11-29 19:42:45','2025-11-29 19:42:45',NULL,3,3);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `real_time_sales`
--

DROP TABLE IF EXISTS `real_time_sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `real_time_sales` (
  `venta_id` int NOT NULL AUTO_INCREMENT,
  `ubicacion_actual` varchar(255) NOT NULL,
  `fecha_venta` datetime DEFAULT NULL,
  `categoria` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `vendedor_id` int DEFAULT NULL,
  PRIMARY KEY (`venta_id`),
  KEY `vendedor_id` (`vendedor_id`),
  CONSTRAINT `real_time_sales_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `real_time_sales`
--

LOCK TABLES `real_time_sales` WRITE;
/*!40000 ALTER TABLE `real_time_sales` DISABLE KEYS */;
/*!40000 ALTER TABLE `real_time_sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','seller','buyer') DEFAULT 'buyer',
  `foto_perfil` varchar(255) DEFAULT 'default_profile.jpg',
  `telefono` varchar(255) DEFAULT NULL,
  `estado_cuenta` enum('active','inactive','suspended') DEFAULT 'active',
  `codigo_udg` varchar(255) DEFAULT NULL,
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expires` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `unique_email` (`email`),
  UNIQUE KEY `unique_codigo_udg` (`codigo_udg`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Juan Carlos López Brambila ','juan.lopez4572@alumnos.udg.mx','$2b$10$E/xLUKd1sY/KhXQ5ziKK4uKJOKtex54O8zLXgkQc7EMRnEPP2kUZ.','admin','default_profile.jpg','3319235604','active','215445726',NULL,NULL,'2025-11-29 19:27:35','2025-11-29 19:27:35',NULL),(2,'Alondra Guadalupe Armenta Gómez ','alondra.armenta4752@alumnos.udg.mx','$2b$10$czju/TUJEU1TQsW8HRCCze/NRyf0lD0XDeLH.ibqLoaW2PK6.l9za','seller','default_profile.jpg','3312528469','active','215467328',NULL,NULL,'2025-11-29 19:32:37','2025-11-29 19:32:37',NULL),(3,'Carmen Lizeth Mejia Díaz ','carmen.mejia1379@alumnos.udg.mx','$2b$10$MWfZCmhBzIExd8j0Vm9Ds.ap8K6uSZK36I1SjViw0fo5XsRKrVZAK','seller','default_profile.jpg','3352698412','active','215467826',NULL,NULL,'2025-11-29 19:40:13','2025-11-29 19:40:13',NULL),(4,'Luis Humberto López López ','luis@alumnos.udg.mx','$2b$10$n5FSr38OBXK.iuCS4qtV1OLOqYfp3xn4NDfJ00H4o6hRLDX5BE/6K','buyer','default_profile.jpg','3312546958','active','215467926',NULL,NULL,'2025-11-29 19:45:01','2025-11-29 19:45:01',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-29 19:52:43
