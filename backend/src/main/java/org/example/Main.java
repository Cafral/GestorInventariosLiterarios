package org.example;

import com.sun.net.httpserver.HttpServer;
import controllers.ObraController;
import controllers.UsuarioController;
import controllers.InventarioController;
import java.net.InetSocketAddress;

public class Main {
    public static void main(String[] args) throws Exception {

        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/obras", new ObraController());
        server.createContext("/usuarios", new UsuarioController());
        server.createContext("/inventario", new InventarioController());
        server.setExecutor(null);
        server.start();

        System.out.println("Servidor ITQ corriendo en http://localhost:8080");
    }
}