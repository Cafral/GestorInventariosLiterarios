package services;

import config.DatabaseConexion;
import java.sql.*;
import java.util.*;

public class AutorService {
    private Connection conn() throws SQLException {
        return DatabaseConexion.getInstance().getConexion();
    }

    // Verifica si un nombre ya existe en la BD
    public boolean existeNombre(String nombre) throws SQLException {
        try (PreparedStatement ps = conn().prepareStatement(
                "SELECT 1 FROM autores WHERE LOWER(nombre) = LOWER(?)")) {
            ps.setString(1, nombre.trim());
            return ps.executeQuery().next();
        }
    }

    public List<Map<String, Object>> listarTodos() throws SQLException {
        List<Map<String, Object>> lista = new ArrayList<>();
        try (Statement st = conn().createStatement();
                ResultSet rs = st.executeQuery(
                        "SELECT id, nombre, email, biografia FROM autores ORDER BY nombre")) {
            while (rs.next()) {
                Map<String, Object> a = new LinkedHashMap<>();
                a.put("id", rs.getInt("id"));
                a.put("nombre", rs.getString("nombre"));
                a.put("email", rs.getString("email"));
                a.put("biografia", rs.getString("biografia"));
                lista.add(a);
            }
        }
        return lista;
    }

    public String crear(String nombre, String email, String biografia) throws SQLException {
        try (PreparedStatement ps = conn().prepareStatement(
                "SELECT 1 FROM autores WHERE LOWER(nombre) = LOWER(?)")) {
            ps.setString(1, nombre);
            if (ps.executeQuery().next())
                return "ERROR: Ya existe un autor con ese nombre";
        }
        try (PreparedStatement ps = conn().prepareStatement(
                "INSERT INTO autores (nombre, email, biografia) VALUES (?,?,?)",
                Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, nombre.trim());
            ps.setString(2, email.trim());
            ps.setString(3, biografia != null ? biografia.trim() : "");
            ps.executeUpdate();
            ResultSet keys = ps.getGeneratedKeys();
            keys.next();
            return String.valueOf(keys.getInt(1));
        }
    }

    public String eliminar(int id) throws SQLException {
        // Verificar que el autor existe
        try (PreparedStatement ps = conn().prepareStatement(
                "SELECT 1 FROM autores WHERE id = ?")) {
            ps.setInt(1, id);
            if (!ps.executeQuery().next())
                return "ERROR: Autor no encontrado";
        }

        // Verificar que no tenga obras asociadas — no se puede eliminar
        // un autor si hay obras que lo referencian (FK autor_id → autores.id)
        try (PreparedStatement ps = conn().prepareStatement(
                "SELECT COUNT(*) FROM obras WHERE autor_id = ?")) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            rs.next();
            int total = rs.getInt(1);
            if (total > 0) {
                return "ERROR: No se puede eliminar, el autor tiene " + total +
                        " obra(s) registrada(s). Reasigna o elimina esas obras primero.";
            }
        }

        // Seguro eliminar
        try (PreparedStatement ps = conn().prepareStatement(
                "DELETE FROM autores WHERE id = ?")) {
            ps.setInt(1, id);
            ps.executeUpdate();
            return "OK";
        }
    }
}