# Meu Treino

App de treino para iPhone (PWA): monta a rotina de acordo com o seu objetivo e mostra
uma animação da execução de cada exercício, com o músculo trabalhado em vermelho.

- Rotina montada a partir de objetivo, nível, dias por semana, local e tempo disponível
- 64 exercícios com animação do movimento, passo a passo e erros comuns
- Registro de carga e repetições, timer de descanso e histórico
- Funciona offline e instala na tela de início do iPhone

## Como instalar no iPhone

1. Abra o link no **Safari**
2. Toque no botão **Compartilhar**
3. Escolha **Adicionar à Tela de Início**

## Rodar localmente

```
python -m http.server 8765
```

Os dados ficam apenas no aparelho (localStorage). Nada é enviado para servidor.
