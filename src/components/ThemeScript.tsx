"use client";

import { useServerInsertedHTML } from "next/navigation";

export function ThemeScript() {
  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const savedTheme = localStorage.getItem('pharmnode-theme') || 'dark';
                document.documentElement.setAttribute('data-theme', savedTheme);
              } catch (e) {}
            })()
          `,
        }}
      />
    );
  });

  return null;
}
