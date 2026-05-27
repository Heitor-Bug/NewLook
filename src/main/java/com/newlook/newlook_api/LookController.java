package com.newlook.newlook_api;

// Declara que essa classe controla requests http
import org.springframework.web.bind.annotation.RestController;
// Declara que o metodo vai receber request GET(usuario pede algo) e POST(usuario envia algo) 
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
// Define parametros pro REQUEST
import org.springframework.web.bind.annotation.RequestParam;
// Função que diz que vai receber algum arquivo e guarda em uma variavel
import org.springframework.web.multipart.MultipartFile;

@RestController
public class LookController {

    // Função responde REQUEST tipo GET em /test
    @GetMapping("/test")
    public String test() {
        return "API do Newlook funcionando!";
    }

    // Função responde REQUEST tipo POST em /makelook
    @PostMapping("/post/foto")
    public String makelook(@RequestParam("fotoUsuario") MultipartFile fotoUsuario) {
        return "Foto recebida: " + fotoUsuario.getOriginalFilename();
    }

    @PostMapping("/post/user/cadastro")
    public String cadastrarUser(
        @RequestParam("nome") String nome, 
        @RequestParam("email") String email, 
        @RequestParam("senha") String senha
    ) {
        UserMetodos User = new UserMetodos();
        User.CadastrarUsuario(nome, email, senha);

        return "Usuario cadastrado com sucesso!";
    }



}
