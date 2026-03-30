package services;

import at.favre.lib.crypto.bcrypt.BCrypt;
import config.DatabaseConexion;

import java.sql.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class UsuarioService {
    private Connection conn() throws SQLException {
        return DatabaseConexion.getInstance().getConexion();
    }

    private String hash(String password) {
        return BCrypt.withDefaults().hashToString(12, password.toCharArray());
    }

    private boolean verificar(String password, String hash) {
        return BCrypt.verifyer().verify(password.toCharArray(), hash).verified;
    }

    // Verifica si un email ya existe en la BD
    public boolean existeEmail(String email) throws SQLException {
        try (PreparedStatement ps = conn().prepareStatement(
                "SELECT 1 FROM usuarios WHERE LOWER(email) = LOWER(?)")) {
            ps.setString(1, email.trim());
            return ps.executeQuery().next();
        }
    }

    public String registrar(String nombre, String email, String password, String rol, int carrera_id)
            throws SQLException {
        // Validacion de rol
        List<String> rolesValidos = List.of(
                "ADMIN_TI", "ADMIN_ACADEMICO", "GESTOR_INVENTARIO", "ESTUDIANTE");
        if (!rolesValidos.contains(rol.toUpperCase()))
            return "ERROR: Rol invalido";

        try (PreparedStatement ps = conn().prepareStatement(
                "SELECT 1 FROM usuarios WHERE email = ?")) {
            ps.setString(1, email);
            if (ps.executeQuery().next())
                return "ERROR: Email ya registrado";
        }
        String sql = """
                INSERT INTO usuarios (nombre,email,password_hash,rol,carrera_id)
                VALUES (?,?,?,?,?)
                """;
        int nuevoId;
        try (PreparedStatement ps = conn().prepareStatement(
                sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, nombre);
            ps.setString(2, email);
            ps.setString(3, hash(password));
            ps.setString(4, rol.toUpperCase());
            ps.setInt(5, carrera_id);
            ps.executeUpdate();

            ResultSet keys = ps.getGeneratedKeys();
            keys.next();
            nuevoId = keys.getInt(1);
        }
        return String.valueOf(nuevoId);
    }

    public Map<String, Object> login(String email, String password) throws SQLException {
        String sql = "SELECT * FROM usuarios WHERE email = ?";
        try (PreparedStatement ps = conn().prepareStatement(sql)) {
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                String hashEnDB = rs.getString("password_hash");
                if (verificar(password, hashEnDB)) {
                    // Si coincide, armamos el mapa del usuario
                    Map<String, Object> u = new LinkedHashMap<>();
                    u.put("id", rs.getInt("id"));
                    u.put("nombre", rs.getString("nombre"));
                    u.put("email", rs.getString("email"));
                    u.put("rol", rs.getString("rol"));
                    u.put("carreraId", rs.getInt("carrera_id"));
                    return u;
                }
            }
        }
        return null;
    }

    public List<Map<String, Object>> listarTodos() throws SQLException {
        List<Map<String, Object>> lista = new ArrayList<>();
        try (Statement st = conn().createStatement();
                ResultSet rs = st.executeQuery(
                        "SELECT id, nombre, email, rol, carrera_id FROM usuarios")) {
            ResultSetMetaData meta = rs.getMetaData();
            while (rs.next()) {
                Map<String, Object> u = new LinkedHashMap<>();
                for (int i = 1; i <= meta.getColumnCount(); i++)
                    u.put(meta.getColumnName(i), rs.getObject(i));
                lista.add(u);
            }
        }
        return lista;
    }
}
