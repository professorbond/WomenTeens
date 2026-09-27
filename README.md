# 🏔️ PeakGuard

**PeakGuard** — это комплексная веб-платформа для обеспечения безопасности горных туристических походов и экспедиций. 
Приложение помогает туристам планировать маршруты, оценивать риски с помощью искусственного интеллекта и оставлять данные доверенным лицам для контроля возвращения ("Dead-Man Switch").

---

## ✨ Ключевые возможности

1. **🗺️ Интерактивное планирование маршрута**
   Построение маршрута на карте (Leaflet + OpenStreetMap) с автоматическим расчётом дистанции.
2. **🤖 AI-Аудит безопасности (Safety Score)**
   Анализ маршрута, опыта группы и снаряжения. Интеграция с **Open-Meteo API** (бесплатный прогноз погоды) и **Google Gemini 2.0 Flash AI** для выявления скрытых рисков и выдачи рекомендаций.
3. **📄 Offline Kit (PDF-генерация)**
   Скачивание сводки похода, рекомендаций и протокола действий при ЧС (SOS) в PDF-формате для использования без интернета.
4. **⏱️ Контроль возвращения (Мониторинг)**
   Пользователь оставляет контакт доверенного лица и дедлайн возвращения. Если чек-ин не выполнен вовремя, система фиксирует это (в рамках прототипа — имитация отправки тревожного сигнала).

---

## 🛠 Технологический стек

* **Бэкенд:** C#, ASP.NET Core 10 (Minimal APIs, Entity Framework Core)
* **Фронтенд:** React 18, Vite, React Router v6, Axios, TailwindCSS-подобный Vanilla CSS, jsPDF, Canvas-Confetti
* **База данных:** PostgreSQL 16
* **Внешние API:** Google Gemini API (AI-анализ), Open-Meteo API (Погода)
* **Развертывание:** Docker, Docker Compose, Nginx (для фронтенда)

---

## 🚀 Быстрый запуск через Docker (Рекомендуется)

Самый простой способ запустить проект целиком (База данных + Бэкенд + Фронтенд).

**Требования:** Установленный [Docker Desktop](https://www.docker.com/products/docker-desktop/).

1. Склонируйте репозиторий и перейдите в корень проекта.
2. Выполните команду запуска:
   ```bash
   docker compose up --build
   ```
3. Дождитесь окончания сборки. Приложение автоматически применит миграции к базе данных.
4. **Готово!** 
   - Клиент (Фронтенд): [http://localhost:3000](http://localhost:3000)
   - API документация (Scalar): [http://localhost:5000/scalar/v1](http://localhost:5000/scalar/v1)

> 🛑 **Остановка:** В терминале нажмите `Ctrl+C` или выполните команду `docker compose down`. Чтобы удалить БД и начать с чистого листа, используйте `docker compose down -v`.

---

## 💻 Локальный запуск (для разработки)

Если вы хотите запускать и изменять код без Docker (например, в Visual Studio / VS Code):

**Требования:**
- .NET 10 SDK
- Node.js (v20+)
- PostgreSQL (запущенный локально на порту 5432 с пользователем `postgres` и паролем `postgres`, база данных `peakguard` будет создана автоматически).

### 1. Запуск Бэкенда (API)
Откройте терминал в папке `WomenTeens`:
```bash
cd WomenTeens
dotnet run
```
API будет доступно на `http://localhost:5000`. Swagger/Scalar UI — по адресу `http://localhost:5000/scalar/v1`.

### 2. Запуск Фронтенда (React)
Откройте второй терминал в папке `peakguard-client`:
```bash
cd peakguard-client
npm install
npm run dev
```
Фронтенд будет доступен по адресу `http://localhost:5173`.

---

## 🔑 Настройка API-ключей

Проект использует **Google Gemini API** для анализа рисков.
В файле `WomenTeens/appsettings.json` уже прописан тестовый ключ (в параметре `GeminiApiKey`). 

Если лимиты тестового ключа исчерпаются, вам необходимо:
1. Получить бесплатный ключ в [Google AI Studio](https://aistudio.google.com/).
2. Заменить значение `GeminiApiKey` в файле `appsettings.json` (при локальном запуске) или в `docker-compose.yml` (в блоке `environment` сервиса `api`).

*(Примечание: Если Gemini API недоступен, бэкенд имеет встроенную резервную математическую формулу расчета рисков, поэтому приложение продолжит работать).*

---

## 📁 Структура проекта

```text
/
├── docker-compose.yml        # Оркестрация контейнеров
├── Dockerfile.api            # Сборка бэкенда
├── Dockerfile.client         # Сборка фронтенда + Nginx
├── WomenTeens/               # ASP.NET Core Backend
│   ├── Program.cs            # Точка входа (DI, Middleware)
│   ├── appsettings.json      # Конфигурация БД и ключей
│   ├── Data/                 # Entity Framework Core DbContext
│   ├── Models/               # Сущности БД (Trip, AuditIssue)
│   ├── Endpoints/            # Minimal APIs (Trip, Audit, Monitor)
│   └── Services/             # Интеграции (GeminiService, WeatherService)
└── peakguard-client/         # React + Vite Frontend
    ├── src/
    │   ├── components/       # Переиспользуемые UI компоненты (Карта, Кнопки)
    │   ├── pages/            # Страницы (Configurator, Audit, Monitor)
    │   ├── services/         # API-клиент (axios) и генератор PDF (jsPDF)
    │   └── styles/           # CSS стили
    └── package.json          # Зависимости фронтенда
```