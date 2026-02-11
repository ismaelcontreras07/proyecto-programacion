import React from "react";
import "./footer.css";

interface FooterProps {
    logo: React.ReactNode
    socialLinks: Array<{
        icon: React.ReactNode
        href: string
        label: string
    }>
    mainLinks: Array<{
        href: string
        label: string
    }>
    legalLinks: Array<{
        href: string
        label: string
    }>
    copyright: {
        text: string
        license?: string
    }
}

export function Footer({
    logo,
    socialLinks,
    mainLinks,
    legalLinks,
    copyright,
}: FooterProps) {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-top">
                    <a
                        href="/"
                        className="footer-brand"
                        aria-label="Universidad UNIMEX"
                    >
                        {logo}
                    </a>
                    <ul className="footer-social-list">
                        {socialLinks.map((link, i) => (
                            <li key={i}>
                                <a
                                    href={link.href}
                                    target="_blank"
                                    aria-label={link.label}
                                    className="social-btn"
                                >
                                    {link.icon}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="footer-grid">
                    <nav className="footer-nav">
                        <ul className="footer-links-list">
                            {mainLinks.map((link, i) => (
                                <li key={i} className="footer-link-item">
                                    <a
                                        href={link.href}
                                        className="footer-link"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="footer-nav"> {/* Reusing for legal links layout */}
                        <ul className="footer-links-list">
                            {legalLinks.map((link, i) => (
                                <li key={i} className="footer-link-item">
                                    <a
                                        href={link.href}
                                        className="footer-link"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="copyright">
                        <div>{copyright.text}</div>
                        {copyright.license && <div>{copyright.license}</div>}
                    </div>
                </div>
            </div>
        </footer>
    )
}
