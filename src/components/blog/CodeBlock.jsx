import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'

/** Wraps rendered <pre> blocks with a language label and a copy button. */
export default function CodeBlock({ children, ...rest }) {
    const ref = useRef(null)
    const [copied, setCopied] = useState(false)

    const child = React.Children.toArray(children)[0]
    const lang  = (child?.props?.className || '')
        .split(' ')
        .find(c => c.startsWith('language-'))
        ?.replace('language-', '')

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(ref.current?.innerText ?? '')
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
        } catch { /* clipboard blocked */ }
    }

    return (
        <div className="code-block">
            <div className="code-block__bar">
                <span className="code-block__lang">{lang || 'code'}</span>
                <button type="button" className="code-block__copy" onClick={copy}>
                    {copied ? 'Copied ✓' : 'Copy'}
                </button>
            </div>
            <pre ref={ref} {...rest}>{children}</pre>
        </div>
    )
}

CodeBlock.propTypes = { children: PropTypes.node }
