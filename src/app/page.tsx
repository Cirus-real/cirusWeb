'use client';

import { useEffect, useState, useRef } from 'react';
import { FaReact, FaNodeJs, FaDatabase, FaHtml5, FaCss3Alt } from 'react-icons/fa';
import { sendWebhookMessage, WebhookPayload } from '../units/webhook';
import Link from 'next/link';
import Image from 'next/image';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const testimonials = [
  {
    name: "John Doe",
    text: "Współpraca z Cirus była znakomita! Projekt został wykonany szybko i profesjonalnie.",
  },
  {
    name: "Jane Smith",
    text: "Bardzo polecam! Cirus dostarczył dokładnie to, czego potrzebowaliśmy.",
  },
  {
    name: "Michael Johnson",
    text: "Usługi na najwyższym poziomie. Na pewno wrócimy do współpracy.",
  },
];

const translations = {
  en: {
    title: "Looking for a developer?",
    description: "You've come to the right place. I offer development services for the FiveM platform.",
    portfolio: "Portfolio",
    showMore: "Show More",
    showLess: "Show Less",
    contact: "Contact",
    contactMe: "Contact me",
    discordNick: "Discord Nickname",
    message: "Message",
    send: "Send",
    joinDiscord: "Discord",
    successMessage: "Message has been sent!",
    errorMessage: "There was an error sending your message.",
  },
  pl: {
    title: "Szukasz developera?",
    description: "Świetnie trafiłeś, oferuję usługi developerskie do platformy FiveM.",
    portfolio: "Portfolio",
    showMore: "Pokaż więcej",
    showLess: "Pokaż mniej",
    contact: "Kontakt",
    contactMe: "Skontaktuj się ze mną",
    discordNick: "Nick discord",
    message: "Wiadomość",
    send: "Wyślij",
    joinDiscord: "Discord",
    successMessage: "Wiadomość została wysłana!",
    errorMessage: "Wystąpił błąd podczas wysyłania wiadomości.",
  }
};

type Lang = keyof typeof translations;

const detectLanguage = (): Lang => {
  const lang = navigator.language;
  return lang.startsWith('pl') ? 'pl' : 'en';
};

