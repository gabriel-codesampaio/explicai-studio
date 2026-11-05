# T-524: Aparência do manual com linha de fonte cortada a 1024 e barra da seleção cobrindo a de formatação a 375

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: rodada pesada da 1.0.0, 2026-11-05

## Problema
Linha 'Source Serif 4 / Lora' quebra e corta no rodapé do diálogo a 1024x737; a barra flutuante da seleção a 375 cobre a barra de formatação.

## Critérios de aceite
- [x] Sem corte a 1024; barras sem sobreposição a 375.

## Registro
- Achado na revisão/matriz da 1.0.0; não bloqueia a versão.
- Fechado na branch fix/ultimos-1-0. Medida: 1024x737 última linha de fontes visível, base 711 > 699 -> 690 <= 720 (diálogo max-h 100dvh-2rem); 375 sobreposição das barras 7502 px2 -> 0 (seleção vira para baixo ao colidir com a barra fixa).
