--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (63f4182)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_category_id_categories_id_fk;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_account_id_accounts_id_fk;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.budgets DROP CONSTRAINT IF EXISTS budgets_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.budgets DROP CONSTRAINT IF EXISTS budgets_category_id_categories_id_fk;
ALTER TABLE IF EXISTS ONLY public.accounts DROP CONSTRAINT IF EXISTS accounts_user_id_users_id_fk;
DROP INDEX IF EXISTS public."IDX_transactions_user_date";
DROP INDEX IF EXISTS public."IDX_transactions_user_category";
DROP INDEX IF EXISTS public."IDX_transactions_user";
DROP INDEX IF EXISTS public."IDX_session_expire";
DROP INDEX IF EXISTS public."IDX_password_reset_user";
DROP INDEX IF EXISTS public."IDX_password_reset_expires";
DROP INDEX IF EXISTS public."IDX_categories_user_name";
DROP INDEX IF EXISTS public."IDX_categories_user";
DROP INDEX IF EXISTS public."IDX_budgets_user_period";
DROP INDEX IF EXISTS public."IDX_budgets_user";
DROP INDEX IF EXISTS public."IDX_accounts_user_name";
DROP INDEX IF EXISTS public."IDX_accounts_user";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.budgets DROP CONSTRAINT IF EXISTS budgets_pkey;
ALTER TABLE IF EXISTS ONLY public.accounts DROP CONSTRAINT IF EXISTS accounts_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.password_reset_tokens;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.budgets;
DROP TABLE IF EXISTS public.accounts;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    balance numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    user_id character varying NOT NULL
);


--
-- Name: budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budgets (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    category_id character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    period text DEFAULT 'monthly'::text NOT NULL,
    year text NOT NULL,
    month text,
    user_id character varying NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#6B7280'::text NOT NULL,
    icon text DEFAULT 'fas fa-tag'::text NOT NULL,
    localized_name text,
    user_id character varying NOT NULL
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    request_ip character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    amount numeric(10,2) NOT NULL,
    description text NOT NULL,
    date timestamp without time zone NOT NULL,
    category_id character varying NOT NULL,
    account_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    imported_category_raw text,
    confirmed boolean DEFAULT false,
    user_id character varying NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    password_hash character varying,
    email_verified boolean DEFAULT false,
    token_version text DEFAULT '0'::text,
    last_login timestamp without time zone
);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accounts (id, name, type, balance, user_id) FROM stdin;
ab0e8b8e-90f2-4511-b195-0a104ded15ab	Conto Corrente	checking	2500.00	ff1628d1-1c65-47fd-96ab-f6142f60513e
3f00b90b-326d-43bd-b0a2-90e5df544096	Carta di Credito	credit	0.00	ff1628d1-1c65-47fd-96ab-f6142f60513e
ddde5d8f-5b35-496e-a418-6ce2830a298f	Carta di Debito	debit	500.00	ff1628d1-1c65-47fd-96ab-f6142f60513e
3f0bf1cd-51bc-45d3-af9a-958d0204dac7	Contanti	cash	150.00	ff1628d1-1c65-47fd-96ab-f6142f60513e
7c992701-7014-4192-9ddd-d23c26391599	Conto Corrente	checking	2500.00	4a91294b-8167-4d68-a280-848d5f94bda3
6d48ae43-bf90-4477-ba22-556f943ff2da	Carta di Credito	credit	0.00	4a91294b-8167-4d68-a280-848d5f94bda3
7763325e-ec7f-4367-a540-739875b68650	Carta di Debito	debit	500.00	4a91294b-8167-4d68-a280-848d5f94bda3
b9951153-374f-498f-9d08-e15c4daa3d80	Contanti	cash	150.00	4a91294b-8167-4d68-a280-848d5f94bda3
3d7cc99c-02b2-4bfe-8e09-10e14dafb2a6	Conto Corrente	checking	2500.00	f961b10f-655e-4b63-b645-9e6b8e7774ae
09219adc-940e-44c4-8216-3a661f2d77e9	Carta di Credito	credit	0.00	f961b10f-655e-4b63-b645-9e6b8e7774ae
2360d65e-0bb4-4bfa-96f0-4e7ed9231c5d	Carta di Debito	debit	500.00	f961b10f-655e-4b63-b645-9e6b8e7774ae
19ecb0dc-c90e-486f-87d8-6e34292c61e8	Contanti	cash	150.00	f961b10f-655e-4b63-b645-9e6b8e7774ae
f3b5de60-d689-40a3-a588-d6c22bfc28ab	Conto Corrente	checking	2500.00	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
624d4d3d-fbd7-4cd8-be53-67d16146070d	Carta di Debito	debit	500.00	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
7ed9cc95-b581-4945-ba2c-31c7feeb794f	Contanti	cash	150.00	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
\.


