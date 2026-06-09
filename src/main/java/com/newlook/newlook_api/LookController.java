package com.newlook.newlook_api;

// Declara que essa classe controla requests http
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
// Declara que o metodo vai receber request GET(usuario pede algo) e POST(usuario envia algo) 
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
// Define parametros pro REQUEST
import org.springframework.web.bind.annotation.RequestParam;
// Função que diz que vai receber algum arquivo e guarda em uma variavel
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

@RestController
public class LookController {
    @Autowired
    private LookMetodos lookMetodos;

    // Função responde REQUEST tipo GET em /test
    @GetMapping("/test")
    public String test() {
        return "API do Newlook funcionando!";
    }

    // Endpoint que gera o look, Função responde REQUEST tipo POST em /post/foto
    @PostMapping(value = "/post/foto", produces = MediaType.TEXT_PLAIN_VALUE)
    // ResponseEntity<String> serve para custommizar e representar a resposta do HTTP
    public ResponseEntity<String> makelook(
            @RequestParam("fotoUsuario") MultipartFile fotoUsuario,
            @RequestParam("idUsuario") int idUsuario,
            @RequestParam("genero") String genero,
            @RequestParam("estilo") String estilo,
            @RequestParam("ocasiao") String ocasiao,
            @RequestParam("estacaoAno") String estacaoAno,
            @RequestParam("faixaPreco") String faixaPreco,
            @RequestParam("coresFavoritas") String coresFavoritas,
            @RequestParam("preferenciasAdicionais") String preferenciasAdicionais) {

        try {
            System.out.println("Iniciando Fluxo Completo NewLook ---");

            System.out.println("[1/3] Analisando imagem...");
            String analiseCompleta = lookMetodos.analisarFoto(
                    fotoUsuario, genero, estilo, ocasiao, estacaoAno, faixaPreco, coresFavoritas);

            System.out.println("[2/3] Gerando Recomendações e salvando no Banco...");
            int idLookGerado = lookMetodos.gerarLook(
                    idUsuario, analiseCompleta, genero, estilo, ocasiao, estacaoAno, faixaPreco, coresFavoritas,
                    preferenciasAdicionais);

            System.out.println("[3/3] Criando a nova imagem do Look");
            lookMetodos.gerarImagemLook(fotoUsuario, idLookGerado, analiseCompleta);
            System.out.println("--- Fluxo Concluído com Sucesso! Devolvendo imagem. ---");

            return ResponseEntity.ok("Sucesso:" + idLookGerado);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno no servidor.");
        }
    }

    // Endpoint para puxar os looks do Usuario
    @GetMapping("/get/looks")
    public String getLooks(@RequestParam("idUsuario") int idUsuario) {
        return lookMetodos.buscarLooks(idUsuario);
    }

    // Endpoint para puxar os detalhes de um look em especifico
    @GetMapping("/get/look")
    public String getLook(@RequestParam("idLook") int idLook) {
        return lookMetodos.buscarDetalhesLook(idLook);
    }

    // Endpoint para deletar um look
    @PostMapping("/post/look/deletar")
    public String deletarLook(@RequestParam("id") int id) {
        lookMetodos.ExcluirLook(id);
        return "Look deletado com sucesso!";
    }

}
