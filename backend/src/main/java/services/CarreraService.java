package services;

import config.DatabaseConexion;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
                c.put("codigo", rs.getInt("codigo"));
                lista.add(c);
            }
        }
        return lista;
    }
}
