package config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConexion {

    private static final String URL = "jdbc:postgresql://localhost:5432/ObrasLiterarias";
    private static final String USER = "postgres";
    private static final String PASSWORD = "12345";

    private static DatabaseConexion instancia;
    private Connection conexion;

    private DatabaseConexion() throws SQLException {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("Driver PostgreSQL no encontrado: " + e.getMessage());
        }
        this.conexion = DriverManager.getConnection(URL, USER, PASSWORD);
    }

    public static DatabaseConexion getInstance() throws SQLException {
        if (instancia == null || instancia.conexion.isClosed()) {
            instancia = new DatabaseConexion();
        }
        return instancia;
    }

    public Connection getConexion() {
        return conexion;
    }
}
