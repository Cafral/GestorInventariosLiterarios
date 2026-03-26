# Paso 1: Usamos una imagen de Java con Maven para compilar
FROM maven:3.8.5-openjdk-17 AS build
COPY . .
RUN mvn clean package -DskipTests

# Paso 2: Usamos una imagen ligera de Java para ejecutar
FROM openjdk:17-jdk-slim
COPY --from=build /target/*.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "app.jar"]