# Garwood Glow JA — PRD

## Problem Statement
Premium residential & commercial cleaning company website for Jamaica. Luxury-minimal black/purple brand. Must generate quote requests, build trust, and include an AI Glow Guide that recommends a cleaning package from property/needs/schedule with side-by-side comparison + reasoning. Quotes saved to DB, viewable/approvable in an admin dashboard. Photos upload with quotes. PayPal for clients to pay an admin-set price on an approved quote.

## Architecture
- Backend: FastAPI + MongoDB (`/api` prefix). JWT admin auth (Bearer). Emergent object storage for photos. Claude Sonnet 4.6 via emergentintegrations for AI reasoning. PayPal REST (Orders v2) for payments.
- Frontend: React 19 + Tailwind + shadcn/ui + Framer Motion + lucide-react. Dark luxury theme (Outfit/Plus Jakarta Sans).

## User Personas
- Prospective client (homeowner, professional, Airbnb host, property manager, business).
- Business owner/admin (reviews, approves & prices quotes, collects payment).

## Core Requirements (static)
- All pages: Home, About, Services, Service detail, Gallery, Quote wizard, AI Glow Guide, FAQ, Blog, Contact, Privacy, Terms, 404.
- AI Glow Guide: recommendation + 3-package comparison ("Custom Quote" pricing) + reasoning + factors.
- Multi-step Quote wizard with photo uploads.
- Admin dashboard: stats, filters, quote detail, status flow, approve+price, Pay Now link generation.
- PayPal Pay Now page per approved quote.

## Implemented (2026-06)
- Full public site (all pages) with premium dark/purple design, logo integrated. [done]
- AI Glow Guide (Claude Sonnet 4.6) with recommendation, comparison, reasoning, factors. [done, tested 100%]
- Quote wizard (5 steps) + object-storage photo uploads → saved to DB. [done, tested]
- JWT admin auth + dashboard (view, filter, status update, photo view). [done, tested]
- PayPal integration: admin approve+set price → client `/pay/{id}` PayPal checkout → capture → mark paid. Backend verified; awaiting PayPal keys for live button test. [done, keys pending]

## Backlog / Remaining
- P0: Add user's PayPal Sandbox Client ID + Secret to enable live PayPal button + capture.
- P1: Email notifications on quote submit / approval (Resend).
- P1: Upload size/MIME validation on `/api/uploads`.
- P2: Customer portal, recurring plans, real blog CMS, JMD currency conversion display.

## Next Tasks
- Collect PayPal credentials and flip PAYPAL_CLIENT_ID/SECRET; test sandbox payment end-to-end.
