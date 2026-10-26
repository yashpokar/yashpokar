---
title: The favour that became a revenue line
summary: A colleague asked me to automate downloading a few hundred invoices. It turned into a GST reconciliation system that makes money while nobody watches. Notes on side quests, scope, and knowing when to say yes.
date: 2026-07-27
tags: [Automation, Python, Career, Product]
---

One of the most valuable things I have built started as a favour I nearly said no to.

I was at Itilite, a corporate travel company, working on hotel booking integrations. A colleague in finance mentioned, almost in passing, that they spent the last week of every month downloading invoices from airline and hotel portals by hand so that GST input credits could be claimed. Hundreds of invoices. Dozens of portals. Every month.

"Could you maybe automate some of that?"

## Why I almost said no

It was not my team. It was not on any roadmap. It involved logging into supplier portals that were never designed to be logged into by a script. And finance automation is the kind of thing where a bug means real money claimed wrongly, which is a very bad kind of bug.

What tipped it was arithmetic. One person, one week a month, forever. If a script could do even half of it reliably, the return on a few evenings of work was absurd.

## Version one: just the downloads

I scoped the first version ruthlessly. No reconciliation. No matching. Just: given a list of booking references, go to the right portal, fetch the invoice PDF, and drop it in a folder named by month. The human still did everything else.

```python
@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=30))
def fetch_invoice(session: PortalSession, booking_ref: str) -> Path:
    page = session.get(f"/invoices/search?ref={booking_ref}")
    link = extract_pdf_link(page)        # each portal gets its own adapter
    pdf  = session.get(link, stream=True)
    out  = INVOICE_DIR / f"{booking_ref}.pdf"
    out.write_bytes(pdf.content)
    return out
```

Each supplier portal got a small adapter class. Some were a clean form POST. Some needed a session cookie that expired every twenty minutes. One required pretending to be a specific version of Internet Explorer. The adapter pattern meant each one was a contained piece of ugliness that did not leak into the rest of the code.

Version one saved about three days a month. Finance was delighted. I thought I was done.

## Version two: the part that actually mattered

Then the same colleague showed me what happened after the downloads. Each invoice had to be opened, its GST number and tax amounts read off, and matched against the government's GST portal data to confirm the supplier had actually filed. Invoices that did not match could not be claimed. Invoices that nobody checked were simply lost credit.

That was the real problem. The downloads were the visible part.

So version two parsed the PDFs, extracted the GSTIN, invoice number, taxable value and tax amounts, pulled the corresponding records from the GST filings, and produced a reconciliation: matched, mismatched with a reason, or missing. Humans only looked at the exceptions.

A few things I got right here that I would do again:

- **Every extraction kept its evidence.** The parsed amount was stored next to the text region it came from, so a mismatch could be checked in seconds rather than by re-opening the PDF.
- **Nothing was auto-claimed.** The system produced a reconciled list; a person approved it. For money, a human in the loop is not a weakness.
- **Confidence was a field, not a feeling.** Extractions that the parser was unsure about were flagged rather than guessed.

## What "generates revenue" actually means here

Input tax credit that is not claimed is money the company has already spent and does not get back. Before the system, a meaningful share went unclaimed because nobody had time to chase it. After, the exception list was short enough to work through in an afternoon, and the claim rate went up accordingly.

Years later I was told it was still running, still reconciling, still recovering credit every month without anyone touching the code. I did not add a feature to the travel product. I added a line to the finance statement.

## What I took from it

**Follow the request to the real problem.** The ask was "download invoices". The problem was "we lose money because reconciliation is manual". The first version was useful. The second was valuable.

**Scope the first version so small it is embarrassing.** It built trust, it exposed the real workflow, and it meant the second version was built on something that already worked.

**Favours are a sampling method.** People ask engineers for help with the things that hurt them most. That is a signal most roadmaps never capture. Say yes more often than feels efficient, and pay attention to what you learn.

**Build it to be forgotten.** The highest compliment a piece of internal software can receive is that nobody remembers who wrote it, because it never needed anyone to.