const Notification = ({ message, type, onClose }: NotificationProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type} ${isExiting ? 'exit' : ''}`}>
      <p>{message}</p>
    </div>
  );
};

const animateValue = (element: HTMLElement, start: number, end: number, duration: number) => {
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.innerHTML = Math.floor(progress * (end - start) + start).toString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
};

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const handleNextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const userLang = detectLanguage();
    setLang(userLang);
  }, []);

  const t = translations[lang];

  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const portfolioItems = [
    { title: 'Extra Item 1', description: 'Dodatkowy opis 1' },
    { title: 'Extra Item 2', description: 'Dodatkowy opis 2' },
    { title: 'Extra Item 3', description: 'Dodatkowy opis 3' },
    { title: 'Extra Item 4', description: 'Dodatkowy opis 4' },
    { title: 'Extra Item 5', description: 'Dodatkowy opis 5' },
    { title: 'Extra Item 6', description: 'Dodatkowy opis 6' },
    { title: 'Extra Item 7', description: 'Dodatkowy opis 7' },
    { title: 'Extra Item 8', description: 'Dodatkowy opis 8' },
    { title: 'Extra Item 9', description: 'Dodatkowy opis 9' },
    { title: 'Extra Item 10', description: 'Dodatkowy opis 10' },
  ];

  const visibleItems = showMore ? portfolioItems : portfolioItems.slice(0, 5);

  const handleShowMoreToggle = () => {
    setShowMore(!showMore);

    document.querySelector('.portfolio')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const countersRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (countersRef.current) {
        const rect = countersRef.current.getBoundingClientRect();
        if (rect.top <= window.innerHeight) {
          const counters = countersRef.current.querySelectorAll<HTMLElement>('.counter');
          counters.forEach((counter) => {
            const endValue = parseInt(counter.getAttribute('data-end') || '0', 10);
            animateValue(counter, 0, endValue, 2000);
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const forbiddenWords = ['<script>', '</script>', '@everyone', '@here'];

  const containsForbiddenWords = (text: string) => {
    return forbiddenWords.some((word) => text.toLowerCase().includes(word));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    if (containsForbiddenWords(message)) {
      setNotification({
        message: t.errorMessage,
        type: 'error',
      });
      setIsSubmitting(false);
      return;
    }

    const payload: WebhookPayload = {
      username: name,
      content: message.replace(/<[^>]*>?/gm, ''),
    };

    const success = await sendWebhookMessage(payload);

    if (success) {
      setNotification({
        message: t.successMessage,
        type: 'success',
      });
      setName('');
      setMessage('');
    } else {
      setNotification({
        message: t.errorMessage,
        type: 'error',
      });
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll('.fade-in, .slide-up');

    const handleScroll = () => {
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight) {
          el.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="mainContainer">
      <header className="slide-up">
        <h1>Cirus</h1>
        <ul>
          <li>Panel</li>
          <li>
            <Link href="https://discord.gg/zbkKWRbS" className="custom-link">{t.joinDiscord}</Link>
          </li>
        </ul>
      </header>

      <div className="headerTwo slide-up">
        <div className="text">
          <span id="mainText">{t.title}</span>
          {t.description}
        </div>
      </div>

      <section className="counters slide-up" ref={countersRef}>
        <div className="counterItem">
          <h3 className="counter" data-end="50">0</h3>
          <p>Projekty ukończone</p>
        </div>
        <div className="counterItem">
          <h3 className="counter" data-end="100">0</h3>
          <p>Zadowoleni klienci</p>
        </div>
        <div className="counterItem">
          <h3 className="counter" data-end="100000">0</h3>
          <p>Linijki kodu</p>
        </div>
      </section>

      <section className="testimonials slide-up">
        <h2>Opinie klientów</h2>
        <div className="testimonial">
          <p>&quot;{testimonials[currentTestimonial].text}&quot;</p>
          <h4>- {testimonials[currentTestimonial].name}</h4>
        </div>
        <button onClick={handleNextTestimonial}>Następna opinia</button>
      </section>

      <section className="skills slide-up">
        <h2>Moje Umiejętności</h2>
        <div className="skillsIcons">
          <div className="skill">
            <FaReact size={50} />
            <p>React</p>
          </div>
          <div className="skill">
            <FaNodeJs size={50} />
            <p>Node.js</p>
          </div>
          <div className="skill">
            <FaDatabase size={50} />
            <p>Bazy danych</p>
          </div>
          <div className="skill">
            <FaHtml5 size={50} />
            <p>HTML5</p>
          </div>
          <div className="skill">
            <FaCss3Alt size={50} />
            <p>CSS3</p>
          </div>
        </div>
      </section>

      <section className="portfolio slide-up">
        <h2>{t.portfolio}</h2>
        <div className={`portfolioGrid ${showMore ? 'expanded' : ''}`}>
          {visibleItems.map((item, index) => (
            <div className="portfolioItem" key={index}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
        <button className="show-more-button" onClick={handleShowMoreToggle}>
          {showMore ? t.showLess : t.showMore}
        </button>
      </section>

      <section className="contact slide-up">
        <h2>{t.contact}</h2>
        <div className="contactContent">
          <div className="contactForm">
            <h3>{t.contactMe}</h3>
            <form onSubmit={handleSubmit}>
              <div className="formGroup">
                <label htmlFor="name">{t.discordNick}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="formGroup">
                <label htmlFor="message">{t.message}</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Wysyłanie...' : t.send}
              </button>
            </form>
          </div>
          <div className="discordWidget">
            <h3>{t.joinDiscord}</h3>
            <iframe
              src="https://discord.com/widget?id=1279199912583495832&theme=dark"
              width="350"
              height="500"
              allowTransparency
              frameBorder="0"
              sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            ></iframe>
          </div>
        </div>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </section>

      <footer className="footer slide-up">
        <div className="footerContent">
          <div className="footerSection">
            <h3>{t.contact}</h3>
            <p>Email: cirus.real@gmail.com</p>
            <p>Discord: cirus.real#0</p>
          </div>
          <div className="footerSection">
            <h3>Na skróty</h3>
            <ul>
              <li><a href="#">{t.title}</a></li>
              <li><a href="#">{t.portfolio}</a></li>
              <li><a href="#">{t.contact}</a></li>
            </ul>
          </div>
          <div className="footerSection">
            <h3>Znajdź mnie</h3>
            <ul className="socialIcons">
              <li><a href="#"><Image src="/twitter.svg" alt="Twitter" width={24} height={24} /></a></li>
              <li><a href="#"><Image src="/discord.svg" alt="Discord" width={24} height={24} /></a></li>
            </ul>
          </div>
        </div>
        <div className="footerBottom">
          <p>&copy; 2024 Cirus. Wszystkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
}
