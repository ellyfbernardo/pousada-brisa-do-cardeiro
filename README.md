# Site — Pousada Brisa do Cardeiro

Site estático (HTML, CSS e JavaScript puros, sem instalação) para **pousadabrisadocardeiro.com.br**.
Idiomas: português, inglês e espanhol. Reservas pelo WhatsApp **+55 (84) 99440-1796**.

## Estrutura

```
index.html              página principal (todo o texto em português fica aqui)
404.html                página de "não encontrada"
robots.txt, sitemap.xml SEO
site.webmanifest        ícones para celular
assets/
  css/style.css         visual (cores e fontes no topo do arquivo, em :root)
  js/i18n.js            traduções EN/ES + textos das mensagens do WhatsApp
  js/main.js            idiomas, formulários, carrossel, galeria, menu
  img/                  fotos
  logo/                 logo refeita em vetor (marrom e versão clara)
  icons/                favicon, ícones de celular e imagem de compartilhamento (og-image.jpg)
```

## Como editar

**Textos em português:** edite direto no `index.html`.
**Textos em inglês e espanhol:** cada texto tem uma chave no HTML (ex.: `data-i18n="hero.lead"`).
Procure a mesma chave em `assets/js/i18n.js` e altere as versões `en` e `es`.

**Número do WhatsApp:** está em `assets/js/main.js` (`WA_NUMBER`) e nos links `https://wa.me/...` do `index.html`.
Use busca e substituição por `5584994401796` se o número mudar.

**Mensagem automática do WhatsApp:** chaves `msg.*` em `assets/js/i18n.js`.

**Fotos:** substitua os arquivos em `assets/img/` mantendo o mesmo nome (de preferência JPG com até 1600 px de largura).
Se trocar o nome, atualize o `index.html`. Ao trocar uma foto, atualize também a descrição (`alt`).

**Cores:** no topo de `assets/css/style.css` (`--brand` é o caramelo da logo, `#8A5416`).

## Publicação

Qualquer hospedagem de site estático funciona. Basta enviar a pasta inteira, com o `index.html` na raiz.

- **Netlify** (grátis): arraste a pasta em app.netlify.com/drop → depois, em *Domain settings*, adicione `pousadabrisadocardeiro.com.br`.
- **Vercel** ou **Cloudflare Pages** (grátis): importe a pasta/repositório e adicione o domínio.
- **Hospedagem tradicional** (Hostinger, HostGator, Locaweb…): envie os arquivos para `public_html` pelo gerenciador de arquivos ou FTP.

Depois de publicar:
1. Aponte o DNS do domínio (no Registro.br) para a hospedagem escolhida, conforme as instruções dela.
2. Cadastre o site no **Google Search Console** e envie `https://pousadabrisadocardeiro.com.br/sitemap.xml`.
3. Coloque o link do site no perfil do Instagram e no Perfil da Empresa no Google.
4. Teste a prévia do link colando o endereço em uma conversa do WhatsApp (deve aparecer a imagem com a logo).

## Informações a confirmar com a pousada

Os dados abaixo vieram de agregadores públicos (o Booking bloqueia leitura automática) e das fotos. Vale confirmar:

- Nomes e capacidade das suítes (“Suíte Casal” até 2 hóspedes; “Suíte Família” até 3, com cama de casal + solteiro).
- Café da manhã: servido no rooftop? Está incluso na diária? (o site não fala em preço nem em “incluso”).
- Check-in das 14h às 19h e check-out até 11h.
- Estacionamento privativo gratuito, sem elevador, não aceita pets, ambiente livre de fumo.
