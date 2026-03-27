"use client";
import { useEffect, useRef } from "react";

export default function WorklogPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    function loadScript(src: string): Promise<void> {
      return new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => resolve(); // don't block on error
        document.head.appendChild(s);
      });
    }

    async function boot() {
      await loadScript("https://unpkg.com/vue@3/dist/vue.global.prod.js");
      await loadScript("https://cdn.jsdelivr.net/npm/chart.js");

      const res = await fetch("/worklog-app.html");
      const raw = await res.text();

      // Extract everything between <body> tags (skip the <script> CDN tags already loaded)
      const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      const content = bodyMatch ? bodyMatch[1] : raw;

      // Inject into a shadow-like wrapper to avoid React reconciler touching it
      const wrapper = document.createElement("div");
      wrapper.id = "wl-host";
      wrapper.style.cssText = "position:fixed;inset:0;z-index:0;";
      wrapper.innerHTML = content;

      // Patch API_BASE into the inline script before executing
      wrapper.querySelectorAll("script").forEach((old) => {
        const s = document.createElement("script");
        let code = old.textContent || "";
        // Replace the params.get('api') line with the actual URL
        code = code.replace(
          /const API_BASE = params\.get\('api'\) \|\| '';/,
          `const API_BASE = ${JSON.stringify(apiUrl)};`
        );
        s.textContent = code;
        old.replaceWith(s);
      });

      container.appendChild(wrapper);
    }

    boot().catch(console.error);

    return () => {
      // Cleanup on unmount
      const host = document.getElementById("wl-host");
      if (host) host.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", inset: 0, background: "rgb(8,12,28)" }}
    />
  );
}
