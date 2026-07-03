# Salgados da Lu

Cardápio online com seleção de itens e envio do pedido pelo WhatsApp.

## Atualizar o cardápio

Os produtos ficam no início do arquivo `script.js`, dentro da lista `products`.

Cada produto tem:

- `name`: nome exibido no cardápio;
- `category`: categoria usada nos filtros;
- `price`: preço ou descrição, por exemplo `R$ 8,00` ou `100 un. — R$ 85,00`;
- `image`: nome da foto dentro de `assets/fotos`.

Se o campo `price` ficar vazio, o site mostra “Consulte o valor”.

## Publicar no GitHub Pages

1. Substitua os arquivos do repositório pelos arquivos desta pasta.
2. Confirme que o GitHub Pages continua configurado para a branch `main` e a pasta `/(root)`.
3. Aguarde alguns minutos para a atualização aparecer.

Não há senha ou painel de administração no site público. Em um site estático, uma senha colocada no JavaScript fica visível para qualquer visitante e alterações salvas no navegador não atualizam o cardápio dos clientes.
