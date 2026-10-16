"use client";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Link,
  LockKeyhole,
  ShieldCheck,
  Unplug,
} from "lucide-react";
import { api, Robot } from "./ui";
import ChannelIcon from "./channel-icon";
export default function Connector({
  source,
  language,
  onDone,
  onClose,
}: {
  source: any;
  language: "ru" | "kk";
  onDone: () => Promise<void>;
  onClose: () => void;
}) {
  const t = (ru: string, kk: string) => (language === "ru" ? ru : kk);
  const [step, setStep] = useState(source.connection ? 3 : 1),
    [identifier, setIdentifier] = useState(source.connection?.identifier || ""),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const phone = ["POS", "WhatsApp"].includes(source.name);
  const placeholders: Record<string, string> = {
    Instagram: "https://instagram.com/your.business",
    TikTok: "https://www.tiktok.com/@your.business",
    "2GIS": "https://2gis.kz/almaty/firm/…",
    Сайт: "https://your-business.kz",
  };
  async function save() {
    setBusy(true);
    setError("");
    try {
      await api("connections", { provider: source.name, identifier, consent });
      await onDone();
      setStep(3);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function disconnect() {
    setBusy(true);
    setError("");
    try {
      await api("connections/disconnect", { provider: source.name });
      await onDone();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="connector-flow">
      {step < 3 && (
        <div className="connector-helper">
          <Robot
            size={74}
            state={busy ? "thinking" : step === 2 ? "curious" : "greeting"}
          />
          <p>
            {busy
              ? t("Сохраняю ваше подключение…", "Қосылымды сақтап жатырмын…")
              : step === 2
                ? t(
                    "Всё под вашим контролем. Дайте разрешение — и готово.",
                    "Барлығы сіздің бақылауыңызда. Рұқсат берсеңіз — дайын.",
                  )
                : t(
                    "Укажите контакт вашего бизнеса. Я проведу дальше.",
                    "Бизнес байланысын енгізіңіз. Әрі қарай көмектесемін.",
                  )}
          </p>
        </div>
      )}
      <div className="connector-steps">
        {[
          t("Контакт", "Байланыс"),
          t("Разрешение", "Рұқсат"),
          t("Готово", "Дайын"),
        ].map((name, i) => (
          <span className={step >= i + 1 ? "current" : ""} key={name}>
            <i>{step > i + 1 ? <Check size={12} /> : i + 1}</i>
            {name}
          </span>
        ))}
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
        >
          <div className="connector-intro">
            <span className="connector-brand">
              {/kaspi|каспи|tik[\s._-]*tok|тикток/i.test(source.name) ? (
                <ChannelIcon source={source.name} size={40} />
              ) : (
                source.letter
              )}
            </span>
            <div>
              <h3>{source.title}</h3>
              <p>
                {t(
                  "Один источник — больше ясности о бизнесе.",
                  "Бір дереккөз — бизнес туралы көбірек мәлімет.",
                )}
              </p>
            </div>
          </div>
          <label>
            {phone
              ? t("Номер бизнеса", "Бизнес нөмірі")
              : t(
                  "Ссылка на страницу бизнеса",
                  "Бизнес парақшасының сілтемесі",
                )}
            <input
              autoFocus
              required
              type={phone ? "tel" : "url"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={
                phone ? "+7 700 000 00 00" : placeholders[source.name]
              }
              maxLength={300}
            />
          </label>
          <div className="connector-note">
            <LockKeyhole size={18} />
            <p>
              {t(
                "Это демо-подключение. Пароль от сервиса не нужен. Мы не обращаемся к вашему аккаунту.",
                "Бұл — демо-қосылым. Сервис құпиясөзі қажет емес. Аккаунтыңызға кірмейміз.",
              )}
            </p>
          </div>
          <button className="primary full">
            {t("Продолжить", "Жалғастыру")}
            <ArrowRight size={16} />
          </button>
        </form>
      )}
      {step === 2 && (
        <div>
          <div className="connector-permission">
            <ShieldCheck size={32} />
            <h3>{t("Вы управляете доступом", "Рұқсатты өзіңіз басқарасыз")}</h3>
            <p>{identifier}</p>
          </div>
          <div className="permission-row">
            <CheckCircle2 size={18} />
            <div>
              <b>{t("Профиль бизнеса", "Бизнес профилі")}</b>
              <small>
                {t(
                  "Номер или ссылка, которые вы указали",
                  "Сіз енгізген нөмір немесе сілтеме",
                )}
              </small>
            </div>
          </div>
          <div className="permission-row">
            <CheckCircle2 size={18} />
            <div>
              <b>
                {t("Просмотр статистики · демо", "Статистиканы көру · демо")}
              </b>
              <small>
                {t(
                  "Покажем сценарий без доступа к реальным данным",
                  "Нақты деректерге кірмей сценарийді көрсетеміз",
                )}
              </small>
            </div>
          </div>
          <label className="checkbox consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            {t(
              "Разрешаю сохранить этот контакт и включить демо-подключение. Доступ можно отозвать в любой момент.",
              "Бұл байланысты сақтауға және демо-қосылымды қосуға рұқсат беремін. Кез келген уақытта ажыратуға болады.",
            )}
          </label>
          <button
            className="primary full"
            disabled={!consent || busy}
            onClick={save}
          >
            {busy
              ? t("Сохраняем…", "Сақталуда…")
              : t(
                  "Разрешить и подключить демо",
                  "Рұқсат беру және демоны қосу",
                )}
            <ArrowRight size={16} />
          </button>
          <button
            className="text-button auth-switch"
            disabled={busy}
            onClick={() => setStep(1)}
          >
            {t("Назад", "Артқа")}
          </button>
        </div>
      )}
      {step === 3 && (
        <div className="connector-success">
          <Robot size={120} state="success" />
          <span className="badge">{t("Демо подключено", "Демо қосылды")}</span>
          <h3>
            {source.title} {t("готов к знакомству", "танысуға дайын")}
          </h3>
          <p className="connection-identity">
            <Link size={14} />
            {identifier}
          </p>
          <p>
            {t(
              "Настройки сохранены. Это имитация подключения: реальные сообщения, заказы и отзывы пока не загружаются. Для настоящих данных используйте импорт файла или Webhook сайта.",
              "Баптаулар сақталды. Бұл қосылым үлгісі: нақты хабарламалар, тапсырыстар мен пікірлер әзірше жүктелмейді. Нақты деректер үшін файл импортын немесе сайт Webhook-ын қолданыңыз.",
            )}
          </p>
          <button className="primary full" onClick={onClose}>
            {t("Готово, к моим источникам", "Дайын, дереккөздерге өту")}
            <Check size={16} />
          </button>
          <button
            className="text-button auth-switch"
            disabled={busy}
            onClick={disconnect}
          >
            <Unplug size={14} />
            {t("Отключить демо", "Демоны ажырату")}
          </button>
        </div>
      )}
    </div>
  );
}
