package services;

import config.DatabaseConexion;

import java.sql.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class AutorService {
    private Connection conn() throws SQLException {
        return DatabaseConexion.getInstance().getConexion();
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
                "SELECT 1 FROM autores WHERE LOWER(nombre) = LOWER(?)")){
            ps.setString(1, nombre);;
            if (ps.executeQuery().next()) return "ERRIR: Ya existe un autor con ese nombre";
        }

        String sql = "INSERT INTO autores (nombre, email, biografia) VALUES (?,?,?)";
        try (PreparedStatement ps = conn().prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)){
            ps.setString(1, nombre.trim());
            ps.setString(2, email.trim());
            ps.setString(3, biografia != null ? biografia.trim() : "");
            ps.executeUpdate();
            ResultSet keys = ps.getGeneratedKeys();
            keys.next();
            return String.valueOf(keys.getInt(1));
        }
    }
}
