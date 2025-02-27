import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS etkinleştir
  app.enableCors();

  // Swagger konfigürasyonu
  const config = new DocumentBuilder()
    .setTitle("WebSocket Chat API")
    .setDescription("WebSocket ve REST API ile çalışan chat uygulaması")
    .setVersion("1.0")
    .addTag("chat")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3001);
  console.log(`Uygulama http://localhost:3001 adresinde çalışıyor`);
  console.log(`Swagger dökümantasyonu: http://localhost:3001/api`);
}
bootstrap();

// -------Geleneksel HTTP İletişimi:
// 1. Client her istek için yeni bir bağlantı açar
// İsteği gönderir (POST, GET, vb.)
// 3. Sunucu cevap verir
// Bağlantı kapanır
// Yeni bir istek için 1-4 arası tekrarlanır

// ---------WebSocket İletişimi:
// Client sunucu ile tek bir bağlantı kurar
// Bu bağlantı açık kalır.
// 3. İki taraf da istediği zaman veri gönderebilir (emit)
// Bağlantı manuel olarak kapatılana kadar devam eder

// ---------WebSocket'in Avantajları:
// 1. Sürekli bağlantı: Tek bağlantı üzerinden sürekli iletişim
// Real-time: Anlık veri alışverişi
// İki yönlü iletişim: Server da client'a direkt mesaj gönderebilir
// Daha az overhead: Her istek için yeni bağlantı kurulması gerekmez

//Nerelerde kullanılır?
// Bu yüzden chat, oyun, canlı veri akışı gibi real-time uygulamalar için WebSocket ideal bir çözümdür.
// Örnek:
// - Chat uygulamaları
// - Oyunlar
// - Canlı yayınlar
// - Takip sistemleri
// - Gerçek zamanlı haberleşme
