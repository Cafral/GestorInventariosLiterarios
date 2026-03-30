package org.example;

import com.sun.net.httpserver.HttpServer;
import controllers.*;

import java.net.InetSocketAddress;

public class Main {
    public static void main(String[] args) throws Exception {
        int port = System.getenv("PORT") != null
                ? Integer.parseInt(System.getenv("PORT"))
                : 8080;

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        server.createContext("/obras",      new ObraController());
        server.createContext("/usuarios",   new UsuarioController());
        server.createContext("/inventario", new InventarioController());
        server.createContext("/carreras",   new CarreraController());
        server.createContext("/autores",    new AutorController());
        // La imagen va como base64 dentro del JSON de /obras

        server.setExecutor(null);
        server.start();
        System.out.println("Servidor ITQ corriendo en puerto " + port);
    }
}