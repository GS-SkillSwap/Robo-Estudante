# 🤖 Robô Estudante

Um projeto IoT educacional que combina ESP32, sensores e comunicação MQTT para criar um robô interativo que motiva estudantes através de conquistas e feedback visual.

## 🎯 Sobre o Projeto

O **Robô Estudante** é um dispositivo IoT educacional desenvolvido com ESP32 que monitora a presença do estudante através de um sensor ultrassônico e responde a comandos MQTT. Quando o estudante alcança conquistas acadêmicas, o robô celebra com animações visuais no display OLED e efeitos de LED.

## 👥 Autores

- [Eduardo Ulisses - 566339]
- [Fernando Bellegarde - 564169]
- [Otávio Inaba - 565003]

## 🎬 Demonstração

### 📹 Vídeo Demonstrativo

Assista ao funcionamento completo do projeto:

[![Demonstração Robô Estudante](https://img.youtube.com/vi/67HnZk1ooX8/0.jpg)](https://youtu.be/67HnZk1ooX8)

**Link direto**: https://youtu.be/67HnZk1ooX8

### 🔌 Simulação Online

Experimente o projeto no Wokwi (simulador online):

[![Simular no Wokwi](https://img.shields.io/badge/Wokwi-Simular%20Projeto-green?style=for-the-badge&logo=wokwi)](https://wokwi.com/projects/447468810806870017)

**Link direto**: https://wokwi.com/projects/447468810806870017

### Objetivo

Criar um sistema gamificado que:

- Monitora a presença e engajamento do estudante
- Celebra conquistas acadêmicas de forma lúdica
- Oferece feedback visual motivacional
- Demonstra conceitos de IoT aplicados à educação

## ✨ Funcionalidades

- **Monitoramento de Presença**: Sensor ultrassônico HC-SR04 detecta a distância do estudante
- **Conexão IoT**: Comunicação via protocolo MQTT
- **Feedback Visual**: Display OLED SSD1306 128x64 exibe status e animações
- **Celebração de Conquistas**:
  - Animação de rostinho feliz no display
  - Piscar sincronizado de LEDs coloridos (verde, azul e vermelho)
- **Telemetria**: Envia dados de distância a cada 5 segundos
- **Comando Remoto**: Recebe comandos via MQTT para disparar conquistas

## 🔧 Componentes Utilizados

| Componente           | Quantidade | Descrição                           |
| -------------------- | ---------- | ----------------------------------- |
| ESP32                | 1          | Microcontrolador principal          |
| Display OLED SSD1306 | 1          | Tela 128x64 para feedback visual    |
| Sensor HC-SR04       | 1          | Sensor ultrassônico de distância    |
| LED Verde            | 1          | Indicador visual                    |
| LED Azul             | 1          | Indicador visual                    |
| LED Vermelho         | 1          | Indicador visual                    |
| Resistores           | 3          | Para limitação de corrente dos LEDs |

### Pinagem

```
ESP32          Componente
GPIO 12   -->  LED Verde
GPIO 13   -->  LED Azul
GPIO 14   -->  LED Vermelho
GPIO 23   -->  HC-SR04 TRIG
GPIO 19   -->  HC-SR04 ECHO
GPIO 21   -->  OLED SDA
GPIO 22   -->  OLED SCL
```

![alt text](/docs/image.png)

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura IoT com três camadas:

1. **Camada de Hardware**: ESP32 + sensores e atuadores
2. **Camada de Comunicação**: WiFi + MQTT
3. **Camada de Aplicação**: Broker MQTT (FIWARE Orion/STH-Comet)

### Fluxo de Dados

![alt text](</docs/Captura de tela 2025-11-19 191156.png>)

## 🚀 Como Usar

### Pré-requisitos

- Arduino IDE instalada
- Bibliotecas necessárias:
  - WiFi
  - PubSubClient
  - Wire
  - Adafruit_GFX
  - Adafruit_SSD1306

### Instalação das Bibliotecas

No Arduino IDE, vá em **Sketch > Incluir Biblioteca > Gerenciar Bibliotecas** e instale:

```
- PubSubClient by Nick O'Leary
- Adafruit GFX Library
- Adafruit SSD1306
```

### Upload do Código

1. Clone este repositório:

```bash
git clone https://github.com/GS-SkillSwap/Robo-Estudante.git
cd Robo-Estudante
```

2. Abra o arquivo `.ino` no Arduino IDE

3. Configure suas credenciais WiFi e servidor MQTT

4. Selecione a placa ESP32 e a porta correta

5. Faça o upload do código

## ⚙️ Configuração

### Configuração WiFi

Edite as seguintes linhas no código:

```cpp
const char* ssid = "SEU_WIFI";
const char* password = "SUA_SENHA";
```

### Configuração MQTT

```cpp
const char* mqtt_server = "SEU_BROKER_MQTT";
const char* device_id = "RoboEstudante001";
```

### Tópicos MQTT

- **Publicação** (telemetria): `TEF/RoboEstudante001/attrs/d`
- **Assinatura** (comandos): `TEF/RoboEstudante001/cmd`

### Formato da Mensagem de Conquista

Para disparar uma conquista, publique no tópico de comando:

```json
{
  "conquista": "true"
}
```

## 💻 Código

### Estrutura Principal

```cpp
setup()
  ├── Inicialização do Display OLED
  ├── Configuração dos Pinos
  ├── Conexão WiFi
  └── Configuração MQTT

loop()
  ├── Verificação de Conexão MQTT
  ├── Leitura do Sensor (a cada 5s)
  └── Publicação de Telemetria
```

### Funções Principais

- `lerSensorDistancia()`: Lê distância do sensor HC-SR04
- `dispararConquista()`: Executa animação de celebração
- `mostrarRostinhoFeliz()`: Desenha emoji feliz no OLED
- `piscarTodosLeds()`: Pisca LEDs em sequência
- `callback()`: Processa mensagens MQTT recebidas

# 📊 Como Executar o Dashboard

O dashboard é uma aplicação web desenvolvida com React e Vite que fornece uma interface visual para monitorar e interagir com o sistema.

## Pré-requisitos

- Node.js (versão 16 ou superior)
- npm (geralmente vem com o Node.js)

## Passo a Passo

### 1. Clone o Repositório

```bash
git clone https://github.com/GS-SkillSwap/Robo-Estudante.git
cd Robo-Estudante
```

### 2. Acesse a Pasta do Dashboard

```bash
cd dashboard
```

### 3. Configure os Endpoints da API

Antes de executar o dashboard, você precisa configurar os IPs dos servidores da API no arquivo `vite.config.js`:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/orion": {
        target: "http://SEU_IP:1026", // ← Substitua pelo IP do Orion
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/orion/, ""),
      },
      "/api/sth": {
        target: "http://SEU_IP:8666", // ← Substitua pelo IP do STH
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sth/, ""),
      },
    },
  },
});
```

**Importante:** Substitua `SEU_IP` pelos endereços IP corretos onde seus serviços Orion e STH estão rodando.

### 4. Instale as Dependências

```bash
npm install
```

### 5. Execute o Dashboard

```bash
npm run dev
```

O dashboard estará disponível em `http://localhost:5173` (ou outra porta indicada no terminal).


## 📄 Licença

Este projeto está sob a licença especificada no repositório.

## 🔗 Links Úteis

- [Repositório no GitHub](https://github.com/GS-SkillSwap/Robo-Estudante)
- [Vídeo Demonstrativo](https://youtu.be/67HnZk1ooX8)
- [Simulação Wokwi](https://wokwi.com/projects/447468810806870017)
- [Documentação ESP32](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
- [MQTT.org](https://mqtt.org/)

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!
