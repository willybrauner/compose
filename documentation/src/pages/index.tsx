import React, { useEffect } from "react"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
import styles from "./index.module.css"
import { useHistory } from "@docusaurus/router"

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  const history = useHistory()

  useEffect(() => {
    history.push("/compose/docs/intro")
  }, [])

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    />
  )
}
