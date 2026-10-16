import { SupportLanguage } from '../support-chat.models';

export interface ChatStrings {
  title: string; welcome: string; ai: string; privacy: string; emailLabel: string; emailHint: string;
  emailInvalid: string; send: string; placeholder: string; end: string; close: string; resolved: string;
  yes: string; no: string; ticket: string; feedback: string; comment: string; continue: string;
  ticketSuccess: string; ticketUnknown: string; ticketFailed: string; noKnowledge: string; genericError: string; sensitive: string;
  expired: string; rateLimited: string; retry: string; skip: string; loading: string; sources: string;
  feedbackFailed: string; requestUncertain?: string; replyMismatch?: string; feedbackUncertain?: string; chatEnded: string; newChat: string;
}

type LocalizedLanguage = Exclude<SupportLanguage, 'pt'>;

const messages: Record<LocalizedLanguage, ChatStrings> = {
  en: {
    title: 'Support-Team', welcome: 'Hello! How can we help?', ai: 'AI-assisted support', privacy: 'Privacy',
    emailLabel: 'Your email address', emailHint: 'Please provide your email so we can associate your request with you.',
    emailInvalid: 'Enter a valid email address.', send: 'Send', placeholder: 'Write your message…', end: 'End chat', close: 'Close',
    resolved: 'Did this solve your problem?', yes: 'Yes', no: 'No', ticket: 'Create a support ticket',
    feedback: 'How was your support experience?', comment: 'Optional comment', continue: 'Continue',
    ticketSuccess: 'Ticket submitted successfully.', ticketUnknown: 'Ticket status is unclear. Please do not submit again.', ticketFailed: 'The ticket could not be submitted. Please try again later.', noKnowledge: 'I could not find a reliable answer. You can create a support ticket.',
    genericError: 'Something went wrong. Please try again.', sensitive: 'Please do not include sensitive information in your message.',
    expired: 'The session expired. Retry to start a new chat.', rateLimited: 'Please wait before trying again.', retry: 'Retry sending', skip: 'Skip',
    loading: 'One moment please…', sources: 'Sources', feedbackFailed: 'Your rating could not be saved. You can try again or skip it.',
    requestUncertain: 'We did not receive a response. Your message may have been processed; retrying will reuse the same message ID.', replyMismatch: 'The response did not match this message and was not displayed. You can retry this message.',
    feedbackUncertain: 'We could not confirm whether your rating was saved. It will not be sent again; skip to close the chat.',
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
    loading: 'Einen Moment bitte…', sources: 'Quellen', feedbackFailed: 'Deine Bewertung konnte nicht gespeichert werden. Du kannst es erneut versuchen oder überspringen.',
    requestUncertain: 'Es kam keine Antwort zurück. Deine Nachricht könnte verarbeitet worden sein; beim erneuten Versuch wird dieselbe Nachrichten-ID verwendet.', replyMismatch: 'Die Antwort passt nicht zu dieser Nachricht und wurde nicht angezeigt. Du kannst die Nachricht erneut versuchen.',
    feedbackUncertain: 'Der Status deiner Bewertung ist unklar. Sie wird nicht erneut gesendet; überspringe die Bewertung, um den Chat zu schließen.',
    chatEnded: 'Der Chat ist beendet. Wenn du weitere Fragen hast, starte einfach einen neuen Chat.', newChat: 'Neuen Chat starten'
  },
  es: {
    title: 'Equipo de soporte', welcome: '¡Hola! ¿En qué podemos ayudarte?', ai: 'Soporte asistido por IA', privacy: 'Privacidad',
    emailLabel: 'Tu dirección de correo electrónico', emailHint: 'Indica tu correo electrónico para que podamos asociar tu solicitud contigo.',
    emailInvalid: 'Introduce una dirección de correo electrónico válida.', send: 'Enviar', placeholder: 'Escribe tu mensaje…', end: 'Finalizar chat', close: 'Cerrar',
    resolved: '¿Se ha resuelto tu problema?', yes: 'Sí', no: 'No', ticket: 'Crear una solicitud de soporte',
    feedback: '¿Qué te ha parecido la atención recibida?', comment: 'Comentario opcional', continue: 'Continuar',
    ticketSuccess: 'La solicitud se ha enviado correctamente.', ticketUnknown: 'No se ha podido confirmar el estado de la solicitud. No la vuelvas a enviar.', ticketFailed: 'No se ha podido enviar la solicitud. Inténtalo de nuevo más tarde.', noKnowledge: 'No he encontrado una respuesta fiable. Puedes crear una solicitud de soporte.',
    genericError: 'Se ha producido un error. Inténtalo de nuevo.', sensitive: 'No incluyas información confidencial en tu mensaje.',
    expired: 'La sesión ha caducado. Vuelve a enviar el mensaje para iniciar un chat nuevo.', rateLimited: 'Espera un momento antes de volver a intentarlo.', retry: 'Reintentar envío', skip: 'Omitir',
    loading: 'Un momento, por favor…', sources: 'Fuentes', feedbackFailed: 'No se ha podido guardar tu valoración. Puedes volver a intentarlo u omitirla.',
    requestUncertain: 'No se recibió respuesta. Es posible que el mensaje se haya procesado; al reintentarlo se usará el mismo identificador.', replyMismatch: 'La respuesta no corresponde a este mensaje y no se ha mostrado. Puedes volver a intentarlo.',
    feedbackUncertain: 'No se pudo confirmar si se guardó tu valoración. No se enviará otra vez; omítela para cerrar el chat.',
    chatEnded: 'Este chat ha finalizado. Si tienes más preguntas, inicia un chat nuevo.', newChat: 'Iniciar un chat nuevo'
  },
  fr: {
    title: 'Équipe d’assistance', welcome: 'Bonjour ! Comment pouvons-nous vous aider ?', ai: 'Assistance avec IA', privacy: 'Confidentialité',
    emailLabel: 'Votre adresse e-mail', emailHint: 'Veuillez indiquer votre adresse e-mail afin que nous puissions associer votre demande à votre profil.',
    emailInvalid: 'Veuillez saisir une adresse e-mail valide.', send: 'Envoyer', placeholder: 'Écrivez votre message…', end: 'Terminer la conversation', close: 'Fermer',
    resolved: 'Votre problème est-il résolu ?', yes: 'Oui', no: 'Non', ticket: 'Créer une demande d’assistance',
    feedback: 'Comment s’est passée votre expérience avec notre assistance ?', comment: 'Commentaire facultatif', continue: 'Continuer',
    ticketSuccess: 'Votre demande a bien été envoyée.', ticketUnknown: 'Le statut de votre demande n’est pas confirmé. Veuillez ne pas la renvoyer.', ticketFailed: 'Votre demande n’a pas pu être envoyée. Veuillez réessayer plus tard.', noKnowledge: 'Je n’ai pas trouvé de réponse fiable. Vous pouvez créer une demande d’assistance.',
    genericError: 'Une erreur s’est produite. Veuillez réessayer.', sensitive: 'Veuillez ne pas inclure d’informations sensibles dans votre message.',
    expired: 'La session a expiré. Renvoyez votre message pour démarrer une nouvelle conversation.', rateLimited: 'Veuillez patienter avant de réessayer.', retry: 'Renvoyer', skip: 'Ignorer',
    loading: 'Veuillez patienter…', sources: 'Sources', feedbackFailed: 'Votre avis n’a pas pu être enregistré. Vous pouvez réessayer ou l’ignorer.',
    requestUncertain: 'Aucune réponse n’a été reçue. Votre message a peut-être été traité ; une nouvelle tentative réutilisera le même identifiant.', replyMismatch: 'La réponse ne correspond pas à ce message et n’a pas été affichée. Vous pouvez réessayer.',
    feedbackUncertain: 'Nous n’avons pas pu confirmer l’enregistrement de votre avis. Il ne sera pas renvoyé ; ignorez-le pour terminer le chat.',
    chatEnded: 'Cette conversation est terminée. Si vous avez d’autres questions, démarrez-en une nouvelle.', newChat: 'Démarrer une nouvelle conversation'
  },
  ja: {
    title: 'サポートチーム', welcome: 'こんにちは。どのようなご用件でしょうか？', ai: 'AIによるサポート', privacy: 'プライバシー',
    emailLabel: 'メールアドレス', emailHint: 'お問い合わせをお客様に紐づけるため、メールアドレスを入力してください。',
    emailInvalid: '有効なメールアドレスを入力してください。', send: '送信', placeholder: 'メッセージを入力…', end: 'チャットを終了', close: '閉じる',
    resolved: '問題は解決しましたか？', yes: 'はい', no: 'いいえ', ticket: 'サポートチケットを作成',
    feedback: 'サポートの対応はいかがでしたか？', comment: 'コメント（任意）', continue: '続行',
    ticketSuccess: 'チケットを送信しました。', ticketUnknown: 'チケットの状態を確認できません。再送信しないでください。', ticketFailed: 'チケットを送信できませんでした。時間をおいて再度お試しください。', noKnowledge: '確かな回答が見つかりませんでした。サポートチケットを作成できます。',
    genericError: 'エラーが発生しました。もう一度お試しください。', sensitive: 'メッセージに機密情報を入力しないでください。',
    expired: 'セッションの有効期限が切れました。もう一度送信すると新しいチャットが始まります。', rateLimited: '少し待ってからもう一度お試しください。', retry: '再送信', skip: 'スキップ',
    loading: 'しばらくお待ちください…', sources: '参照元', feedbackFailed: '評価を保存できませんでした。もう一度試すか、スキップしてください。',
    requestUncertain: '応答を受信できませんでした。メッセージは処理済みの可能性があります。再試行時は同じメッセージIDを使用します。', replyMismatch: 'このメッセージに対応しない応答のため表示しませんでした。再試行できます。',
    feedbackUncertain: '評価が保存されたか確認できません。再送信は行いません。スキップしてチャットを終了してください。',
    chatEnded: 'このチャットは終了しました。ご質問がある場合は、新しいチャットを開始してください。', newChat: '新しいチャットを開始'
  }
};

/** Portuguese is accepted by the API but currently uses the German UI strings. */
export function getChatStrings(language: SupportLanguage): ChatStrings {
  return language in messages ? messages[language as LocalizedLanguage] : messages.de;
}
