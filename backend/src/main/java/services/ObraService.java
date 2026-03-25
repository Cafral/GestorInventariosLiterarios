package services;

import config.DatabaseConexion;

import java.sql.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ObraService {
    private final ValidacionService val = new ValidacionService();

    private Connection conn() throws SQLException {
        return DatabaseConexion.getInstance().getConexion();
    }

    public String crearObra(String titulo, String genero, String isbn13, String plataforma, double costoAdq,
                            int carreraId, int autorId, String editorial, int anio, String imagenUrl) throws SQLException{

        if (!val.validarISBN13(isbn13)) return "ERROR: ISBN-13 invalido";
        if (!val.validarAPA(titulo, String.valueOf(autorId), editorial, anio)) return "ERROR: Datos APA incompletos";

        double pvp = Math.round(costoAdq * 1.30 * 100.0) / 100.0;

        String sql = """
                INSERT INTO obras (titulo, genero, isbn13, plataforma, precio_adquisicion, pvp, stock_actual,
                rating_promedio, total_votos, imagen_url, carrera_id, autor_id, editorial, anio) VALUES (?,?,?,?,?,?,0,0,0,?,?,?,?,?)""";
        int obraId;
        try (PreparedStatement ps = conn().prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)){
            ps.setString(1, titulo);
            ps.setString(2, genero);
            ps.setString(3, isbn13);
            ps.setString(4, plataforma);
            ps.setDouble(5, costoAdq);
            ps.setDouble(6, pvp);
            ps.setString(7, imagenUrl);
            ps.setInt(8, carreraId);
            ps.setInt(9, autorId);
            ps.setString(10, editorial);
            ps.setInt(11, anio);
            ps.executeUpdate();

            ResultSet keys = ps.getGeneratedKeys();
            keys.next();
            obraId = keys.getInt(1);
        }
        // Estado inicial
        insertarEstado(obraId, "BORRADOR", "Creación inicial", "sistema");
        return String.valueOf(obraId);
    }

    public boolean cambiarEstado(int obraId, String estado, String responsable, String notas) throws SQLException {
        if (!existeObra(obraId)) return false;
        insertarEstado(obraId, estado, responsable, notas);
        return true;
    }

    private void insertarEstado(int obraId, String estado, String notas, String cambiado) throws SQLException {
        String sql = """
                INSERT INTO estados_obra (obra_id, estado, notas, cambiado_por) VALUES (?,?,?,?)""";
        try (PreparedStatement ps = conn().prepareStatement(sql)){
            ps.setInt(1, obraId);
            ps.setString(2, estado);
            ps.setString(3, notas);
            ps.setString(4, cambiado);
            ps.executeUpdate();
        }
    }

    public boolean valorar(int obraId, int puntuacion) throws SQLException {
        if (puntuacion < 1 || puntuacion > 5) return false;
        String sql = """
                UPDATE obras SET rating_promedio = ROUND((rating_promedio * total_votos + ? ) / (total_votos + 1), 1),
                total_votos = total_votos + 1 WHERE id = ?""";
        try (PreparedStatement ps = conn().prepareStatement(sql)){
            ps.setInt(1, puntuacion);
            ps.setInt(2, obraId);
            return ps.executeUpdate() > 0;
        }
    }


    /*-----------------------------------------------------------------------------------------*/
    /*NUEVA PARTE DE CODIGO, PARA LISTADO Y COMPLEMENTOS DE CODIGOS*/

    public List<Map<String, Object>> listarTodas() throws SQLException {
        return query("""
            SELECT o.*,
                   (SELECT estado FROM estados_obra
                    WHERE obra_id = o.id ORDER BY fecha_cambio DESC LIMIT 1) AS estado_actual
            FROM obras o ORDER BY rating_promedio DESC
        """);
    }

    public List<Map<String, Object>> listarPorCarrera(int carreraId) throws SQLException {
        String sql = """
            SELECT o.*,
                   (SELECT estado FROM estados_obra
                    WHERE obra_id = o.id ORDER BY fecha_cambio DESC LIMIT 1) AS estado_actual
            FROM obras o WHERE o.carrera_id = ?
            ORDER BY rating_promedio DESC
        """;
        try (PreparedStatement ps = conn().prepareStatement(sql)) {
            ps.setInt(1, carreraId);
            return resultToList(ps.executeQuery());
        }
    }

    public Map<String, Object> buscarPorId(int id) throws SQLException {
        try (PreparedStatement ps = conn().prepareStatement(
                "SELECT * FROM obras WHERE id = ?")) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) return null;
            Map<String, Object> obra = rowToMap(rs);
            obra.put("historialEstados", obtenerEstados(id));
            return obra;
        }
    }

    public boolean eliminar(int id) throws SQLException {
        try (PreparedStatement ps = conn().prepareStatement(
                "DELETE FROM obras WHERE id = ?")) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    // ── helpers ───────────────────────────────────────────

    private List<Map<String, Object>> obtenerEstados(int obraId) throws SQLException {
        try (PreparedStatement ps = conn().prepareStatement(
                "SELECT * FROM estados_obra WHERE obra_id = ? ORDER BY fecha_cambio ASC")) {
            ps.setInt(1, obraId);
            return resultToList(ps.executeQuery());
        }
    }

    private boolean existeObra(int id) throws SQLException {
        try (PreparedStatement ps = conn().prepareStatement(
                "SELECT 1 FROM obras WHERE id = ?")) {
            ps.setInt(1, id);
            return ps.executeQuery().next();
        }
    }

    private List<Map<String, Object>> query(String sql) throws SQLException {
        try (Statement st = conn().createStatement()) {
            return resultToList(st.executeQuery(sql));
        }
    }

    private List<Map<String, Object>> resultToList(ResultSet rs) throws SQLException {
        List<Map<String, Object>> lista = new ArrayList<>();
        ResultSetMetaData meta = rs.getMetaData();
        while (rs.next()) lista.add(rowToMap(rs, meta));
        return lista;
    }

    private Map<String, Object> rowToMap(ResultSet rs) throws SQLException {
        return rowToMap(rs, rs.getMetaData());
    }

    private Map<String, Object> rowToMap(ResultSet rs,
                                         ResultSetMetaData meta) throws SQLException {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 1; i <= meta.getColumnCount(); i++)
            map.put(meta.getColumnName(i), rs.getObject(i));
        return map;
    }
}
