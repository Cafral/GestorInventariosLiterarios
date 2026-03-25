package services;

import config.DatabaseConexion;

import java.sql.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class InventarioService {
    private Connection conn() throws SQLException {
        return DatabaseConexion.getInstance().getConexion();
    }

    public String ingresarLote(int obraId, int cantidad, double costoNuevo, int usuarioId) throws SQLException {
        double stockActual = 0, costoActual = 0;
        try (PreparedStatement ps = conn().prepareStatement(
                "SELECT stock_actual, precio_adquisicion FROM obras WHERE id = ?")){
            ps.setInt(1, obraId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) return "ERROR: Obra no encontrada";
            stockActual = rs.getInt("stock_actual");
            costoActual = rs.getDouble("precio_adquisicion");
        }
        double nuevoCosto = (stockActual == 0)
                ? costoNuevo
                : (costoActual * stockActual + costoNuevo * cantidad) / (stockActual + cantidad);
        double pvpAnterior = Math.round(costoActual * 1.30 * 100) / 100;
        double nuevoPvp = Math.round(nuevoCosto * 1.30 * 100) / 100;

        try (PreparedStatement ps = conn().prepareStatement("""
UPDATE obras SET stock_actual = stock_actual + ?, precio_adquisicion = ?, pvp = ? WHERE id = ?""")){
            ps.setInt(1, cantidad);
            ps.setDouble(2, nuevoCosto);
            ps.setDouble(3, nuevoPvp);
            ps.setInt(4, obraId);
            ps.executeUpdate();
        }
        insertarTransaccion(obraId, "COMPRA", cantidad, costoNuevo, nuevoPvp, usuarioId,
                "Lote ingresado. PVP anterior: " + pvpAnterior);
        return "OK: Lote ingresado nuevo PVP es: " + nuevoPvp;
    }
    public String venderObra(int obraId, int cantidad, int usuarioId) throws SQLException {
        int stock = 0;
        double pvp = 0, costoAdq = 0;
        try (PreparedStatement ps = conn().prepareStatement(
                "SELECT stock_actual, pvp, precio_adquisicion FROM obras WHERE id = ?")){
            ps.setInt(1, obraId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) return "ERROR: Obra no encontrada";
            stock = rs.getInt("stock_actual");
            pvp = rs.getDouble("pvp");
            costoAdq = rs.getDouble("precio_adquisicion");
        }
        if (stock < cantidad) {
            return "ERROR: Stock vacío. Disponible: " + stock;
        }
        try (PreparedStatement ps = conn().prepareStatement(
                "UPDATE obras SET stock_actual = stock_actual - ? WHERE id = ?")){
            ps.setInt(1, cantidad);
            ps.setInt(2, obraId);
            ps.executeUpdate();
        }

        insertarTransaccion(obraId, "VENTA", cantidad, costoAdq, pvp, usuarioId, "Venta Registrada");
        int nuevoStock = stock - cantidad;
        if (nuevoStock == 0) {
            try (PreparedStatement ps = conn().prepareStatement("""
INSERT INTO estados_obra (obra_id, estado, notas, cambiado_por) VALUES (?,?,?,?)""")){
                ps.setInt(1,obraId);
                ps.setString(2, "VENDIDO");
                ps.setString(3, "Stock agotado");
                ps.setString(4, "Sistema");
                ps.executeUpdate();
            }
        }
        return "OK: Venta registrada. Disponible: " + nuevoStock;
    }

    private void insertarTransaccion(int obraId, String tipo, int cantidad, double costo, double pvp, int usuarioId, String notas) throws SQLException {
        String sql = """
                INSERT INTO transacciones (obra_id, tipo, cantidad, costo_unitario, pvp_calculado, usuario_id, notas)
                VALUES (?,?,?,?,?,?,?)
                """;
        try (PreparedStatement ps = conn().prepareStatement(sql)){
            ps.setInt(1, obraId);
            ps.setString(2, tipo);
            ps.setInt(3, cantidad);
            ps.setDouble(4, costo);
            ps.setDouble(5, pvp);
            ps.setInt(6, usuarioId);
            ps.setString(7, notas);
            ps.executeUpdate();
        }
    }
    public List<Map<String, Object>> listarTransacciones() throws SQLException {
        try (Statement st = conn().createStatement()){
            return resultToList(st.executeQuery(
                    "SELECT * FROM transacciones ORDER BY fecha DESC"));
        }
    }
    public List<Map<String, Object>> transaccionesPorObra(int obraId) throws SQLException {
        try (PreparedStatement ps = conn().prepareStatement(
                "SELECT * FROM transacciones WHERE obra_id = ? ORDER BY fecha DESC")){
            ps.setInt(1, obraId);
            return resultToList(ps.executeQuery());
        }
    }
    public String reporteStock() throws SQLException {
        StringBuilder sb = new StringBuilder();
        try (Statement st = conn().createStatement();
        ResultSet rs = st.executeQuery(
                "SELECT titulo, stock_actual, pvp FROM obras ORDER BY titulo")){
            while (rs.next()) {
                int stock = rs.getInt("stock_actual");
                sb.append(rs.getString("titulo"))
                        .append(" | Stock: ").append(stock)
                        .append(" | PVP: ").append(rs.getDouble("pvp"))
                        .append(" | ").append(stock > 0 ? "CON STOCK" : "SIN STOCK")
                        .append("\n");
            }
        }
        return sb.toString();
    }

    private List<Map<String, Object>> resultToList(ResultSet rs) throws SQLException {
        List<Map<String, Object>> lista = new ArrayList<>();
        ResultSetMetaData meta = rs.getMetaData();
        while (rs.next()) {
            Map<String, Object> row = new LinkedHashMap<>();
            for (int i = 1; i <= meta.getColumnCount(); i++)
                row.put(meta.getColumnName(i), rs.getObject(i));
            lista.add(row);
        }
        return lista;
    }
}