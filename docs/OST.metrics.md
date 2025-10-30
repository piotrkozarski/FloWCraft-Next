# FlowCraft — OST: cele, metryki, eksperymenty

## 🎯 North Star Goal (policzalny)

Zwiększyć odsetek ukończonych zadań w aktywnych sprintach do **≥ 80%** w ciągu **2 tygodni** od startu sprintu.

**Wzór:** Done% = (liczba zadań w statusie Done / liczba wszystkich zadań w sprincie) * 100  
**Target:** 80%  
**Źródło danych:** store → issues.sprintId + status

---

## 🧩 Opportunity 1 — Porządek w sprintach

**Metryki:**

- Współczynnik zadań bez statusu (Todo/…): **< 5%**

- Liczba ręcznych zmian statusu / tydz.: **-30%** po DnD

**Powiązane Solutions & eksperymenty:**

- **Kanban + Drag&Drop**

  - H1: DnD obniży ręczne zmiany statusu o 30%.

  - Mierzymy: liczbę zmian statusu wykonanych z poziomu modala vs DnD.

  - Kryterium sukcesu: ≥30% przesunięć wykonanych DnD po 7 dniach.

---

## 🧩 Opportunity 2 — Widoczność odpowiedzialnych

**Metryki:**

- Odsetek zadań bez assignee: **< 10%**

- Średnia liczba zadań / assignee w sprincie: **≤ 7**

**Solutions & eksperymenty:**

- **My Issues + User Activity Report**

  - H1: My Issues skróci czas znalezienia zadań do 1 kliknięcia.

  - Mierzymy: liczba wejść na /my-issues i czas do edycji (eventy UI).

---

## 🧩 Opportunity 3 — Planowanie sprintów

**Metryki:**

- % sprintów z ustawionym zakresem dat: **100%**

- % sprintów ukończonych w terminie: **≥ 70%**

**Solutions & eksperymenty:**

- **Sprint Performance Report + alerty opóźnień**

  - H1: Prezentacja KPI zwiększa % sprintów na czas o 15 p.p.

  - Mierzymy: Completed w terminie / wszystkie sprinty.

---

## 🧩 Opportunity 4 — Centralny przegląd postępu

**Metryki:**

- 1 ekran z KPI: CTR do szczegółów sprintu/raportów: **≥ 35%**

- Liczba otwartych alertów krytycznych: trend ↓

**Solutions & eksperymenty:**

- **Dashboard (KPI + alerty + szybkie skróty)**

  - H1: Dashboard poprawi czas dotarcia do problemów o 25%.

  - Mierzymy: czas od wejścia do rozwiązania 1 alertu.

---
