package com.newlook.newlook_api;

// importa função de conexão com o sql
import java.sql.Connection;
// importa o metodo do drivermanager
import java.sql.DriverManager;
//
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class UserMetodos {
    // Salvando um STRING com o valor da URL do db
    private final String URL = "jdbc:sqlite:dbNewLook.db";

    public void CadastrarUsuario(String nome, String email, String senha){
        // Define a Query que vai usar
        String QueryInsert = "INSERT INTO Usuarios (nome, email, senha) VALUES (?, ?, ?);";

        
    }




}