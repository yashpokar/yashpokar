import React from 'react'
import faq from '../../data/faq'

/** Native <details>: crawlers and answer engines read every answer, people can scan the questions. */
export default function Faq() {
    return (
        <div className="faq">
            {faq.map((f, i) => (
                <details key={f.q} className="faq__item" open={i === 0}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                </details>
            ))}
        </div>
    )
}