--
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.budgets (id, category_id, amount, period, year, month, user_id) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, color, icon, localized_name, user_id) FROM stdin;
f7c7afca-3b3e-43e6-94ba-a824d25fd5c1	Alimentari	#EF4444	fas fa-shopping-cart	\N	ff1628d1-1c65-47fd-96ab-f6142f60513e
9f574670-9f3f-4e5d-a2dd-b6c79143b8cb	Trasporti	#3B82F6	fas fa-bus	\N	ff1628d1-1c65-47fd-96ab-f6142f60513e
2f55e1bc-395b-469f-811e-56502ce86e24	Shopping	#10B981	fas fa-shopping-bag	\N	ff1628d1-1c65-47fd-96ab-f6142f60513e
8a66a192-e55a-4a9d-9979-25d534efd846	Bollette	#F59E0B	fas fa-bolt	\N	ff1628d1-1c65-47fd-96ab-f6142f60513e
a91e69b1-335f-4839-990d-11e8c18bbd11	Intrattenimento	#8B5CF6	fas fa-film	\N	ff1628d1-1c65-47fd-96ab-f6142f60513e
4765ff4e-e489-490d-b45a-5ba592912cae	Salute	#EC4899	fas fa-heartbeat	\N	ff1628d1-1c65-47fd-96ab-f6142f60513e
e89b31ed-9fb0-4dfe-8b79-6d8fe2eafbec	Altro	#6B7280	fas fa-tag	\N	ff1628d1-1c65-47fd-96ab-f6142f60513e
c5c83de3-3d4a-4909-9cf3-db5e48d838e3	Alimentari	#EF4444	fas fa-shopping-cart	\N	4a91294b-8167-4d68-a280-848d5f94bda3
548502ff-c664-4d59-bcfb-e7eb29de5e38	Trasporti	#3B82F6	fas fa-bus	\N	4a91294b-8167-4d68-a280-848d5f94bda3
e0cc3c5d-4e95-4b0c-904a-8d748cb4f8fd	Shopping	#10B981	fas fa-shopping-bag	\N	4a91294b-8167-4d68-a280-848d5f94bda3
a73ca10f-2c0b-47bb-814a-9627c04f5ff5	Bollette	#F59E0B	fas fa-bolt	\N	4a91294b-8167-4d68-a280-848d5f94bda3
9f3711db-d224-4743-bc94-d97f58020972	Intrattenimento	#8B5CF6	fas fa-film	\N	4a91294b-8167-4d68-a280-848d5f94bda3
c2f45bda-22d0-47d4-915a-89b35b83db27	Salute	#EC4899	fas fa-heartbeat	\N	4a91294b-8167-4d68-a280-848d5f94bda3
a40cfe95-3667-4d9e-a0b8-389f22756bfa	Altro	#6B7280	fas fa-tag	\N	4a91294b-8167-4d68-a280-848d5f94bda3
4810a92b-6b6f-4997-87d6-684af5bae2dd	Alimentari	#EF4444	fas fa-shopping-cart	\N	f961b10f-655e-4b63-b645-9e6b8e7774ae
50580c0c-d461-43f6-a6d3-5991bbf49eda	Trasporti	#3B82F6	fas fa-bus	\N	f961b10f-655e-4b63-b645-9e6b8e7774ae
4e254b79-5830-448e-bccc-9285cc967b23	Shopping	#10B981	fas fa-shopping-bag	\N	f961b10f-655e-4b63-b645-9e6b8e7774ae
3c2e60a1-52b5-4227-977c-0bbc1dfa34af	Bollette	#F59E0B	fas fa-bolt	\N	f961b10f-655e-4b63-b645-9e6b8e7774ae
07a2aa21-8d67-4965-942f-1f9cb5a78e7e	Intrattenimento	#8B5CF6	fas fa-film	\N	f961b10f-655e-4b63-b645-9e6b8e7774ae
b9c60510-6975-4e13-8468-8ab87862f52b	Salute	#EC4899	fas fa-heartbeat	\N	f961b10f-655e-4b63-b645-9e6b8e7774ae
def1aeae-79af-44be-b63d-e39ea719f599	Altro	#6B7280	fas fa-tag	\N	f961b10f-655e-4b63-b645-9e6b8e7774ae
8cf32fbd-449d-4cc6-930d-751586349b4f	Trasporti	#3B82F6	fas fa-bus	\N	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
be0a22ee-79f2-4023-a7a3-42c775f7e423	Bollette	#F59E0B	fas fa-bolt	\N	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
cd926a25-39d1-491b-a7ac-dc0fc2d4122e	Intrattenimento	#8B5CF6	fas fa-film	\N	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
5e3b75ef-d074-49e4-9f30-28e7627dbed4	Salute	#EC4899	fas fa-heartbeat	\N	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
a73fd8a1-eb5c-41ee-a72a-0ee951ef459e	Altro	#6B7280	fas fa-tag	\N	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
b3f25d36-1507-4704-8d9d-5dd00e7fa2c7	Non classificato	#EF4444	fas fa-question-circle	Non classificato	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (id, user_id, token_hash, expires_at, used, request_ip, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
fVOjrt6p2L-GRvAfcPm4qhbzSCXf7RrI	{"cookie": {"path": "/", "secure": false, "expires": "2025-09-28T17:27:02.575Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "7f651933-2374-412c-ab25-520e50b2c732", "exp": 1758479222, "iat": 1758475622, "iss": "https://replit.com/oidc", "sub": "46535171", "email": "matteobritta@icloud.com", "at_hash": "EIc8bocIj1nlNaXXAYa3BQ", "username": "matteobritta1", "auth_time": 1758475621, "last_name": "Britta", "first_name": "Matteo"}, "expires_at": 1758479222, "access_token": "UdZ9eKm0Z3n_y8x-c4taW9RQM7dCABYpCxpxSMyZvHh", "refresh_token": "C_RKtnm6WgJrp08DDEcZ7meO1Le4etSsKEs--zS2iYV"}}}	2025-09-28 17:27:10
iAG9nrUoq_rWNcI-QRpHQHImY5DEnf_m	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-01T15:42:05.976Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"sub": "ff1628d1-1c65-47fd-96ab-f6142f60513e", "email": "user1@example.com", "last_name": "Uno", "first_name": "User", "profile_image_url": null}, "expires_at": 1790264525}}}	2025-10-01 15:42:34
PufAnR8XIoVdd3Pie2CT34tpcx1Yy7W5	{"cookie": {"path": "/", "secure": true, "expires": "2025-09-28T17:14:35.994Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-09-28 17:14:36
7_IJCiQSjAclr8t-yvcePv8fWDJL40uU	{"cookie": {"path": "/", "secure": false, "expires": "2025-09-30T20:58:37.694Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-09-30 20:58:38
luDgZxUm46sW9izckfj62T1GH9DojXTy	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-01T15:45:27.364Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"sub": "4a91294b-8167-4d68-a280-848d5f94bda3", "email": "testuser1@example.com", "last_name": "User1", "first_name": "Test", "profile_image_url": null}, "expires_at": 1790264726}}}	2025-10-01 15:46:53
JamYidvAKkxtVsXkBiXPXMrjeceomuxN	{"cookie": {"path": "/", "secure": false, "expires": "2025-09-28T17:19:10.045Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"sub": "0e473685-b57c-4d5c-9b8c-3a8bf27f2446", "email": "test-WqCBeC0R@example.com", "last_name": "Test", "first_name": "Mario", "profile_image_url": null}, "expires_at": 1790011149}}}	2025-09-28 17:19:18
c5HV_bLZQUkFGTfnSY5uxgSMbBXtOX3V	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-04T15:50:55.604Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"sub": "17f3fa71-c98e-4eec-ada3-d898d1bf18bc", "email": "matteobritta@gmail.com", "last_name": "Ghezzi", "first_name": "Matteo", "profile_image_url": null}, "expires_at": 1790524255}}}	2025-10-04 15:58:49
s2t_VgKa6Jlf5PRDEDg37Alw8ddiUQvm	{"cookie": {"path": "/", "secure": true, "expires": "2025-09-28T13:52:38.811Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "7f651933-2374-412c-ab25-520e50b2c732", "exp": 1758466358, "iat": 1758462758, "iss": "https://test-mock-oidc.replit.app/", "jti": "8a2ecd54a972804270c9b148d79c5879", "sub": "GEQNFO", "email": "GEQNFO@example.com", "auth_time": 1758462758, "last_name": "Doe", "first_name": "John"}, "expires_at": 1758466358, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzU4NDYyNzU4LCJleHAiOjE3NTg0NjYzNTgsInN1YiI6IkdFUU5GTyIsImVtYWlsIjoiR0VRTkZPQGV4YW1wbGUuY29tIiwiZmlyc3RfbmFtZSI6IkpvaG4iLCJsYXN0X25hbWUiOiJEb2UifQ.Mad-u9oGM2OSaDCOEEhneXK25LSYB5Xc5y1qPs7KgvbthfRMFu-YTEpuyM1od_v5FQd8NM4A3RuwFmPMFs_5YPBOaWhuHUdFp3LUOXf8x-iEA9cbK_FQsG1wLB7c8a48SZBKbjnkqqUqnVMGRsFDgaglxkV-h65lIh3eA-8NHxkHUVgRFkXRIpdAZGme3zFLJ1OkoIbqX4rNLUEEZVjpQ33DjOEnWa5lz5BfW8N9K5HAcoLUzic4r6lOvuu53Tz637F2nHz-v6uw0pBwEVFFd35kxLMe_RUYi8nLPnEowZqfyQo38o0Y1KI7YILaY2SOBcupfOfjo9ofWNeYx1o75g", "refresh_token": "eyJzdWIiOiJHRVFORk8iLCJlbWFpbCI6IkdFUU5GT0BleGFtcGxlLmNvbSIsImZpcnN0X25hbWUiOiJKb2huIiwibGFzdF9uYW1lIjoiRG9lIn0"}}}	2025-09-28 13:53:22
UJLdaW5NwQFtXnR1FlRu2uUqp6ajTK-x	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-01T15:45:54.626Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"sub": "f961b10f-655e-4b63-b645-9e6b8e7774ae", "email": "testuser2@example.com", "last_name": "User2", "first_name": "Test", "profile_image_url": null}, "expires_at": 1790264754}}}	2025-10-01 15:46:53
_xihTIDF9KA3GjCgjLv9eaQtUp06BbOm	{"cookie": {"path": "/", "secure": false, "expires": "2025-10-04T16:03:57.405Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"sub": "17f3fa71-c98e-4eec-ada3-d898d1bf18bc", "email": "matteobritta@gmail.com", "last_name": "Ghezzi", "first_name": "Matteo", "profile_image_url": null}, "expires_at": 1790525037}}}	2025-10-04 17:04:50
dCrE_XIyow56oDFMc2oE4BNXZMDahGNt	{"cookie": {"path": "/", "secure": true, "expires": "2025-09-28T13:56:04.502Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "7f651933-2374-412c-ab25-520e50b2c732", "exp": 1758466564, "iat": 1758462964, "iss": "https://test-mock-oidc.replit.app/", "jti": "28c0e27985376178ed95331ce7a9a552", "sub": "A7gvGs", "email": "A7gvGs@example.com", "auth_time": 1758462963, "last_name": "Doe", "first_name": "John"}, "expires_at": 1758466564, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzU4NDYyOTY0LCJleHAiOjE3NTg0NjY1NjQsInN1YiI6IkE3Z3ZHcyIsImVtYWlsIjoiQTdndkdzQGV4YW1wbGUuY29tIiwiZmlyc3RfbmFtZSI6IkpvaG4iLCJsYXN0X25hbWUiOiJEb2UifQ.U8MOnWFjVtXGNIQvyicUQmgsDabIImfOb3lYog0Mqfri7xh4JX9_qQ9hmULlNzU3mdKkKm4tFLxct_NIGwMwpmI_-01cyuSFP03ctLVgQFI8o1bvIcZICT8DMqHO21oe_WZxeVnqqTUWaHmQnTpEdtYUtlzqQlGEqEXlc6pZfw1G22Ncz1K9N5lv1bJSMg51F6zwn6ev4Az5ah-FD6PqLuKtG-MebE32TLgFIMemEPUZLbniYijLQiy2qmLKZ-PRITL8tizz5qrbTfk9GO7G8QkVQ0a2AGolseqoVXBVR6M-sdO5RYktH1_VuFYteLI5oXW_UHn-H0E1xdWqVoN6Tw", "refresh_token": "eyJzdWIiOiJBN2d2R3MiLCJlbWFpbCI6IkE3Z3ZHc0BleGFtcGxlLmNvbSIsImZpcnN0X25hbWUiOiJKb2huIiwibGFzdF9uYW1lIjoiRG9lIn0"}}}	2025-09-28 13:58:42
aNUlay2LWw033jG86J1xdWtprw2Z4uyx	{"cookie": {"path": "/", "secure": true, "expires": "2025-09-28T13:47:07.119Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "7f651933-2374-412c-ab25-520e50b2c732", "exp": 1758466026, "iat": 1758462426, "iss": "https://test-mock-oidc.replit.app/", "jti": "c0c606ba12db65e827cdc6c9cdaebd16", "sub": "oo73Gm", "email": "oo73Gm@example.com", "auth_time": 1758462426, "last_name": "Doe", "first_name": "John"}, "expires_at": 1758466026, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzU4NDYyNDI2LCJleHAiOjE3NTg0NjYwMjYsInN1YiI6Im9vNzNHbSIsImVtYWlsIjoib283M0dtQGV4YW1wbGUuY29tIiwiZmlyc3RfbmFtZSI6IkpvaG4iLCJsYXN0X25hbWUiOiJEb2UifQ.n8xpX4RfUx6yGXknZyDRgyoPZiYoeF0kgjiJTEMRYFDQJ3PcuYEM6_jJgXcHmpWgTPIuKWG_MMTq5x0tZpV_zEd4I03xKg6u4R3yGYFvsKRYfQwEckxF59D9xhHbrNYUnplY0fdGIHFiK49VPw4YXA62msgjnL8sS8tL2bhlRnqUiTYtGwtMteKKn13uYNwJy7Vcb6T7krXu0IIiTnHrX8n34ieK-q1_KyGwYKPXSsuh3A2LqzhwsV9kT_neyTe_qkgARO8GAxXGVBafinzt96soaof9jiOgFMTV48tMMao2KApsDqSMMQOdPl3yo_wgIf_fa3YkBqMl0TV4_Q1DSg", "refresh_token": "eyJzdWIiOiJvbzczR20iLCJlbWFpbCI6Im9vNzNHbUBleGFtcGxlLmNvbSIsImZpcnN0X25hbWUiOiJKb2huIiwibGFzdF9uYW1lIjoiRG9lIn0"}}}	2025-09-28 13:49:57
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, amount, description, date, category_id, account_id, created_at, imported_category_raw, confirmed, user_id) FROM stdin;
7647fc13-fea2-4744-bcb5-6a95284f1685	-50.00	Spesa User1	2025-01-18 00:00:00	c5c83de3-3d4a-4909-9cf3-db5e48d838e3	7c992701-7014-4192-9ddd-d23c26391599	2025-09-24 15:46:25.278011	\N	f	4a91294b-8167-4d68-a280-848d5f94bda3
ccabc781-e7ee-43dc-9bb0-bac34782b26e	-30.00	Benzina User2	2025-01-18 00:00:00	50580c0c-d461-43f6-a6d3-5991bbf49eda	3d7cc99c-02b2-4bfe-8e09-10e14dafb2a6	2025-09-24 15:46:27.158881	\N	f	f961b10f-655e-4b63-b645-9e6b8e7774ae
4f6b9560-5906-4c39-8b3d-757e2687fa99	-0.42	Global Hands	2025-09-01 02:16:56	b3f25d36-1507-4704-8d9d-5dd00e7fa2c7	624d4d3d-fbd7-4cd8-be53-67d16146070d	2025-09-27 16:32:18.933172	Acquisti	f	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
40d86e26-c770-49d8-8011-01468017c158	-4.53	SPAR	2025-08-31 08:51:34	8cf32fbd-449d-4cc6-930d-751586349b4f	624d4d3d-fbd7-4cd8-be53-67d16146070d	2025-09-27 16:32:18.950544	trasporti	f	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
b825627e-1762-4354-bbe8-24de2559f135	-1.27	Ceylon Handicraft Collect	2025-08-29 14:42:07	b3f25d36-1507-4704-8d9d-5dd00e7fa2c7	624d4d3d-fbd7-4cd8-be53-67d16146070d	2025-09-27 16:32:18.954008	Acquisti	f	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
1469f9e8-b73e-4150-8745-340e8042eea0	-28.58	One Ceylon Hospitality	2025-08-29 13:11:58	b3f25d36-1507-4704-8d9d-5dd00e7fa2c7	624d4d3d-fbd7-4cd8-be53-67d16146070d	2025-09-27 16:32:19.340885	Mangiare fuori	f	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
51d97371-f015-4e50-9d9e-47b47f06f414	-41.10	Plan B Cafe Pvt Ltd	2025-08-29 14:33:20	b3f25d36-1507-4704-8d9d-5dd00e7fa2c7	624d4d3d-fbd7-4cd8-be53-67d16146070d	2025-09-27 16:32:19.34183	Mangiare fuori	f	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
36d15472-8f03-4049-910f-a40b0e27df1f	-18.47	Arugam Bay Wine Store	2025-08-27 15:14:11	b3f25d36-1507-4704-8d9d-5dd00e7fa2c7	624d4d3d-fbd7-4cd8-be53-67d16146070d	2025-09-27 16:32:19.681875	Acquisti	f	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
4274bc2d-0b8f-44fd-a359-82167e289c44	-160.00	Matteo Britta	2025-08-26 07:44:48	b3f25d36-1507-4704-8d9d-5dd00e7fa2c7	624d4d3d-fbd7-4cd8-be53-67d16146070d	2025-09-27 16:32:19.697201	Denaro aggiunto	f	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
66997c6e-3f27-43f8-b36d-5c9f95dcc572	-4.11	Softlogic Restaurants	2025-08-31 06:50:17	b3f25d36-1507-4704-8d9d-5dd00e7fa2c7	624d4d3d-fbd7-4cd8-be53-67d16146070d	2025-09-27 16:32:20.72118	Mangiare fuori	f	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
badad37b-9065-4853-bc18-062ecb9feac5	-0.85	SPAR	2025-08-31 09:12:58	b3f25d36-1507-4704-8d9d-5dd00e7fa2c7	624d4d3d-fbd7-4cd8-be53-67d16146070d	2025-09-27 16:32:20.949892	Alimentari/spesa	f	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
e1cd687f-73be-4ccd-88e5-cb8720e2f6ad	-40.00	gregorio lanfranchi	2025-09-19 13:16:54	b3f25d36-1507-4704-8d9d-5dd00e7fa2c7	624d4d3d-fbd7-4cd8-be53-67d16146070d	2025-09-27 16:32:20.952711	Generale	f	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
e4051434-76d4-4853-9291-13244aad6e2e	-21.38	MAMA'S Restaurant	2025-08-27 18:07:38	5e3b75ef-d074-49e4-9f30-28e7627dbed4	624d4d3d-fbd7-4cd8-be53-67d16146070d	2025-09-27 16:32:19.35901	Salute	t	17f3fa71-c98e-4eec-ada3-d898d1bf18bc
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, first_name, last_name, profile_image_url, created_at, updated_at, password_hash, email_verified, token_version, last_login) FROM stdin;
oo73Gm	oo73Gm@example.com	John	Doe	\N	2025-09-21 13:47:06.9088	2025-09-21 13:47:06.9088	\N	f	0	\N
GEQNFO	GEQNFO@example.com	John	Doe	\N	2025-09-21 13:52:38.60988	2025-09-21 13:52:38.60988	\N	f	0	\N
A7gvGs	A7gvGs@example.com	John	Doe	\N	2025-09-21 13:56:04.301094	2025-09-21 13:56:04.301094	\N	f	0	\N
895a64f2-1a08-4537-9779-4dcf09888e4c	test-P977MNWn@example.com	Mario	Test	\N	2025-09-21 17:14:05.20788	2025-09-21 17:14:05.20788	$2b$12$yCbcdLBhCTvWhiyB9QDM5ObFAv3TUrOYpc/IDZKR7dA2jGozNz1Xe	f	0	\N
0e473685-b57c-4d5c-9b8c-3a8bf27f2446	test-WqCBeC0R@example.com	Mario	Test	\N	2025-09-21 17:18:39.998344	2025-09-21 17:18:39.998344	$2b$12$wFMx/sG86TC1.qtYGRJtGuCqvqXhazKYhLdkKwbGbkAljz1kx9Ky6	f	0	\N
dev-user-123	developer@test.com	Dev	User	https://via.placeholder.com/150	2025-09-21 17:56:25.839597	2025-09-21 18:01:52.055	\N	f	0	\N
46535171	matteobritta@icloud.com	Matteo	Britta	\N	2025-08-18 06:03:44.183888	2025-09-23 19:47:20.995	\N	f	0	\N
ff1628d1-1c65-47fd-96ab-f6142f60513e	user1@example.com	User	Uno	\N	2025-09-24 15:41:37.325387	2025-09-24 15:41:37.325387	$2b$12$NjSyt3tcyZ/VZYy3xVxCT.Xh7LTQZm10MdleH/4gnwBtoh1nqTqvK	f	0	\N
4a91294b-8167-4d68-a280-848d5f94bda3	testuser1@example.com	Test	User1	\N	2025-09-24 15:45:03.145343	2025-09-24 15:45:03.145343	$2b$12$0yYDSJpakyowsodLz00ZPuXuDytluGRgQCD8FM5d5YjQml7dVOkaO	f	0	\N
f961b10f-655e-4b63-b645-9e6b8e7774ae	testuser2@example.com	Test	User2	\N	2025-09-24 15:45:53.269777	2025-09-24 15:45:53.269777	$2b$12$uAMBu.GT7CxFWJhEhhUIWOLu2dFMxnVfOimmfdrpz0.v2eogHNnZi	f	0	\N
17f3fa71-c98e-4eec-ada3-d898d1bf18bc	matteobritta@gmail.com	Matteo	Ghezzi	\N	2025-09-24 17:41:40.961179	2025-09-24 17:41:40.961179	$2b$12$TAPjZoJNIbUpZFDrz1fo2uEbldyyD5gJx4R22pTI48GZuTNtL45G.	f	0	\N
\.


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_accounts_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_accounts_user" ON public.accounts USING btree (user_id);


--
-- Name: IDX_accounts_user_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_accounts_user_name" ON public.accounts USING btree (user_id, name);


--
-- Name: IDX_budgets_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_budgets_user" ON public.budgets USING btree (user_id);


--
-- Name: IDX_budgets_user_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_budgets_user_period" ON public.budgets USING btree (user_id, period, year, month);


--
-- Name: IDX_categories_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_categories_user" ON public.categories USING btree (user_id);


--
-- Name: IDX_categories_user_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_categories_user_name" ON public.categories USING btree (user_id, name);


--
-- Name: IDX_password_reset_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_password_reset_expires" ON public.password_reset_tokens USING btree (expires_at);


--
-- Name: IDX_password_reset_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_password_reset_user" ON public.password_reset_tokens USING btree (user_id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: IDX_transactions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_transactions_user" ON public.transactions USING btree (user_id);


--
-- Name: IDX_transactions_user_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_transactions_user_category" ON public.transactions USING btree (user_id, category_id);


--
-- Name: IDX_transactions_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_transactions_user_date" ON public.transactions USING btree (user_id, date);


--
-- Name: accounts accounts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: budgets budgets_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: budgets budgets_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: categories categories_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_account_id_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_account_id_accounts_id_fk FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: transactions transactions_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: transactions transactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

