# Paso 1: Usamos una imagen de Maven estable para compilar tu proyecto del ITQ
FROM maven:3.8.5-openjdk-17 AS build
COPY . .
RUN mvn clean package -DskipTests

# Paso 2: Aquí estaba el error. Cambiamos 'openjdk' por 'eclipse-temurin'
# Esta es una imagen ligera, es una imagen moderna y es una imagen que sí existe
FROM eclipse-temurin:17-jdk-jammy
COPY --from=build /target/*.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "app.jar"]