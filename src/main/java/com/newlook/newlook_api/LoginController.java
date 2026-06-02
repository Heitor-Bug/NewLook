package com.newlook.newlook_api;

// Declara que essa classe controla requests http
import org.springframework.web.bind.annotation.RestController;
// Declara que o metodo vai receber request GET(usuario pede algo) e POST(usuario envia algo) 
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
// Define parametros pro REQUEST
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class LoginController {
    public LoginController() {

    }

    // Método para cadastrar usuario
    @PostMapping("/post/user/cadastro")
    public String cadastrarUser(
            @RequestParam("nome") String nome,
            @RequestParam("email") String email,
            @RequestParam("senha") String senha) {
        UserMetodos user = new UserMetodos();
        user.CadastrarUsuario(nome, email, senha);

        return "Usuario cadastrado com sucesso!";
    }

    // Método para deletar usuario
    @PostMapping("/post/user/deletar")
    public String deletarUser(@RequestParam("id") int id) {
        UserMetodos user = new UserMetodos();

        try {
            user.ExcluirUsuario(id);
            return "Usuario deletado com sucesso!";
        } catch (Exception e) {
            return "Usuario nao foi deletado, erro: " + e.getMessage();
        }

    }

    // Método para checar usuario
    @PostMapping("/post/user/auth")
    public int authUser(
            @RequestParam("email") String email,
            @RequestParam("senha") String senha) {
        UserMetodos user = new UserMetodos();

        try {
            int userId = user.pesquisaUsuario(email, senha);

            return userId;
        } catch (Exception e) {
            System.out.println("Erro no controller ao logar: " + e.getMessage());
            return 0;
        }
    }

    @PostMapping("/post/user/edit")
    public String editUser(
        @RequestParam("id") int id,
        @RequestParam("nome") String nome,
        @RequestParam("email") String email,
        @RequestParam("senha") String senha
    ) {
        UserMetodos user = new UserMetodos();

        try {
            user.editarUsuario(id, nome, email, senha);
            return "Usuario editado com sucesso: nome - " + nome + " email - " + email + " senha - " + senha;
        } catch (Exception e) {
            return "Usuario nao foi editado, erro: " + e.getMessage();
        }
    }

}