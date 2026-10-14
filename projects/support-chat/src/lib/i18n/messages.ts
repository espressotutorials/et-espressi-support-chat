import { SupportLanguage } from '../support-chat.models';

export interface ChatStrings {
  title: string; welcome: string; ai: string; privacy: string; emailLabel: string; emailHint: string;
  emailInvalid: string; send: string; placeholder: string; end: string; close: string; resolved: string;
  yes: string; no: string; ticket: string; feedback: string; comment: string; continue: string;
  ticketSuccess: string; ticketUnknown: string; ticketFailed: string; noKnowledge: string; genericError: string; sensitive: string;
  expired: string; rateLimited: string; retry: string; skip: string; loading: string; sources: string;
  chatEnded: string; newChat: string;
}

const messages: Record<'de' | 'en', ChatStrings> = {
  en: {
    title: 'Support-Team', welcome: 'Hello! How can we help?', ai: 'AI-assisted support', privacy: 'Privacy',
    emailLabel: 'Your email address', emailHint: 'Please provide your email so we can associate your request with you.',
    emailInvalid: 'Enter a valid email address.', send: 'Send', placeholder: 'Write your message…', end: 'End chat', close: 'Close',
    resolved: 'Did this solve your problem?', yes: 'Yes', no: 'No', ticket: 'Create a support ticket',
    feedback: 'How was your support experience?', comment: 'Optional comment', continue: 'Continue',
    ticketSuccess: 'Ticket submitted successfully.', ticketUnknown: 'Ticket status is unclear. Please do not submit again.', ticketFailed: 'The ticket could not be submitted. Please try again later.', noKnowledge: 'I could not find a reliable answer. You can create a support ticket.',
    genericError: 'Something went wrong. Please try again.', sensitive: 'Please do not include sensitive information in your message.',
    expired: 'The session expired. Retry to start a new chat.', rateLimited: 'Please wait before trying again.', retry: 'Retry sending', skip: 'Skip',
    loading: 'One moment please…', sources: 'Sources',
    chatEnded: 'This chat has ended. If you have more questions, start a new chat.', newChat: 'Start a new chat'
  },
  de: {
    title: 'Support-Team', welcome: 'Hallo! Wie können wir helfen?', ai: 'KI-gestützter Support', privacy: 'Datenschutz',
    emailLabel: 'Deine E-Mail-Adresse', emailHint: 'Bitte gib deine E-Mail-Adresse an, damit wir deine Anfrage zuordnen können.',
    emailInvalid: 'Bitte gib eine gültige E-Mail-Adresse ein.', send: 'Senden', placeholder: 'Nachricht schreiben…', end: 'Chat beenden', close: 'Schließen',
    resolved: 'Hat das dein Problem gelöst?', yes: 'Ja', no: 'Nein', ticket: 'Ticket anlegen',
    feedback: 'Wie war deine Support-Erfahrung?', comment: 'Kommentar (optional)', continue: 'Weiter',
    ticketSuccess: 'Ticket erfolgreich übermittelt.', ticketUnknown: 'Status derzeit unklar. Bitte nicht mehrfach senden.', ticketFailed: 'Das Ticket konnte nicht übermittelt werden. Bitte versuche es später erneut.', noKnowledge: 'Ich habe keine verlässliche Antwort gefunden. Du kannst ein Support-Ticket anlegen.',
    genericError: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.', sensitive: 'Bitte teile keine sensiblen Daten im Nachrichtentext.',
    expired: 'Die Sitzung ist abgelaufen. Mit erneutem Senden startest du einen neuen Chat.', rateLimited: 'Bitte warte kurz, bevor du es erneut versuchst.', retry: 'Erneut senden', skip: 'Überspringen',
    loading: 'Einen Moment bitte…', sources: 'Quellen',
    chatEnded: 'Der Chat ist beendet. Wenn du weitere Fragen hast, starte einfach einen neuen Chat.', newChat: 'Neuen Chat starten'
  }
};

/** UI messages supported by the initial release. Other configured languages currently fall back to German. */
export function getChatStrings(language: SupportLanguage): ChatStrings {
  return messages[language === 'en' ? 'en' : 'de'];
}
