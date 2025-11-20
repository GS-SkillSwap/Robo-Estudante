#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* mqtt_server = "34.55.45.169";

const char* device_id = "RoboEstudante001";

const char* topico_publicar_attrs = "TEF/RoboEstudante001/attrs/d";
const char* topico_assinar_cmd = "TEF/RoboEstudante001/cmd";

// --- Configuração dos Pinos ---
#define LED_VERDE 12
#define LED_AZUL  13
#define LED_VERMELHO 14

#define PINO_TRIG 23
#define PINO_ECHO 19

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

WiFiClient espClient;
PubSubClient client(espClient);

long lastSensorRead = 0;
float distanciaCm = 0.0;

// =======================================================
//                    SETUP (INICIALIZAÇÃO)
// =======================================================
void setup() {
  Serial.begin(115200);

  // Inicia o display OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("Falha ao iniciar display SSD1306"));
    for(;;);
  }
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0,0);
  display.println("Iniciando Robozinho...");
  display.display();
  delay(1000);

  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_AZUL, OUTPUT);
  pinMode(LED_VERMELHO, OUTPUT);
  pinMode(PINO_TRIG, OUTPUT);
  pinMode(PINO_ECHO, INPUT);

  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

// =======================================================
//                  LOOP (CÓDIGO PRINCIPAL)
// =======================================================
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  long now = millis();
  if (now - lastSensorRead > 5000) {
    lastSensorRead = now;

    distanciaCm = lerSensorDistancia();
    Serial.print("Distância medida: ");
    Serial.println(distanciaCm);

    char msgPayload[20];
    sprintf(msgPayload, "%.2f", distanciaCm);

    client.publish(topico_publicar_attrs, msgPayload);
    Serial.print("Mensagem publicada em [");
    Serial.print(topico_publicar_attrs);
    Serial.print("]: ");
    Serial.println(msgPayload);
  }
}

// =======================================================
//                 FUNÇÕES DE HARDWARE
// =======================================================

void dispararConquista() {
  Serial.println(">>> CONQUISTA RECEBIDA! <<<");
  mostrarRostinhoFeliz();
  for (int i = 0; i < 3; i++) {
    piscarTodosLeds();
  }
  delay(4000);
  display.clearDisplay();
  display.setCursor(0,0);
  display.println("Monitorando...");
  display.display();
}

void mostrarRostinhoFeliz() {
  display.clearDisplay();
  display.drawCircle(64, 32, 20, SSD1306_WHITE);
  display.fillCircle(56, 28, 3, SSD1306_WHITE);
  display.fillCircle(72, 28, 3, SSD1306_WHITE);
  display.drawPixel(58, 38, SSD1306_WHITE);
  display.drawPixel(59, 39, SSD1306_WHITE);
  display.drawPixel(60, 40, SSD1306_WHITE);
  display.drawPixel(61, 40, SSD1306_WHITE);
  display.drawPixel(62, 40, SSD1306_WHITE);
  display.drawPixel(63, 40, SSD1306_WHITE);
  display.drawPixel(64, 40, SSD1306_WHITE);
  display.drawPixel(65, 40, SSD1306_WHITE);
  display.drawPixel(66, 40, SSD1306_WHITE);
  display.drawPixel(67, 40, SSD1306_WHITE);
  display.drawPixel(68, 39, SSD1306_WHITE);
  display.drawPixel(69, 38, SSD1306_WHITE);
  display.display();
}

void piscarTodosLeds() {
  digitalWrite(LED_VERDE, HIGH);
  digitalWrite(LED_AZUL, HIGH);
  digitalWrite(LED_VERMELHO, HIGH);
  delay(200);
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(LED_AZUL, LOW);
  digitalWrite(LED_VERMELHO, LOW);
  delay(200);
}

float lerSensorDistancia() {
  digitalWrite(PINO_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PINO_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PINO_TRIG, LOW);
  long duracao = pulseIn(PINO_ECHO, HIGH);
  float distancia = duracao / 58.0;
  return distancia;
}

// =======================================================
//                FUNÇÕES DE CONECTIVIDADE
// =======================================================

void setup_wifi() {
  delay(10);
  Serial.print("Conectando ao Wi-Fi: ");
  Serial.println(ssid);
  display.setCursor(0,10);
  display.println("Conectando ao Wi-Fi...");
  display.display();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  display.clearDisplay();
  display.setCursor(0,0);
  display.println("Wi-Fi Conectado!");
  display.display();
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Mensagem recebida no tópico [");
  Serial.print(topic);
  Serial.print("] ");

  String mensagem = "";
  for (int i = 0; i < length; i++) {
    mensagem += (char)payload[i];
  }
  Serial.println(mensagem);

  if (mensagem.indexOf("conquista") > 0) {
    dispararConquista();
    
    char topico_resposta[100];
    
    sprintf(topico_resposta, "/%s/cmdexe", device_id); 
    
    char payload_resposta[100];
    sprintf(payload_resposta, "conquista|%s", "OK");
    
    client.publish(topico_resposta, payload_resposta);
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Tentando conexão MQTT...");
    display.clearDisplay();
    display.setCursor(0,0);
    display.println("Conectando MQTT...");
    display.display();
    
    if (client.connect(device_id)) {
      Serial.println("conectado!");
      display.clearDisplay();
      display.setCursor(0,0);
      display.println("Robo Conectado!");
      display.println("Monitorando...");
      display.display();
      
      client.subscribe(topico_assinar_cmd); 
      Serial.print("Assinado o tópico: ");
      Serial.println(topico_assinar_cmd);
    } else {
      Serial.print("falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos");
      display.clearDisplay();
      display.setCursor(0,0);
      display.println("Falha no MQTT.");
      display.display();
      delay(5000);
    }
  }
}
