# BAGYT AI / BELGI AI

## Новый дизайн и демо без регистрации

- `/?view=about` — тёмная презентационная страница BAGYT AI и пиксельного помощника BELGI AI.
- `/demo` — независимый демонстрационный магазин Qazyna Store: обзор, график, продажи, клиенты, склад, закупка, источники и настройки. Русский / қазақша, мобильная навигация и CSV-отчёт.
- BELGI AI в `/demo` отвечает по явно обозначенным готовым сценариям. Существующий серверный AI в рабочем пространстве сохранён; отображаемое имя и его инструкции обновлены.
- Большой промоблок помощника убран: BELGI AI — сдержанный графитовый пиксельный аналитик. Он перемещается вдоль нижнего края каждые 14 секунд и показывает короткие советы. Нажатие открывает немодальный мини-чат с историей и переходом к закупке. Есть пауза движения, скрытие совета, переключение советов и закрытие чата через Escape. При наведении, фокусе, открытом чате, другом диалоге или системном reduced-motion автоматическое движение останавливается.
- Сценарий: «Посмотреть» → «Подготовить проект» → «Утвердить в демо» → приёмка 25 шт. На складе становится 37 шт., доступно 35, ещё 5 не приняты. Повторная приёмка не увеличивает остаток.
- Демо-состояние сохраняется в браузере (`bagyt-belgi-demo-v1`), сброс доступен в настройках демо. Оно не меняет серверные данные, не отправляет заказ и не подключает внешние сервисы. Миграции БД для обновления дизайна не нужны.
- Проверки: `npm test`, `npm run typecheck`, `npm run build`. Тесты демо находятся в `tests/belgi-demo.test.ts`.

Функциональный MVP для малого бизнеса Казахстана. Next.js App Router, TypeScript, React, Recharts, Neon PostgreSQL, серверные сессии и PostgreSQL RLS. Светлый интерфейс с мятно-зелёными акцентами, тёмными панелями, пиксельным логотипом роста и живым помощником BELGI AI. Қазақша по умолчанию, переключение на русский. Регистрация-опрос: выберите тип бизнеса и цель, затем укажите название, email и пароль. После регистрации открывается подключение источников.

## Быстрый запуск на Windows

Нужен Node.js 22 или 24 LTS. В этой папке зависимости уже установлены, production-сборка подготовлена.

```powershell
cd 'C:\Users\Acer\Desktop\Bagyt Ai aqyl\bagyt-ai'
npm run start
```

