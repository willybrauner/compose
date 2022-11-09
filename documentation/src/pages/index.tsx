import React from "react"
import clsx from "clsx"
import Link from "@docusaurus/Link"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
import HomepageFeatures from "@site/src/components/HomepageFeatures"

import styles from "./index.module.css"

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  console.log("siteConfig", siteConfig)
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <header className={clsx("hero hero--primary", styles.heroBanner)}>
        <div>@wbe/compose</div>
        <h1>Compose is a tiny library who links your javascript to your DOM.</h1>
        <em>
          ⚠️ This library is work in progress, the API is subject to change until the v1.0
          release.
        </em>
        <br />
        <br />
        <div>
          <img src="https://img.shields.io/npm/v/@wbe/compose/latest.svg" alt="" />
          <img src="https://img.shields.io/bundlephobia/minzip/@wbe/compose.svg" alt="" />
          <img src="https://img.shields.io/bundlephobia/minzip/@wbe/compose.svg" alt="" />
        </div>
      </header>

      <main>
        <Link style={{ color: "black" }} to={"/docs/intro"}>
          DOC
        </Link>
      </main>
    </Layout>
  )
}
