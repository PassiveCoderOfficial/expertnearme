--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4 (Debian 15.4-1.pgdg110+1)
-- Dumped by pg_dump version 15.4 (Debian 15.4-1.pgdg110+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "parentId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "showOnHomepage" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Category_id_seq" OWNER TO postgres;

--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: Provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Provider" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isBusiness" boolean DEFAULT false NOT NULL,
    featured boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Provider" OWNER TO postgres;

--
-- Name: ProviderCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProviderCategory" (
    "providerId" integer NOT NULL,
    "categoryId" integer NOT NULL
);


ALTER TABLE public."ProviderCategory" OWNER TO postgres;

--
-- Name: Provider_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Provider_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Provider_id_seq" OWNER TO postgres;

--
-- Name: Provider_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Provider_id_seq" OWNED BY public."Provider".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Name: Provider id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Provider" ALTER COLUMN id SET DEFAULT nextval('public."Provider_id_seq"'::regclass);


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, slug, "updatedAt", "parentId", "createdAt", "showOnHomepage") FROM stdin;
4	MEP	mep	2026-01-12 07:46:26.566	\N	2026-01-12 07:45:57.326	f
7	IT	it	2026-01-12 07:57:29.655	\N	2026-01-12 07:57:29.655	f
10	Cleaning	cleaning	2026-01-13 06:37:54.197	4	2026-01-12 13:17:55.628	t
11	Electrical	electrical	2026-01-13 06:37:54.941	4	2026-01-12 13:18:11.973	t
5	Plumber	plumber	2026-01-13 06:37:55.969	4	2026-01-12 07:46:12.103	t
3	Web Developer	web-developer	2026-01-13 06:37:57.778	7	2026-01-12 04:05:39.158	t
8	Construction	construction	2026-01-13 06:38:15.018	\N	2026-01-12 13:17:29.05	f
9	Contractor	contractor	2026-01-13 06:38:16.53	8	2026-01-12 13:17:41.007	f
12	Video Editor	video-editor	2026-01-13 06:38:20.552	7	2026-01-12 13:26:18.082	t
13	Renovation	renovation	2026-01-13 12:58:54.543	4	2026-01-13 12:58:54.543	f
14	HVAC	hvac	2026-01-13 13:07:21.826	4	2026-01-13 13:07:21.826	f
\.


--
-- Data for Name: Provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Provider" (id, name, email, phone, "createdAt", "updatedAt", "isBusiness", featured) FROM stdin;
1	Dr. Ayesha Rahman	ayesha@example.com	+8801712345678	2026-01-11 11:16:46.254	2026-01-11 11:16:46.254	f	f
2	Barrister Kamal Hossain	kamal@example.com	+8801912345678	2026-01-11 11:16:46.272	2026-01-11 11:16:46.272	f	f
3	Muhammad Waliur Rahman	passivecoder.com@gmail.com	01678669699	2026-01-12 03:36:06.9	2026-01-12 03:36:06.9	f	f
6	Muhammad Waliur Rahman	walibdpro@gmail.com	01678669699	2026-01-12 08:23:13.101	2026-01-12 08:23:13.101	f	f
39	Md Kawsar Munna	mkawsarmunna@gamil.com	+880167412015	2026-01-12 12:44:15.347	2026-01-12 12:44:15.347	f	f
40	Tarikul Islam	mtarikulshikdar@gmail.com	+8801814006710	2026-01-12 13:16:48.413	2026-01-12 13:16:48.413	f	f
41	Mushfiqur Rahman Taj	tajm02273@gmail.com	+8801828802846	2026-01-12 13:27:17.27	2026-01-12 13:27:17.27	f	f
42	Passive Coder	info@passivecoder.com	01678669699	2026-01-13 08:18:16.101	2026-01-13 08:18:16.101	f	f
43	Everyday Renovation & Waterproofing	everydayrenovationssg@gmail.com	01234567890	2026-01-13 13:00:21.409	2026-01-13 13:00:21.409	f	f
44	HVAC	rendo@rendom.com	01234567890	2026-01-13 13:07:38.132	2026-01-13 13:07:38.132	f	f
\.


--
-- Data for Name: ProviderCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProviderCategory" ("providerId", "categoryId") FROM stdin;
3	3
6	3
39	3
40	3
41	12
42	3
43	13
44	14
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
bd16fd90-526c-4ba3-87ae-62e79ec2cdd9	ddfcbbff22f394319af938d9c9ac5695815368f9b5c1bccfcdc5790bdbd2ec5b	2026-01-11 11:04:26.3505+00	20260111110426_init	\N	\N	2026-01-11 11:04:26.295207+00	1
6c978ac0-df2d-4694-aed8-b7fdaa15594a	41013aa6a9669d27216be18f82f3e62193eb94d9e4bbc3dbd55ed750d0e878d9	2026-01-12 02:57:04.83808+00	20260112025704_enable_multicategory	\N	\N	2026-01-12 02:57:04.788237+00	1
d58eb305-4d5c-4769-a7d6-4fc8c1a643d5	f05be3a0ab788f49a03fba37dc39d840afac968b3907918ce9b420362767e1fc	2026-01-12 04:05:22.039227+00	20260112035907_add_updatedat	\N	\N	2026-01-12 04:05:21.995419+00	1
a7d37dfa-d869-4ef4-be82-7fd1ec3db0a9	0acda5c57f46040bd6fce9323d3d921af017b404c5fbf2b3df6b4e9bee9a760b	2026-01-12 04:05:39.165611+00	20260112040539	\N	\N	2026-01-12 04:05:39.149248+00	1
94e82b89-4a80-4853-8f7f-e351cb13dd7c	3ed7d74923325e2ff1a4fd23d305603f1f91f4d344d0580a7590b8cc31adb25f	2026-01-12 16:11:18.677624+00	20260112161118_add_is_business	\N	\N	2026-01-12 16:11:18.656014+00	1
0677bc76-4846-4cfa-a7c8-e4b09a94b68d	b33bfd12af1c018ebf15016cd9395285403cba68dac6f90943f7bf547d8040aa	2026-01-13 06:21:33.063226+00	20260113062133_add_show_on_homepage	\N	\N	2026-01-13 06:21:33.045803+00	1
af2b5789-26a2-4ce2-9d0e-7765c0a86f9c	b381b704a20832f674fb06551a714e327b25b0885e069827a8206629b37ff439	2026-01-13 07:19:55.038022+00	20260113071954_add_provider_flags	\N	\N	2026-01-13 07:19:55.02298+00	1
\.


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Category_id_seq"', 14, true);


--
-- Name: Provider_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Provider_id_seq"', 44, true);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: ProviderCategory ProviderCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProviderCategory"
    ADD CONSTRAINT "ProviderCategory_pkey" PRIMARY KEY ("providerId", "categoryId");


--
-- Name: Provider Provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Provider"
    ADD CONSTRAINT "Provider_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Category_parentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Category_parentId_idx" ON public."Category" USING btree ("parentId");


--
-- Name: Category_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Category_slug_idx" ON public."Category" USING btree (slug);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Provider_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Provider_email_key" ON public."Provider" USING btree (email);


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProviderCategory ProviderCategory_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProviderCategory"
    ADD CONSTRAINT "ProviderCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProviderCategory ProviderCategory_providerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProviderCategory"
    ADD CONSTRAINT "ProviderCategory_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES public."Provider"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