Откройте [BAGYT AI](http://127.0.0.1:3000). Если приложение уже запущено в этой сессии, второй сервер запускать не нужно. Для остановки сервера в терминале — Ctrl+C.

Чистая установка из исходного кода:

```powershell
npm ci
npm run fixtures
npm run build
npm run start
```

Разработка: `npm run dev`. После изменений для production снова выполните `npm run build` и перезапустите сервер. Не запускайте два серверных процесса с одной папкой базы PGlite. Локальный сервер слушает `127.0.0.1`. Для облачного запуска подготовлена конфигурация Vercel и Neon.

## Вход и данные

- «Создать аккаунт» создает аккаунт и пустую организацию.
- «Посмотреть демо» создает отдельную синтетическую компанию: Dala Store или Bilim Academy. Данные генерируются относительно текущей даты. Общих демо-паролей нет; сессия хранится в HttpOnly cookie.
- В демо есть роли Owner, Manager и Viewer. Переключатель в настройках позволяет проверить их поведение только в синтетической организации.
- В обычной организации владелец создает аккаунты сотрудников в настройках. Пароль передается сотруднику самостоятельно; письма не отправляются.
- Если задан `DATABASE_URL`, данные и оригиналы изображений сохраняются в Neon в отдельной схеме `bagyt`. Иначе используется локальная база `data/postgres`. OCR кеширует языковые файлы во временной папке ОС; документы хранятся в таблице `documents` с RLS. Секреты `.env.local` и папка `data` исключены из Git.
- Для резервной копии остановите сервер и скопируйте всю папку `data`. Возвращайте резервную копию также при остановленном сервере.

## Сквозное демо

1. Создайте Dala Store. Откроются три сигнала: обращения без ответа, рост расходов, низкая маржа.
2. В «Источники данных → UMAG / POS» загрузите `fixtures/pos-sales.csv` или `.xlsx`. Сопоставьте колонки, проверьте и при необходимости исправьте ячейки.
3. В очереди проверки подтвердите строки. Вторая тестовая продажа имеет `pending` и не входит в выручку даже после проверки.
4. Повторите импорт того же файла. Записи будут пропущены без удвоения.
5. Откройте карточку сайта → «Импорт файла заказов» и загрузите `fixtures/website-duplicate.csv`. Файл содержит тот же `order_id` / `payment_id`, что и первая POS-продажа. Найденное совпадение требует решения владельца. Также в исходном демо уже есть заказ сайта, дублирующий POS по платежу.
6. В карточке сайта откройте Webhook и отправьте тестовый заказ. Это реальный HTTP-запрос с HMAC-подписью. Источник становится Live API после принятого события.
7. Нажмите «Добавить → Распознать фото квитанции» и выберите `fixtures/demo-receipt.png`. Tesseract распознает `TOTAL: 12500.00`. Исправьте поля, сохраните и затем подтвердите запись. Оригинал сохраняется в организации.
8. Откройте доказательства сигнала. Видны исходные ID, период, факт, действие и ограничения.
9. Создайте план на 7 или 30 дней, отредактируйте исполнителя, срок, ресурсы и целевой KPI. В плане используются метрики соответствующего интервала.
10. Утвердите план. Переключитесь на назначенного менеджера, начните и завершите его задачу.
11. Владелец запускает проверку результата. До завершения полного интервала после утверждения и появления новых подтвержденных данных результат — «Недостаточно данных». Система не подделывает финансовый успех.
12. Новый подписанный заказ или подтвержденный импорт сразу обновляет показатели. При проверке завершенного периода фиксируются факт, цель, исходные записи и достижение либо недостижение цели. Причинная связь с AI отдельно не утверждается.

## Работающие подключения

### План на сегодня

На главной BELGI AI автоматически формирует ежедневный план по данным выбранного периода (7/30/60 дней). Gemini выбирает приоритеты из проверяемых действий и объясняет их; суммы рассчитываются сервером только по подтверждённым записям. При недоступности Gemini интерфейс явно обозначает план по правилам.

«Сделаем вместе» открывает нужный раздел или поле и показывает последовательные подсказки, образцы и кнопку вопроса BELGI AI. Записи сохраняет и подтверждает сам пользователь. Отметки выполнения хранятся в PostgreSQL отдельно для каждого пользователя и дня; они не подтверждают финансовый результат. План пересчитывается при открытии главной после изменения данных или наступления нового дня. Фоновая обработка при закрытом сайте не запускается.

Для этой функции применяется миграция `003_daily_plans.sql` командой `npm run db:migrate`. Обе таблицы защищены RLS; кэш учитывает организацию, пользователя, роль, период, язык и текущие данные.

| Источник | Реализовано | Что не подключено |
|---|---|---|
| UMAG / другие POS | Универсальный CSV/XLSX-импорт, сопоставление полей, исправление строк | Официальный POS API |
| Сайт | Реальный подписанный Webhook заказов и возвратов, event-id идемпотентность | Автоматическая интеграция с конкретным магазином |
| WhatsApp | Разрешенный CSV/XLSX-импорт обращений, ответов, связей с заказами | Meta WhatsApp Cloud API |
| Instagram / TikTok | Импорт кампаний, бюджетов, просмотров; атрибуция по `campaign_id` | OAuth / официальные API |
| 2GIS / отзывы | Разрешенный импорт текста и рейтинга, темы по ключевым словам | Скрапинг и API отзывов |
| Документы | Реальное локальное OCR PNG/JPEG, правка и подтверждение | Надежное распознавание произвольного почерка не гарантируется |
| BELGI AI | Детерминированные расчеты, доказательства, планы; Google Gemini с историей и серверным контекстом при наличии ключа | LLM без ключа не имитируется |

В интерфейсе используются реальные статусы Demo, File Import, Manual, Live API и Disconnected. Импорт файла не подключает официальный API.

## Формат импорта

Суммы в файле — **тенге**, до двух десятичных знаков. В PostgreSQL они хранятся как `bigint` в тиынах. Размер файла до 5 МБ, до 1000 строк и 50 колонок; распакованный XLSX до 30 МБ. Только первая вкладка XLSX. CSV — UTF-8, разделитель определяется автоматически.

Обязательные поля: `external_id`, `date`. Дата: `YYYY-MM-DD` либо ISO 8601 с часовым поясом, например `2026-10-13T10:00:00+05:00`. Для финансовых операций нужна сумма. Пустая себестоимость — неизвестная, **не ноль**.

| Тип | Разрешенные статусы | Дополнительные поля |
|---|---|---|
| sale | paid, pending, cancelled | amount, cost, order_id, payment_id, lead_id, campaign_id, channel |
| refund | paid, pending | amount, cost, order_id, payment_id |
| expense | paid, pending | amount, name |
| lead | open, closed, converted | responded_at, order_id, text, channel |
| campaign | active, completed | amount (бюджет), name, views |
| review | published | text, rating (1–5) |

Все суммы неотрицательны; возврат задается типом `refund`, а не отрицательной продажей. У возврата собственный `external_id`. Каждая загрузка имеет один тип записей, выбранный в мастере.

Повторный `(organization, source, external_id)` с теми же данными пропускается. Измененная запись обновляется и вновь требует проверки. Первоначальные варианты сохраняются в `raw_events`. Совпадения между источниками ищутся по идентификаторам заказов/платежей, а для финансовых записей — также по одинаковой сумме и времени в пределах часа. Нечеткое совпадение не объединяется автоматически. Отметка дубликата указывает на подтвержденную каноническую запись своей компании.

`fixtures/leads-updated.csv` демонстрирует обновление статуса и времени ответа уже импортированного обращения. `fixtures/invalid-sales.csv` демонстрирует ошибки валидации. Запустите `npm run fixtures`, чтобы обновить даты шаблонов.

## Webhook

Адрес и секрет доступны владельцу через «Источники данных → Ваш интернет-магазин». Не вставляйте секрет в клиентский код.

```json
{
  "event_id": "provider-event-001",
  "order": {
    "external_id": "order-001",
    "kind": "sale",
    "date": "2026-10-13T10:00:00+05:00",
    "amount": "25000.00",
    "cost": "15000.00",
    "status": "paid",
    "payment_id": "payment-001",
    "channel": "Сайт"
  }
}
```

`POST /api/webhook?org=<organization-id>`

- `x-bagyt-timestamp`: Unix timestamp в секундах, допуск ±5 минут.
- `x-bagyt-signature`: hex `HMAC-SHA256(secret, timestamp + "." + rawBody)`.
- Подписывайте именно отправляемый raw JSON, включая пробелы и порядок полей.
- Повторный `event_id` возвращает `duplicate: true`. Новый статус заказа отправляется с новым `event_id` и прежним `external_id`.
- Подписанная операция проходит сразу, если нет подозрения на дубликат. Совпадение направляется на проверку.

CLI-проверка в PowerShell:

```powershell
$env:BAGYT_WEBHOOK_URL='АДРЕС_ИЗ_НАСТРОЕК'
$env:BAGYT_WEBHOOK_SECRET='СЕКРЕТ_ИЗ_НАСТРОЕК'
npm run webhook
```

`BAGYT_EVENT_ID` и `BAGYT_ORDER_ID` можно задать для проверки повторной отправки. Скрипт не выводит секрет. Для реального внешнего магазина нужен доступный сервер с HTTPS; loopback-адрес работает только на этом компьютере.

## BELGI AI и OCR

Скопируйте `.env.example` в `.env.local`. Для свободного диалога задайте серверный `GEMINI_API_KEY`; модель по умолчанию — `gemini-3.5-flash-lite` (можно переопределить `GEMINI_MODEL`). Ключ хранится только на сервере, в Vercel — в sensitive environment variable. При наличии Google-ключа BELGI AI использует Gemini; существующий OpenAI Responses API остаётся резервным вариантом конфигурации через `OPENAI_API_KEY` (автоматического переключения при ошибке нет).

Каждый запрос получает свежую серверную сводку только текущей организации: выбранные 7/30/60 дней, проверенные метрики, до 40 подтверждённых записей и до 30 доступных задач. В Google отправляются вопрос, до 8 последних пар реплик, сведения о бизнесе и эта сводка. Пароли, webhook-секреты, контакты покупателей и исходные документы исключены из контекста. История хранится в состоянии вкладки, очищается при смене компании/аккаунта, перезагрузке или кнопкой «Новый разговор». При временном 503 выполняется один повтор в пределах общего таймаута 45 секунд. При ошибке провайдера показывается причина и «Повторить»; готовый ответ не подменяет ответ AI.

Модель предлагает только разрешённый ID действия. Интерфейс сам выбирает фиксированный селектор с учётом роли пользователя: открыть раздел, форму или подсветить поле. Сохранение, подтверждение и изменение данных всегда выполняет пользователь. BELGI AI доступен внутри формы ручной записи и импорта; подсветка не сбрасывает уже введённые значения. Доказательства ответа — только ID подтверждённых записей из переданного контекста.

Без ключа работают все базовые расчеты, детекторы, объяснения по правилам и планы. Чат прямо сообщает, что свободный диалог не подключен.

OCR выполняется **на сервере приложения** через Tesseract.js. На первом запуске нужен интернет для загрузки языковых моделей `eng+rus`; далее используется кеш. Фото в OpenAI не отправляются. Рукописный текст и казахские символы требуют ручной проверки или отдельного Vision-адаптера. Крупные и поврежденные изображения отклоняются; автоматического добавления суммы в расчет нет.

## Расчеты и ограничения данных

- Выручка: подтвержденные оплаченные продажи минус подтвержденные оплаченные возвраты. Заявки, просмотры и неоплаченные заказы исключены.
- Валовая прибыль: выручка минус себестоимость продаж плюс себестоимость возвратов, только если она известна для всех операций периода.
- Результат после расходов: валовая прибыль минус подтвержденные расходы. Это не полный бухгалтерский показатель чистой прибыли.
- Конверсия: обращения с надежной связью с оплаченным заказом / обращения периода. Статус `converted` сам по себе не подтверждает оплату.
- Маркетинговый бюджет не повторяется в финансовых расходах: фактическую оплату рекламных расходов импортируйте отдельно как `expense`.
- Периоды — скользящие 7, 30 или 60 × 24 часа. На графике крайние календарные дни могут быть неполными. Календарь интерфейса — Asia/Qyzylorda.
- Сравнение расходов использует предыдущий интервал такой же длительности. Полнота данных и сезонность не гарантируются.
- Для новых импортов нужны надежные и стабильные ID. При отсутствии `order_id`/`payment_id` сверку выполняет владелец.
- План и задачи не доказывают влияние AI на прибыль. Проверка требует полного периода и новых данных, сохраняет успешный либо неуспешный результат.
- Надежный прогноз, оценка потенциального денежного эффекта и экономия времени не вычисляются без достаточных оснований.

## Структура исходного кода

```text
src/app/                   Next.js, стили, API route handlers
src/components/            Рабочий интерфейс, диалоги и мастер импорта
src/lib/auth.ts            Пароли scrypt, серверные сессии, права, CSRF, лимиты
src/lib/db.ts              Neon / PGlite, транзакции с SET LOCAL ROLE и org_id
src/lib/events.ts          Валидация, исходные события, дубли, подтверждения
src/lib/analytics.ts       Детерминированные метрики и детекторы
src/lib/demo.ts            Два синтетических бизнеса
src/lib/adapters.ts        Контракт расширения источников
src/lib/i18n.ts            Казахские тексты аналитики
migrations/001_initial.sql PostgreSQL DDL и RLS-политики
scripts/                   Генерация fixtures, Webhook, интеграционные проверки
tests/                     Тесты финансовых правил и PostgreSQL RLS
fixtures/                  Настоящие CSV/XLSX и PNG для демо
.env.example               Параметры запуска без секретов
```

Используется единый журнал типизированных бизнес-событий `events` и неизменяемые через API исходные версии `raw_events`. Отдельные таблицы — организации, пользователи, memberships, сессии, импорты, планы, задачи, проверки результатов, журнал действий и принятые Webhook-события. Это компактная схема MVP; каталог товаров, CRM-профили и многофилиальная аналитика не реализованы.

Локальный запасной режим: PGlite вместо внешнего Supabase, собственные серверные сессии вместо Supabase Auth, CSS-компоненты вместо Tailwind. PGlite выполняет настоящий PostgreSQL SQL и RLS, но рассчитан на один серверный процесс. Облачная версия использует пул node-postgres и Neon; search_path, роль и org_id устанавливаются внутри каждой транзакции, поэтому состояние арендатора не переносится между запросами. Миграция RLS использует `bagyt.org_id`, а не автоматически `auth.uid()` Supabase.

## Проверки

```powershell
npm run typecheck
npm test
npm run build
npm audit
```

При работающем сервере:

```powershell
$env:BAGYT_TEST_OCR='true'
npx tsx scripts/api-smoke.ts
```

Интеграционный скрипт создает отдельные QA-организации в базе настроенного сервера и не использует пользовательские компании. Он проверяет регистрацию, вход, настоящие файлы, подтверждения, идемпотентность, RLS, Webhook-подпись, обновление показателей, задачи, роли, CSRF, честный отказ LLM без ключа, OCR и сохранение документа. Для сервера с настроенным LLM адаптируйте проверку ожидаемого 503.

Проверено при поставке: **7 тестов домена / RLS, 31 API-проверка, успешные TypeScript и production build, 0 npm audit vulnerabilities**. В браузере проверены демо, утверждение плана, импорт XLSX с сопоставлением колонок, подтверждение строк, исключение дубликата, переключение RU/KZ, мобильный дашборд 390 px и настольный 1440 px. Эта первоначальная проверка не включала свободный LLM; актуальная проверка Gemini описана ниже.

Перед публичным развертыванием отдельно нужны HTTPS, `COOKIE_SECURE=true`, внешняя база, рабочий процесс сброса паролей и почты, резервное копирование и нагрузочная проверка. Supabase, Telegram Bot, числовые прогнозы и официальные социальные API относятся к следующим этапам.

Документация зависимостей: [Next.js App Router](https://nextjs.org/docs/app/getting-started), [PGlite](https://pglite.dev/docs/), [OpenAI Responses / text generation](https://developers.openai.com/api/docs/guides/text).


## Neon и Vercel

1. Скопируйте `.env.example` в `.env.local`, задайте `DATABASE_URL` только на сервере.
2. Выполните `npm run db:migrate`: идемпотентные миграции создают отдельную схему `bagyt`, роль и RLS. Пользователь миграций должен иметь право создавать роли и схемы.
3. `vercel link`, затем `vercel env add DATABASE_URL production --sensitive` (значение передавайте через stdin). Задайте `COOKIE_SECURE=true`; Vercel также включает secure-cookie автоматически.
4. `npm run build`, затем `vercel --prod`. Регион iad1 выбран ближе к базе Neon в US East. PostgreSQL подключается с проверкой TLS-сертификата.
5. `vercel git connect` связывает проект с GitHub. Секреты и базы не добавляйте в Git. Миграции выполняются явно до выкладки, а не при каждом запросе.

## Демо-подключения

WhatsApp и UMAG принимают номер +7; Instagram, TikTok, 2GIS и сайт — HTTPS-ссылку. Мастер показывает контакт → разрешение → результат. Подтверждение сохраняется в Neon и журнале аудита; отключение отзывает настройку. **Это симуляция, не OAuth и не доступ к реальным аккаунтам.** Пароли внешних сервисов не запрашиваются, внешние сообщения не отправляются, адреса не скачиваются. Демо-подключение не создает фиктивную выручку в обычной компании. Файловый импорт и подписанный Webhook сайта продолжают работать отдельно.

На публичном MVP нет SMS/email-подтверждения и восстановления пароля. AI-чат требует серверного `GEMINI_API_KEY` (или `OPENAI_API_KEY`); без ключа работает детерминированный анализ данных и генерация планов. Подключение базы Neon само по себе не включает LLM.


## Живой BELGI AI

BELGI AI — сдержанный, доброжелательный пиксельный SVG-персонаж в мятно-зелёной палитре. Индикатор размышления реагирует на состояние обработки; настройка ОС «уменьшить движение» отключает анимации. Персонаж и эмблема нарисованы в коде, загрузка сторонних изображений не требуется.


Проверка обновления Gemini: 16 автоматических тестов (включая границы истории, исключение секретов, права на действия, проверку evidence и ошибки провайдера). Реальным Google API проверены расчёт из тестовых данных, память диалога, ответ на казахском и предложение нужного поля.

Даты без времени интерпретируются как начало суток Казахстана (+05:00), чтобы запись за сегодня, добавленная утром, сразу попадала в показатели. Явные timestamps сохраняют исходное время.


## Единый бизнес-демо `/demo`

Демо использует синтетические записи и не подключается к внешним аккаунтам. Состояние хранится локально в `bagyt-business-hub-v1`; «Баптаулар → Демоны қайта бастау» сбрасывает ответы, задачи и закупку.

- **Входящие:** WhatsApp, Instagram и сайт. Фильтры, поиск, ответственный, редактируемые шаблонные ответы BELGI AI и явное подтверждение симуляции. Черновик не закрывает обращение. Напоминание попадает в план, но не отправляет внешнее уведомление.
- **Клиенты:** единая карточка, история покупок и диалоги разных каналов. Связь задана ID демо-клиента; совпадение имени не означает совпадение личности.
- **Отзывы:** тема, оценка, проект ответа и задача по улучшению сервиса. Ответ сохраняется локально, публикации в Google Maps нет.
- **Развитие:** три гипотезы с конкретными источниками, действиями и критериями. Задачи добавляются однократно, их можно завершить и вернуть в работу.
- **Источники:** шесть учебных групп. Кнопка демо-синхронизации добавляет WhatsApp-диалог Данияра в существующую карточку. Повтор не создаёт дубликат.
- **Финансы и закупка:** период, CSV финансового отчёта, остатки, проект закупки → проверка → утверждение → фактическая приёмка. Неполный учёт не выдаётся за чистую прибыль.
- **Көмекші:** BELGI AI перемещается по двум осям; его можно остановить, перетащить за ручку или переместить клавишами-стрелками. «Осы бетте не істеу керегін көрсет» запускает 13 шагов с подсветкой элементов и переходом между разделами. Движение приостанавливается при взаимодействии, открытии чата и настройке reduced motion. В мини-чате ответы по сценариям используют текущие числа демо; свободная генеративная модель здесь не вызывается.

Проверка: 38 автоматических тестов, TypeScript и production build; в браузере проверены ответ/напоминание, отзыв → задача, повторная синхронизация, объединённая история, восстановление после обновления, RU/KZ, мини-чат, экскурсия и мобильный экран 390 px.

Референсы для дальнейшей реальной интеграции: [Meta: получение сообщений через webhooks](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/receivingMessages/) (архивный SDK приведён только для объяснения события; не используется в коде), [Google Business Profile: отзывы и ответы](https://developers.google.com/my-business/content/review-data). Реальные подключения потребуют отдельных аккаунтов, прав доступа и настройки API; текущее демо не запрашивает эти права.


### Обновление рабочего пространства — 15.10.2026

Зелёная палитра сохранена; `/demo` получил отдельную композицию с крупными показателями, графиком, приоритетами и переходами к конкретным диалогам. Входящие показывают список, переписку и сворачиваемую карточку клиента; на телефоне диалог открывается отдельно с возвратом к списку. Боковое меню сгруппировано по работе с клиентами, операциям и развитию; поиск разделов доступен через кнопку и Ctrl/Cmd+K.

- Каталог из шести товаров: физический остаток, резерв, доступное количество, срок покрытия, поиск, фильтры и подробности товара.
- Закупка представлена документом и этапами; фактическая приёмка обновляет остаток кофе.
- Три учебных предложения поставщиков: срок, минимальный заказ, стоимость товара и доставки. Неизвестная доставка не считается нулевой; минимальная партия учитывается в сумме и тексте запроса. Запрос условий остаётся локальным проектом.
- Две включаемые демо-автоматизации создают задачи по ожидающим клиентам и жалобе на обслуживание. Запуск ручной; повтор не дублирует задачи, сообщения не отправляются.
- BELGI: компактный перемещаемый помощник, постоянно доступная пауза, мини-чат, контекстные советы и экскурсия по 13 разделам с подсветкой. Ответы для поставщиков и автоматизации также доступны.

Проверены TypeScript, production build и 38 тестов. В браузере дополнительно проверены фильтр и карточка товара, минимальная партия в запросе поставщику, автоматизации и повторный запуск, план задач, поиск разделов, переход от карточки на главной к нужному диалогу, экскурсия, мини-чат, уведомления и мобильный диалог 390 px без горизонтальной прокрутки.

Исследование интерфейсов: [Intercom Inbox](https://www.intercom.com/help/en/articles/6258745-the-inbox-explained) — переписка и клиентский контекст в одном рабочем пространстве; [Shopify Purchase orders](https://help.shopify.com/en/manual/inventory-and-locations/purchase-orders) — поставщик, стоимость, этапы закупки и приёмки; [Carbon Data table](https://v10.carbondesignsystem.com/components/data-table/usage/) — поиск, фильтры и детали строк. В демо применена собственная визуальная система BAGYT; реальные аккаунты этих сервисов не подключены.


### Упрощение UI/UX и публикация — 15.10.2026

Текущая версия заменяет плотный обзор простым экраном «Сегодня»: приветствие BELGI, три показателя и три последовательных действия. Шесть основных разделов содержат контекстные вкладки; финансы, каталог, поставщики, отзывы и автоматизации сохранены. Крупный помощник (96 px на компьютере, 84 px на телефоне) перемещается у нижнего края; чат предлагает три понятных вопроса. Белое боковое меню с зелёным выделением и спокойная тёмная стартовая страница объединяют бренд BAGYT с лаконичной структурой референса Vercel.

Локальная браузерная проверка была недоступна из-за URL policy; проверка проведена на разрешённом публичном HTTPS-сайте после успешного Vercel deployment. Проверены переход с лендинга в демо, RU/KZ, вопрос BELGI → действие → входящие, мобильные вкладки и отсутствие горизонтального переполнения при 390 px. Автоматические тесты: 38/38; production build успешен. Реальная CRM-сессия не изменялась; тесты интерфейса выполнялись в локальном демонстрационном состоянии `/demo`.

### Bagyt direction mark and the three-agent workspace — 15.10.2026

The current presentation replaces the previous robot and large assistant dock. Bagyt uses a geometric B with a forward-arrow cutout, neutral light/dark surfaces, emerald accents and a responsive six-section workspace. The dashboard contains verified demo totals, a revenue chart, an agent team selector and actionable priorities.

Belgi (blue, beret) handles business priorities; Sana (lime, raised eyes) handles clients and reviews; Qor (yellow, glasses) handles inventory and procurement. The shared characters use genuinely rendered 3D plush assets with transparent backgrounds in `public/agents3d/`. Each WebP atlas includes calm, waving, thinking and blinking poses; CSS controls breathing, greetings and state changes. All three atlases total approximately 839 KB. Generated originals and the built-in ImageGen prompt manifest are preserved in `artifacts/agents3d-source/` and `artifacts/agents3d-prompts.json`. Motion can be paused and respects reduced-motion preferences. A 128 px character and short speech bubble open a mini chat; expanding it reserves a 380 px right panel on wide screens. Narrow content uses stacked views and single-pane inbox navigation.

Free exposes one universal agent; Pro demo exposes all three and rotates contextual tips while the chat is closed. These are product demos, with no billing or subscription activation. Preferences use `bagyt-agent-plan`, `bagyt-agent-id` and `bagyt-theme`. `/demo?plan=free`, `/demo?plan=pro` and `/demo?plan=pro&agent=sana` are supported. Demo chats use clearly labeled deterministic responses based on local synthetic state and never send messages or procurement orders externally.

The connected app retains its real AI API. Its optional `agent` field is restricted to `belgi`, `sana`, or `qor`; both existing Gemini and OpenAI paths apply the selected specialist without widening data access or action permissions. Missing client or stock data is not invented. Existing source/evidence filtering and tenant checks remain.

Validation: 43 automated tests pass, including Free gating, context routing, API persona allowlisting and unchanged evidence/action restrictions. TypeScript and production build pass. Browser checks cover desktop/mobile, light/dark, mini-chat/right panel, Pro switching, contextual replies and navigation. The production domain is https://bagyt-ai.vercel.app; public presentation is `/?view=about` and business demo is `/demo`.

### Head animation, unified inbox and measurable goals — 15.10.2026

The current UI supersedes the earlier full-body character and static growth-card designs. The shared three-dimensional heads keep a fixed silhouette: blink and speech frames are masked to facial areas, with subtle two-pixel floating and pointer tilt. Compact avatars stay still; motion can be paused and respects reduced-motion. The landing page has one guide that moves between four sections, provides contextual explanations and opens a small help panel. Light and dark themes cover the entire landing and workspace, with the saved theme applied before first paint.

The inbox includes branded WhatsApp, Instagram, TikTok and website channels, plus 2GIS reviews. It supports editable local replies, an opt-in automatic-reply preview, client history and SKU-linked order drafts. The phone conversation uses the available screen and hides the floating guide to keep the composer accessible. External messages are never sent; orders remain drafts and do not alter stock or booked revenue. Automation can produce local replies, order drafts and supplier requests, preserving edited drafts and preventing duplicate runs. Coffee, tea and other products now have native SVG packaging illustrations.

Monthly goals persist in `bagyt-business-goals-v1`: revenue, paid-order count and reply coverage. Progress uses the same sales snapshot as the overview; the remaining daily pace is arithmetic, not a sales forecast. Completing a plan step never invents revenue. Business-specific steps cover waiting customers, coffee replenishment and testing tea gift sets. Workspace navigation supports `?page=` and browser Back; task links open the matching section.

Generated head sources are in `artifacts/heads-source/`; delivery atlases are `public/agents3d/{belgi,sana,qor}-head.webp`. `artifacts/head-prompts.json` preserves the built-in ImageGen prompts and references. `artifacts/prepare-head-assets.mjs` only encodes delivery WebP files; facial animation is implemented in CSS.

Validation: 54/54 automated tests, TypeScript and Vercel production build pass. Public HTTPS browser checks covered theme persistence, single-guide tour, section deep links, edited reply and order creation, automatic replies, saved KPI targets, product illustrations, and a 390×844 mobile conversation without horizontal overflow. Test interactions only changed local sample-workspace state.

### Scroll-led landing and official channel marks — 15.10.2026

The landing now uses one continuous stage with exactly three rendered heads. They begin centered under the headline and take turns introducing business goals (Belgi), customer conversations (Sana), and procurement (Qor) as the user scrolls normally. There are no tour controls in the story. Fixed silhouettes preserve stable blinks; greeting, thinking, curiosity, and celebration have restrained separate motions. Light/dark surfaces and the Russian-first introduction are consistent. Manual language selections are saved with `bagyt-language-choice-v2`; legacy automatically saved Kazakh values do not override the new default.

On phones, chapter headings determine the active agent. Short landscape screens and reduced-motion preferences receive a static, non-sticky presentation. Kaspi and TikTok use unmodified official local assets in `public/channels/` instead of approximate glyphs; source URLs are recorded there. The marks also appear in the sample sales table and relevant connection cards.

Validation: 57/57 tests, TypeScript and production build passed. Public browser checks covered the centered trio, all three scroll chapters, both themes, language persistence, the growth-plan deep link, loaded official assets, no horizontal overflow at 390×844, and a usable non-sticky stage at 667×375. Browser error logs were empty. Vercel deployment `dpl_2WmxB8XyWb3bDr8GS4BeN1mBkjPE` is READY on production and aliased to `bagyt-ai.vercel.app`; its runtime error-log query returned no records. No external log drains are configured. This release uploads the current working tree based on `e687b25`, including its uncommitted UI changes.
