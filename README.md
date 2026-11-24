# 🧪 LabBuddy

**Pre-labs, partner tasks, and deadlines, all in one place.**

🔗 **Live demo:** https://project-sprint-lab-report-buddy-raj.vercel.app/



## Why we built this

Anyone who's done an engineering lab knows the chaos: the pre-lab is in one tab, your partner's half of the report is in a group chat, and the due date is somewhere in an email from three weeks ago. We kept losing track of who was doing what, so we built the tool we wished we had.

LabBuddy gives you and your lab partner one shared space. Create a lab, send your partner a short code, and you're both looking at the same checklist, the same split of work, and the same deadlines.

## What it does

- **Checklist:** break a lab into pre-lab and post-lab tasks and watch the progress bar fill up as you tick them off.
- **Partners:** see how much each person has finished, assign tasks, or hit *Auto-split* to divide the unassigned ones fairly.
- **Deadlines:** add pre-lab and report due dates so nothing sneaks up on you.
- **Join with a code:** no accounts to set up. Share a code and your partner is in.


## Built with

- [Next.js](https://nextjs.org/) 16 (App Router) and React 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Supabase](https://supabase.com/) for shared data between partners
- Deployed on [Vercel](https://vercel.com/)

## Run it locally

You'll need [Node.js](https://nodejs.org/) 20 or newer.

```bash
git clone https://github.com/yumnasiddqui/Project-Sprint-Lab-Report-Buddy.git
cd Project-Sprint-Lab-Report-Buddy/labbuddy
npm install
```

Create a file called `.env.local` inside the `labbuddy` folder with your Supabase project details:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Then start it up:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're good to go.

## The team: Clueless Commit

We're students at Ontario Tech University, and this was our GDG x CS Project Sprint project.

| Name |         | What they worked on |

| Yumna Siddiqui | Repository owner, Vercel deployment,
                  Checklist tab , %Error Tab + Last minute design modifications |
| Jubaida Khatun | Partners tab and the auto-split algorithm |
| Farzeen Farooq | Project setup, database, home page and
                  dashboard, Deadlines tab + Last minute changes |

## What we learned

LabBuddy was our first real project. None of us had built a full web app before, so a lot of this sprint was figuring things out as we went: setting up Next.js, connecting a database, working in separate branches, and merging pull requests without breaking each other's code.

We had big plans, including graphs for lab data and reminder notifications when a deadline is close. Then midterms hit and our schedules got brutal, so we focused on what makes the biggest difference day to day: a shared checklist, a fair split of work between partners, and deadlines in one place.

If we did it again, we'd plan a smaller first version earlier and agree on roles from day one. The biggest thing we learned is that a small app that works beats a big idea that doesn't, and that building together teaches you more than building alone.

## What's next

The features we didn't get to are the ones we're most excited about:

- Graphs for lab data
- Reminders when a deadline is approaching
- Sharing course resources (manuals, code, CAD files) inside each lab
- Accounts so your labs follow you across devices
