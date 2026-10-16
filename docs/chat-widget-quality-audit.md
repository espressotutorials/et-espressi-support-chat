# Chat widget quality audit

Audit date: 2026-10-16

## Existing package and API contract

This repository contains the existing Angular 22 library package
`@espressotutorialsgmbh/et-espressi-support-chat` and the self-contained custom
element package. The Angular component uses Shadow DOM and generated Tailwind
3.x styles. The public API and build/release configuration are already in use;
this audit does not add another application or widget.

The widget creates sessions with `POST /api/v1/support-chat/sessions` and sends
messages to `POST /api/v1/support-chat/sessions/{chatId}/messages`. The request
contains a locally generated `clientMessageId` and message text. The response
model requires `messageId`, allows an echoed `clientMessageId`, and contains
`answer`/`message`, sources, resolution and human-support flags. The test suite
already models the API echoing the request's `clientMessageId`. Resolution,
feedback, close and ticket actions use their existing session routes and
`X-Support-Session-Token` header. Ticket creation continues through the Node
API.

The browser code does not contain the Node API or LLM prompt. It cannot verify
why the model produced an answer about an earlier question when the backend
returns the current request's matching `clientMessageId`.

## Findings

- `sendPending()` is sequential: `busy` is set synchronously before the first
  await, and both the submit handler and retry handler check it. There is no
  `mergeMap`, automatic retry, replay, or queued-message pipeline. A duplicate
  submit while busy is ignored.
- Responses were appended in arrival order without checking the optional
  `clientMessageId`. A delayed or incorrectly correlated response from the API
  could therefore be rendered as the answer to the current turn. The response
  example and API service test establish that the API echoes this ID, so the
  widget can reject a mismatch while remaining compatible with older APIs that
  omit it.
- Requests had no timeout. A request that never settled kept `busy` true
  indefinitely. Message retries already retain the local `clientMessageId`;
  the widget does not automatically retry.
- Session restoration calls `GET /sessions/{chatId}` and restores session
  metadata only. It does not restore prior messages. Identity changes cancel
  API requests and use a generation guard to discard late responses.
- The four reported question/answer contents cannot be reproduced from this
  frontend repository: no raw response bodies or Node API are present. If an
  incorrect answer has the same echoed `clientMessageId`, its semantic cause
  is upstream and needs the separate Node API V3 audit.

## Changes and validation

The widget now associates its local user turn with `chatId` and
`clientMessageId`, checks a supplied response `clientMessageId`, and discards a
mismatch rather than showing it as the current answer. It classifies timeout,
network, server, and `CHAT_BUSY` outcomes as uncertain, keeps the same pending
message ID for explicit user retry, and applies a bounded request timeout. No
new request fields, routes, package exports, Angular/Tailwind upgrades, or
ticket behavior are introduced.

Uncertain ticket submissions are shown with the existing `unknown` state to
avoid creating a duplicate ticket. Uncertain feedback is not submitted again;
the widget offers the existing skip/close action. A new user turn hides the
previous resolution controls, and changing language now cancels and discards
the old language's in-flight response just like a platform change.

The API code is not present to prove server-side idempotency for repeated
`clientMessageId` values. The widget does not retry automatically; a manual
retry reuses the existing ID, but the Node API team should confirm that repeated
IDs return the original result instead of creating another turn.

Regression tests cover response-ID mismatch, delayed responses after identity
change, duplicate submit while a request is pending, timeout and same-ID retry,
session restoration, response correlation across four turns, existing contact
and ticket routes, uncertain ticket/feedback outcomes, and session creation
compatibility. Existing Markdown, custom-element and package build checks
remain in the suite.

## Remaining backend verification

- Confirm `clientMessageId` is idempotent on the message route.
- Confirm production replies echo the submitted ID. Replies from old API versions
  that omit the optional echo remain supported; the local sequential request
  association is used in that case.
- If the wrong answer is returned with the correct ID, inspect the Node API's
  conversation history and prompt/knowledge retrieval; this UI cannot repair
  semantic answer generation.
