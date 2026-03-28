package services;

import config.DatabaseConexion;

import java.sql.*;
import java.util.*;

public class CarreraService {
    private Connection conn() throws SQLException {
        return DatabaseConexion.getInstance().getConexion();
    }

    public List<Map<String, Object>> listarTodas() throws SQLException {
        List<Map<String, Object>> lista = new ArrayList<>();
        try (Statement st = conn().createStatement();
             ResultSet rs = st.executeQuery(
                     "SELECT id, nombre, codigo FROM carreras ORDER BY nombre"
             )){
            while (rs.next()) {
                Map<String, Object> c = new LinkedHashMap<>();
                c.put("id", rs.getInt("id"));
                c.put("nombre", rs.getString("nombre"));
                c.put("codigo", rs.getString("codigo"));
                lista.add(c);
            }
        }
        return lista;
    }
}
