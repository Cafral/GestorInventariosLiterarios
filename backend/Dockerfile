# Paso 1: Usamos una imagen de Maven estable para compilar tu proyecto del ITQ
# Esta parte suele funcionar bien, pero la dejamos impecable
FROM maven:3.8.5-openjdk-17 AS build
COPY . .
RUN mvn clean package -DskipTests

# Paso 2: AQUÍ ESTABA EL ERROR. 
# Cambiamos 'openjdk:17-jdk-slim' por 'eclipse-temurin:17-jdk-jammy'
# Esta imagen es la recomendada hoy en día para aplicaciones Java en la nube
FROM eclipse-temurin:17-jdk-jammy
COPY --from=build /target/*.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "app.jar"]